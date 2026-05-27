/**
 * ingest.js — Data Normalization Layer
 *
 * Reads a person's digital exhaust in whatever format it arrives
 * and reduces it to a single representation: moments of attention,
 * located in time, tagged with metadata about what kind of attention.
 *
 * The output is an array of Attention objects. That's all a person is,
 * to this engine. Moments of attention. The rest is pattern matching.
 */

const fs = require('fs');
const path = require('path');

/**
 * An Attention object represents a single recorded instance of a person
 * paying attention to something. This is the atom from which all
 * analysis is built.
 *
 * @typedef {Object} Attention
 * @property {string} source       - Service that recorded this moment (spotify, twitter, goodreads, generic)
 * @property {string} type         - Kind of attention: play, skip, tweet, like, retweet, read, bookmark, note, search, share, listen, create
 * @property {string} subject      - What the attention was directed at
 * @property {string} [subjectId]  - Stable identifier for the subject
 * @property {Date}   timestamp    - When this moment of attention occurred
 * @property {Object} metadata     - Source-specific data
 */

/**
 * Main entry point. Reads all JSON files from the input directory
 * and normalizes them into a unified array of Attention objects.
 *
 * @param {string} inputDir - Path to directory containing JSON export files
 * @returns {{ attentions: Attention[], metadata: Object }}
 */
function ingest(inputDir) {
  const resolvedDir = path.resolve(inputDir);

  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Input directory does not exist: ${resolvedDir}`);
  }

  const entries = fs.readdirSync(resolvedDir);

  const files = entries
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const filePath = path.join(resolvedDir, f);
      return {
        name: f,
        path: filePath,
        content: readJSON(filePath)
      };
    })
    .filter(f => f.content !== null);

  if (files.length === 0) {
    throw new Error(`No JSON files found in ${resolvedDir}`);
  }

  const allAttentions = [];
  const sources = [];

  for (const file of files) {
    const detection = detectSourceType(file.name, file.content);

    if (!detection) {
      const generic = extractGeneric(file.name, file.content);
      if (generic.length > 0) {
        allAttentions.push(...generic);
        sources.push({ file: file.name, type: 'generic', count: generic.length });
      }
      continue;
    }

    let attentions = [];

    switch (detection.type) {
      case 'spotify':
        attentions = extractSpotify(file.content, detection.variant);
        break;
      case 'twitter':
        attentions = extractTwitter(file.content, detection.variant);
        break;
      case 'goodreads':
        attentions = extractGoodreads(file.content, detection.variant);
        break;
      case 'generic':
        attentions = extractGeneric(file.name, file.content);
        break;
    }

    allAttentions.push(...attentions);
    sources.push({
      file: file.name,
      type: detection.type,
      variant: detection.variant,
      count: attentions.length
    });
  }

  // Chronological order. Time is the spine.
  allAttentions.sort((a, b) => a.timestamp - b.timestamp);

  const metadata = computeMetadata(allAttentions, sources);

  return { attentions: allAttentions, metadata };
}

/**
 * Reads and parses a JSON file. Returns null on any failure
 * rather than throwing — a single corrupt file shouldn't kill
 * the entire ingestion.
 */
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Detects what kind of data export a file contains based on
 * structural signatures. Shape, not filename.
 *
 * Export formats are inconsistent across versions and platforms.
 * We detect by probing the data's anatomy, not by trusting
 * whatever the file happens to be named.
 */
function detectSourceType(filename, data) {
  if (!data || typeof data !== 'object') return null;

  // Spotify listening history — array of track objects
  if (Array.isArray(data) && data.length > 0 && data[0].trackName) {
    return { type: 'spotify', variant: 'listening-history' };
  }
  if (data.listeningHistory && Array.isArray(data.listeningHistory)) {
    return { type: 'spotify', variant: 'listening-history-wrapped' };
  }
  if (data.playlists && Array.isArray(data.playlists)) {
    return { type: 'spotify', variant: 'playlists' };
  }
  if (data.tracks && Array.isArray(data.tracks) && data.tracks[0]
      && (data.tracks[0].trackName || data.tracks[0].artistName)) {
    return { type: 'spotify', variant: 'tracks-array' };
  }

  // Twitter archive — multiple known envelope formats
  if (data.tweet || (Array.isArray(data) && data.length > 0
      && (data[0].tweet || data[0].full_text || data[0].id_str))) {
    return { type: 'twitter', variant: 'archive-v2' };
  }
  if (data.globalTwitterArchive) {
    return { type: 'twitter', variant: 'archive-v1' };
  }
  if (Array.isArray(data) && data.length > 0
      && data[0].in_reply_to_status_id !== undefined) {
    return { type: 'twitter', variant: 'tweets-array' };
  }

  // Goodreads export — books, reviews, or reading history
  if (data.books && Array.isArray(data.books)) {
    return { type: 'goodreads', variant: 'export' };
  }
  if (Array.isArray(data) && data.length > 0
      && data[0].title !== undefined
      && (data[0].readCount !== undefined
        || data[0].dateRead !== undefined
        || data[0].shelves !== undefined)) {
    return { type: 'goodreads', variant: 'books-array' };
  }
  if (data.reviews && Array.isArray(data.reviews)) {
    return { type: 'goodreads', variant: 'reviews' };
  }
  if (data.readingHistory && Array.isArray(data.readingHistory)) {
    return { type: 'goodreads', variant: 'reading-history' };
  }

  // Structured data with timestamps we can extract from
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    return { type: 'generic', variant: 'unknown' };
  }

  return null;
}

// ─── Spotify ────────────────────────────────────────────

function extractSpotify(data, variant) {
  const attentions = [];
  let tracks = [];

  if (variant === 'listening-history' && Array.isArray(data)) {
    tracks = data;
  } else if (variant === 'listening-history-wrapped') {
    tracks = data.listeningHistory;
  } else if (variant === 'tracks-array') {
    tracks = data.tracks;
  } else if (variant === 'playlists') {
    // Playlists are a different shape — each playlist contains tracks
    for (const playlist of data.playlists) {
      if (!Array.isArray(playlist.tracks)) continue;
      for (const track of playlist.tracks) {
        attentions.push({
          source: 'spotify',
          type: 'listen',
          subject: track.trackName || track.name || 'Unknown Track',
          subjectId: track.trackUri || track.trackId || null,
          timestamp: parseDate(track.playedAt || track.addedAt || track.timestamp),
          metadata: {
            artist: track.artistName || track.artist || null,
            album: track.albumName || track.album || null,
            playlist: playlist.name || null,
            collaborative: playlist.collaborative || false,
            isPlaylistAddition: !!(track.addedAt),
            playCount: track.playCount || track.count || 1
          }
        });
      }
    }
    return attentions;
  }

  for (const track of tracks) {
    const ts = parseDate(track.playedAt || track.ts || track.timestamp || track.endTime);
    if (!ts) continue;

    // A skip is an incomplete act of attention. Still worth recording —
    // the decision to stop is data too.
    const isSkip = track.skipped === true
      || (track.msPlayed !== undefined && track.msPlayed < 30000)
      || (track.duration_ms !== undefined
        && track.duration_ms > 30000
        && track.msPlayed !== undefined
        && track.msPlayed < track.duration_ms * 0.3);

    attentions.push({
      source: 'spotify',
      type: isSkip ? 'skip' : 'play',
      subject: track.trackName || track.name || track.track || 'Unknown Track',
      subjectId: track.trackUri || track.trackId || track.spotifyTrackUri || null,
      timestamp: ts,
      metadata: {
        artist: track.artistName || track.artist || track.artist_names || null,
        album: track.albumName || track.album || null,
        msPlayed: track.msPlayed || null,
        durationMs: track.duration_ms || track.durationMs || null,
        reasonStart: track.reasonStart || track.reason_start || null,
        reasonEnd: track.reasonEnd || track.reason_end || null,
        shuffle: track.shuffle || null,
        offline: track.offline || null,
        playSource: track.playSource || track.platform || null,
        skipped: isSkip
      }
    });
  }

  return attentions;
}

// ─── Twitter ────────────────────────────────────────────

function extractTwitter(data, variant) {
  const attentions = [];
  let tweets = [];

  if (variant === 'archive-v2' && Array.isArray(data)) {
    tweets = data.map(t => t.tweet || t);
  } else if (variant === 'archive-v1') {
    tweets = data.globalTwitterArchive.tweets || [];
  } else if (variant === 'tweets-array') {
    tweets = data;
  }

  for (const tweet of tweets) {
    const ts = parseDate(tweet.created_at || tweet.createdAt);
    if (!ts) continue;

    let type = 'tweet';
    let subject = tweet.full_text || tweet.text || tweet.tweet || '';
    let subjectId = tweet.id_str || tweet.id || null;

    // Classify the kind of speech
    const text = (tweet.full_text || tweet.text || '').toLowerCase();
    if (text.startsWith('rt @') || tweet.retweeted_status) {
      type = 'retweet';
      if (tweet.retweeted_status) {
        subject = tweet.retweeted_status.full_text
          || tweet.retweeted_status.text || '';
        subjectId = tweet.retweeted_status.id_str
          || tweet.retweeted_status.id || subjectId;
      }
    } else if (tweet.in_reply_to_status_id || tweet.in_reply_to_screen_name) {
      type = 'reply';
    }

    // A favorited tweet is a separate gesture of attention
    if (tweet.favorited === true) {
      attentions.push({
        source: 'twitter',
        type: 'like',
        subject: tweet.full_text || tweet.text || '',
        subjectId: tweet.id_str || tweet.id || null,
        timestamp: ts,
        metadata: {
          screenName: tweet.user ? tweet.user.screen_name : null,
          inReplyTo: tweet.in_reply_to_screen_name || null,
          isQuote: !!tweet.quoted_status_id,
          hashtags: extractHashtags(tweet),
          urls: extractUrls(tweet),
          mediaCount: countMedia(tweet)
        }
      });
    }

    attentions.push({
      source: 'twitter',
      type: type,
      subject: subject,
      subjectId: subjectId,
      timestamp: ts,
      metadata: {
        screenName: tweet.user ? tweet.user.screen_name : null,
        inReplyTo: tweet.in_reply_to_screen_name || null,
        inReplyToStatusId: tweet.in_reply_to_status_id
          || tweet.in_reply_to_status_id_str || null,
        isQuote: !!tweet.quoted_status_id,
        retweetCount: tweet.retweet_count || 0,
        favoriteCount: tweet.favorite_count || 0,
        replyCount: tweet.reply_count || 0,
        quoteCount: tweet.quote_count || 0,
        hashtags: extractHashtags(tweet),
        urls: extractUrls(tweet),
        mediaCount: countMedia(tweet),
        sensitive: tweet.possibly_sensitive || false,
        language: tweet.lang || null
      }
    });
  }

  return attentions;
}

function extractHashtags(tweet) {
  if (tweet.entities && Array.isArray(tweet.entities.hashtags)) {
    return tweet.entities.hashtags.map(h => h.text);
  }
  return [];
}

function extractUrls(tweet) {
  if (tweet.entities && Array.isArray(tweet.entities.urls)) {
    return tweet.entities.urls.map(u => u.expanded_url || u.url);
  }
  return [];
}

function countMedia(tweet) {
  if (tweet.extended_entities && tweet.extended_entities.media) {
    return tweet.extended_entities.media.length;
  }
  return 0;
}

// ─── Goodreads ──────────────────────────────────────────

function extractGoodreads(data, variant) {
  const attentions = [];
  let books = [];

  if (variant === 'export' && data.books) {
    books = data.books;
  } else if (variant === 'books-array') {
    books = data;
  } else if (variant === 'reviews' && data.reviews) {
    books = data.reviews.map(r => ({
      ...r.book,
      dateAdded: r.date_added || r.dateAdded,
      dateRead: r.date_read || r.dateRead,
      rating: r.rating,
      reviewText: r.body || r.reviewText,
      readCount: r.read_count || r.readCount || 1,
      shelves: r.shelves || r.bookshelves
    }));
  } else if (variant === 'reading-history') {
    books = data.readingHistory;
  }

  for (const book of books) {
    const title = book.title || book.Title || 'Unknown Book';
    const bookId = book.bookId || book.id || book.isbn || book.asin || null;
    const author = book.author || book.Author
      || (book.authors && book.authors[0] ? book.authors[0].name : null);
    const shelves = normalizeShelves(
      book.shelves || book.bookshelves || book.Bookshelves
    );
    const pageCount = book.pageCount || book.numPages || book.numberOfPages || null;

    // Added to shelf — the moment someone said "I want to read this"
    const dateAdded = parseDate(
      book.dateAdded || book.date_added || book.dateAddedToShelf
    );
    if (dateAdded) {
      attentions.push({
        source: 'goodreads',
        type: 'bookmark',
        subject: title,
        subjectId: bookId,
        timestamp: dateAdded,
        metadata: {
          author,
          shelves,
          isbn: book.isbn || book.isbn13 || null,
          pageCount,
          publisher: book.publisher || null,
          publicationYear: book.publicationYear || book.pubYear || null
        }
      });
    }

    // Finished reading — the completion of an arc
    const dateRead = parseDate(
      book.dateRead || book.date_read || book.readDate
    );
    if (dateRead) {
      attentions.push({
        source: 'goodreads',
        type: 'read',
        subject: title,
        subjectId: bookId,
        timestamp: dateRead,
        metadata: {
          author,
          rating: book.rating || book.myRating || null,
          shelves,
          isbn: book.isbn || book.isbn13 || null,
          pageCount,
          readCount: book.readCount || book.read_count || 1,
          exclusiveShelf: book.exclusiveShelf || book.exclusive_shelf || null
        }
      });
    }

    // Review — someone wanted to be heard
    const reviewText = book.reviewText || book.review || book.body;
    if (reviewText) {
      const reviewDate = parseDate(
        book.dateReviewed || book.date_reviewed || book.reviewDate
        || book.dateRead || book.date_read
      );
      if (reviewDate) {
        attentions.push({
          source: 'goodreads',
          type: 'note',
          subject: title,
          subjectId: bookId,
          timestamp: reviewDate,
          metadata: {
            author,
            reviewText: reviewText,
            rating: book.rating || book.myRating || null,
            shelves
          }
        });
      }
    }

    // Progress updates — page-by-page attention
    if (Array.isArray(book.progressUpdates)) {
      for (const update of book.progressUpdates) {
        const ts = parseDate(update.timestamp || update.date);
        if (!ts) continue;

        attentions.push({
          source: 'goodreads',
          type: 'read',
          subject: title,
          subjectId: bookId,
          timestamp: ts,
          metadata: {
            author,
            progress: update.progress || update.percent || null,
            page: update.page || null,
            isProgressUpdate: true
          }
        });
      }
    }
  }

  return attentions;
}

/**
 * Goodreads shelves come in many shapes: comma-separated strings,
 * arrays of strings, arrays of objects with a .name property.
 * Normalize them all to an array of strings.
 */
function normalizeShelves(shelves) {
  if (!shelves) return [];
  if (typeof shelves === 'string') {
    return shelves.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (Array.isArray(shelves)) {
    return shelves
      .map(s => typeof s === 'object' ? (s.name || s.shelf || s.id) : s)
      .filter(Boolean);
  }
  return [];
}

// ─── Generic ────────────────────────────────────────────
// For data that doesn't match a known format but has timestamps.
// We extract what we can.

function extractGeneric(filename, data) {
  const attentions = [];
  const sourceLabel = path.basename(filename, '.json')
    .toLowerCase()
    .replace(/[-_]/g, ' ');

  if (Array.isArray(data)) {
    for (const item of data) {
      if (typeof item !== 'object' || item === null) continue;

      const ts = findTimestamp(item);
      if (!ts) continue;

      const subject = findSubject(item);
      attentions.push({
        source: sourceLabel,
        type: inferType(item, filename),
        subject: truncate(subject, 500),
        subjectId: item.id || item._id || item.key || null,
        timestamp: ts,
        metadata: { filename, raw: extractRelevantFields(item) }
      });
    }
  } else if (typeof data === 'object') {
    // Single object — try to extract one attention event
    const ts = findTimestamp(data);
    if (ts) {
      const subject = findSubject(data);
      attentions.push({
        source: sourceLabel,
        type: inferType(data, filename),
        subject: truncate(subject, 500),
        subjectId: data.id || data._id || data.key || null,
        timestamp: ts,
        metadata: { filename, raw: extractRelevantFields(data) }
      });
    }

    // Probe for nested arrays that might contain timestamped items
    for (const [key, value] of Object.entries(data)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      if (typeof value[0] !== 'object') continue;

      for (const item of value) {
        const itemTs = findTimestamp(item);
        if (!itemTs) continue;

        const subject = findSubject(item) || `${key} item`;
        attentions.push({
          source: sourceLabel,
          type: inferType(item, filename),
          subject: truncate(subject, 500),
          subjectId: item.id || item._id || null,
          timestamp: itemTs,
          metadata: {
            filename,
            collection: key,
            raw: extractRelevantFields(item)
          }
        });
      }
    }
  }

  return attentions;
}

/**
 * Probes an object for the most likely timestamp field.
 */
function findTimestamp(item) {
  return parseDate(
    item.timestamp || item.date || item.createdAt || item.created_at
    || item.time || item.datetime || item.updatedAt || item.lastModified
  );
}

/**
 * Probes an object for the most likely subject/text field.
 */
function findSubject(item) {
  return item.title || item.text || item.content || item.body
    || item.name || item.message || item.description
    || item.value || item.note || '';
}

/**
 * Guesses the type of attention based on available clues.
 */
function inferType(item, filename) {
  const fname = filename.toLowerCase();

  // Explicit type declarations
  if (item.type === 'note' || item.type === 'reminder') return 'note';
  if (item.type === 'draft') return 'create';
  if (item.type === 'search' || item.type === 'query') return 'search';
  if (item.type === 'share') return 'share';

  // Filename hints
  if (fname.includes('note') || fname.includes('memo')) return 'note';
  if (fname.includes('search')) return 'search';

  // Structural hints
  if (item.query || item.searchTerm) return 'search';
  if (item.draft || item.isDraft) return 'create';
  if (item.recipient || item.to || item.sendTo) return 'share';
  if (item.reminder || item.dueDate || item.alarm) return 'note';

  return 'create';
}

/**
 * Extracts primitive fields from an item for metadata storage.
 * Skips identifiers, timestamps, and anything non-serializable.
 * Filters out deeply nested objects — we want the surface only.
 */
function extractRelevantFields(item) {
  const relevant = {};
  const skipKeys = new Set([
    'id', '_id', 'key', 'timestamp', 'date', 'createdAt', 'created_at',
    'updatedAt', 'updated_at', 'datetime', 'time', '__v', '__typename',
    'type', 'format', 'version'
  ]);

  for (const [key, value] of Object.entries(item)) {
    if (skipKeys.has(key)) continue;
    if (typeof value === 'function') continue;

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      relevant[key] = value;
    } else if (Array.isArray(value) && value.length <= 20) {
      const isFlat = value.every(
        v => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      );
      if (isFlat) relevant[key] = value;
    }
  }

  return relevant;
}

// ─── Date Parsing ───────────────────────────────────────

/**
 * Attempts to parse a date from input that could be:
 * - A Date object
 * - A Unix timestamp (seconds or milliseconds)
 * - An ISO 8601 string
 * - A common date format string
 *
 * Returns null if parsing fails. Never throws.
 */
function parseDate(raw) {
  if (!raw) return null;

  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  // Unix timestamp — disambiguate seconds from milliseconds
  if (typeof raw === 'number') {
    const ms = raw > 1e12 ? raw : raw * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (trimmed === '') return null;

  // Try standard JS Date parsing
  let d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  // "2023/03/14" or "2023-03-14" — date only, no time
  const dateOnly = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (dateOnly) {
    d = new Date(
      parseInt(dateOnly[1]),
      parseInt(dateOnly[2]) - 1,
      parseInt(dateOnly[3])
    );
    if (!isNaN(d.getTime())) return d;
  }

  // ISO-ish datetime without explicit timezone — assume UTC
  const isoish = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
  if (isoish) {
    const hasTimezone = trimmed.includes('+') || trimmed.includes('Z');
    d = new Date(hasTimezone ? trimmed : trimmed + 'Z');
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

// ─── Metadata ──────────────────────────────────────────

/**
 * Computes summary metadata over the full set of attention events.
 * This feeds the methodology section and the top-level stats
 * that appear in the generated memorial.
 */
function computeMetadata(attentions, sources) {
  const firstTimestamp = attentions.length > 0
    ? attentions[0].timestamp : null;
  const lastTimestamp = attentions.length > 0
    ? attentions[attentions.length - 1].timestamp : null;

  const bySource = {};
  const byType = {};
  for (const a of attentions) {
    bySource[a.source] = (bySource[a.source] || 0) + 1;
    byType[a.type] = (byType[a.type] || 0) + 1;
  }

  const uniqueSubjects = new Set(
    attentions.map(a => a.subjectId || a.subject)
  ).size;

  // Find the longest silence — the longest gap between consecutive
  // recorded moments of attention. Often meaningful.
  let longestGapMs = 0;
  let gapStart = null;
  let gapEnd = null;

  for (let i = 1; i < attentions.length; i++) {
    const gapMs = attentions[i].timestamp - attentions[i - 1].timestamp;
    if (gapMs > longestGapMs) {
      longestGapMs = gapMs;
      gapStart = attentions[i - 1].timestamp;
      gapEnd = attentions[i].timestamp;
    }
  }

  return {
    totalAttentionEvents: attentions.length,
    uniqueSubjects,
    timeRange: {
      start: firstTimestamp,
      end: lastTimestamp,
      spanDays: firstTimestamp && lastTimestamp
        ? (lastTimestamp - firstTimestamp) / (1000 * 60 * 60 * 24)
        : 0
    },
    sources,
    bySource,
    byType,
    longestGap: {
      durationDays: longestGapMs / (1000 * 60 * 60 * 24),
      start: gapStart,
      end: gapEnd
    },
    ingestionDate: new Date().toISOString()
  };
}

/**
 * Truncates a string to maxLength, appending ellipsis if needed.
 */
function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

module.exports = { ingest };
