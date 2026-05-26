/**
 * UNFOLLOW
 * 
 * Phases of degradation:
 *   CLEAN     0–15%   Words arrive as typed
 *   WHISPERS  15–40%  Occasional characters fade or vanish
 *   EROSION   40–65%  Frequent drops, spacing warps, cursor wobbles
 *   CLARITY   65–70%  One sentence rendered perfectly
 *   COLLAPSE  70–100% Accelerating failure, cursor abandons
 *   RUINS     final   Damaged text held on screen, cursor fades
 */

(() => {
  // --- Elements ---
  const instructions = document.getElementById('instructions');
  const surface      = document.getElementById('surface');
  const textBody     = document.getElementById('text-body');
  const cursor       = document.getElementById('cursor');

  // --- State ---
  let started       = false;
  let finished       = false;
  let chars          = [];
  let rawText        = '';
  let clarityDone    = false;
  let ruinTimer      = null;

  // Thresholds (character count based)
  const C_WHISPER  = 40;
  const C_EROSION  = 120;
  const C_CLARITY  = 200;
  const C_CLARITY_END = 220;
  const C_COLLAPSE = 230;
  const C_RUIN     = 380;
  const C_FORCE    = 460;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Helpers ---

  function phase() {
    const n = chars.length;
    if (n < C_WHISPER)                          return 'clean';
    if (n < C_EROSION)                          return 'whisper';
    if (n < C_CLARITY)                          return 'erosion';
    if (n < C_CLARITY_END && !clarityDone)      return 'clarity';
    if (n < C_RUIN)                             return 'collapse';
    return 'ruin';
  }

  function rand(a, b) {
    return Math.random() * (b - a) + a;
  }

  function chance(threshold) {
    return Math.random() < threshold;
  }

  function drift() {
    if (reducedMotion) return 0;
    return rand(-3, 3);
  }

  // --- Character node creation ---

  function makeChar(ch, cls) {
    const span = document.createElement('span');
    span.className = 'char' + (cls ? ' ' + cls : '');
    span.textContent = ch;
    return span;
  }

  // --- Insert character (main input handler) ---

  function insertChar(ch) {
    const p = phase();
    let cls = '';

    switch (p) {
      case 'clean':
        // Unchanged
        break;

      case 'whisper': {
        const r = Math.random();
        if (r < 0.12)       cls = 'faded';
        else if (r < 0.19)  cls = 'lost';
        break;
      }

      case 'erosion': {
        const r = Math.random();
        if (r < 0.28)       cls = 'lost';
        else if (r < 0.42)  cls = 'faded';
        else if (r < 0.48)  cls = 'struck';
        else if (r < 0.52)  cls = 'whisper';
        break;
      }

      case 'clarity':
        // Perfect — no degradation
        break;

      case 'collapse': {
        const r = Math.random();
        if (r < 0.42)       cls = 'lost';
        else if (r < 0.58)  cls = 'faded';
        else if (r < 0.65)  cls = 'struck';
        else if (r < 0.70)  cls = 'gone';
        else if (r < 0.76)  cls = 'whisper';
        break;
      }

      case 'ruin': {
        const r = Math.random();
        if (r < 0.55)       cls = 'gone';
        else if (r < 0.78)  cls = 'lost';
        else if (r < 0.92)  cls = 'faded';
        else                cls = 'struck';
        break;
      }
    }

    const node = makeChar(ch, cls);
    textBody.appendChild(node);
    chars.push(node);
    rawText += ch;

    // Trigger clarity moment: wrap the current sentence
    if (p === 'clarity' && !clarityDone && rawText.length >= C_CLARITY) {
      wrapClaritySentence();
    }

    applyPhaseEffects(p);
    scrollToBottom();

    // Check if we should force end
    if (chars.length >= C_FORCE && !finished) {
      endRuins();
    }
  }

  function insertNewline() {
    const br = document.createElement('br');
    textBody.appendChild(br);
    chars.push(br);
    rawText += '\n';
    scrollToBottom();
  }

  // --- Clarity: wrap the last sentence in a highlight ---

  function wrapClaritySentence() {
    clarityDone = true;

    // Find the last sentence-ending punctuation, walk back to previous one
    let end = rawText.length - 1;
    while (end >= 0 && /[.!?]/.test(rawText[end])) end--;
    if (end < 0) end = 0;

    let start = end - 1;
    while (start >= 0 && !/[.!?]/.test(rawText[start])) start--;
    start++;

    if (end <= start) return;

    const wrapper = document.createElement('span');
    wrapper.className = 'clarity-line';

    // Move char nodes into wrapper
    const spanNodes = chars.slice(start, end + 1).filter(n => n.nodeType === 1 && n.classList && n.classList.contains('char'));
    if (spanNodes.length === 0) return;

    spanNodes[0].parentNode.insertBefore(wrapper, spanNodes[0]);
    spanNodes.forEach(n => wrapper.appendChild(n));
  }

  // --- Visual effects per phase ---

  function applyPhaseEffects(p) {
    const root = document.documentElement.style;
    const area = document.getElementById('writing-area');

    switch (p) {
      case 'clean':
        break;

      case 'whisper':
        cursor.style.setProperty('--cursor-drift', drift() + 'px');
        break;

      case 'erosion':
        cursor.style.setProperty('--cursor-drift', (drift() * 2.5) + 'px');
        root.setProperty('--noise-opacity', '0.03');
        area.style.letterSpacing = rand(0.02, 0.06) + 'em';
        area.style.wordSpacing   = rand(0.15, 0.35) + 'em';
        break;

      case 'clarity':
        cursor.style.setProperty('--cursor-drift', '0px');
        root.setProperty('--glow-color', 'rgba(26,23,20,0.15)');
        root.setProperty('--noise-opacity', '0');
        area.style.letterSpacing = '0.03em';
        area.style.wordSpacing   = '0.18em';
        break;

      case 'collapse':
        cursor.style.setProperty('--cursor-drift', (drift() * 4) + 'px');
        root.setProperty('--noise-opacity', '0.06');
        root.setProperty('--blur-amount', rand(0, 0.6) + 'px');
        root.setProperty('--skew-amount', rand(-0.15, 0.15) + 'deg');
        root.setProperty('--paper-shift', rand(-4, 4) + 'px');
        area.style.letterSpacing = rand(0.04, 0.14) + 'em';
        area.style.wordSpacing   = rand(0.2, 0.5) + 'em';
        area.style.lineHeight    = String(rand(1.9, 2.6));
        break;

      case 'ruin':
        break;
    }
  }

  // --- Ending ---

  function endRuins() {
    if (finished) return;
    finished = true;

    surface.classList.add('ruin');
    cursor.style.setProperty('--cursor-opacity', '0.15');

    // Let the cursor blink a few more times, then fade to nothing
    ruinTimer = setTimeout(() => {
      cursor.style.setProperty('--cursor-opacity', '0');
      cursor.style.transition = 'opacity 4s ease';
      // Final hold — nothing more happens
    }, 3000);
  }

  // --- Scroll ---

  function scrollToBottom() {
    surface.scrollTop = surface.scrollHeight;
  }

  // --- Input handling ---

  function handleKey(e) {
    if (!started || finished) return;

    // Ignore modifier combos
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      insertNewline();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      // Remove last char node
      if (chars.length > 0) {
        const last = chars.pop();
        rawText = rawText.slice(0, -1);
        if (last.parentNode) last.parentNode.removeChild(last);
      }
      return;
    }

    // Only process printable characters
    if (e.key.length !== 1) return;

    e.preventDefault();
    insertChar(e.key);
  }

  // --- Start ---

  function begin() {
    if (started) return;
    started = true;
    instructions.classList.add('hidden');
    // Focus hack to receive key events
    document.body.focus();
  }

  // --- Bind ---

  instructions.addEventListener('click', begin);
  instructions.addEventListener('touchend', (e) => {
    e.preventDefault();
    begin();
  });

  document.addEventListener('keydown', (e) => {
    if (!started) {
      begin();
      return;
    }
    handleKey(e);
  });

  // Keep body focused
  document.body.setAttribute('tabindex', '-1');
  document.body.style.outline = 'none';

})();
