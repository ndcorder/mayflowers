/**
 * theology.js — Interpretive framework definitions and pattern-matching engine
 *
 * Converts environmental event histories into belief states and doctrinal shifts.
 * People possess interpretive frameworks that assign meaning to patterns they
 * experience. The player NEVER sees these directly — only the architectural
 * and behavioral consequences: temple orientation, ritual site placement,
 * settlement patterns, migration directions.
 */

const Theology = (() => {

  // ── Interpretive Frameworks ──────────────────────
  const FRAMEWORKS = {
    animism: {
      id: 'animism',
      preferences: {
        templeLocation: 'natural',
        templeOrientation: 'organic',
        ritualSite: 'grove',
        sacrificeType: 'none',
        burialPractice: 'ground',
        settlementPattern: 'dispersed',
        migrationBias: 'water',
        sacredColors: ['#2d5a1e', '#1a4a3a', '#4a6b2a'],
        sacredDirection: null
      },
      weights: {
        rain: +0.3, drought: -0.2,
        tectonicUp: -0.1, tectonicDown: -0.1,
        lightning: +0.2, flood: -0.3
      }
    },

    skyGod: {
      id: 'skyGod',
      preferences: {
        templeLocation: 'elevated',
        templeOrientation: 'celestial',
        ritualSite: 'peak',
        sacrificeType: 'animal',
        burialPractice: 'sky',
        settlementPattern: 'elevated',
        migrationBias: 'highland',
        sacredColors: ['#c4a035', '#4a6b8a', '#e8d070'],
        sacredDirection: 'east'
      },
      weights: {
        rain: +0.4, drought: -0.5,
        tectonicUp: +0.1, tectonicDown: -0.2,
        lightning: +0.6, flood: -0.1
      }
    },

    earthMother: {
      id: 'earthMother',
      preferences: {
        templeLocation: 'lowland',
        templeOrientation: 'cardinal',
        ritualSite: 'spring',
        sacrificeType: 'grain',
        burialPractice: 'mound',
        settlementPattern: 'fertile',
        migrationBias: 'fertile',
        sacredColors: ['#5a3a1e', '#3a6b2a', '#7a5a30'],
        sacredDirection: 'center'
      },
      weights: {
        rain: +0.5, drought: -0.6,
        tectonicUp: -0.3, tectonicDown: -0.3,
        lightning: -0.2, flood: +0.2
      }
    },

    stormLord: {
      id: 'stormLord',
      preferences: {
        templeLocation: 'exposed',
        templeOrientation: 'wind',
        ritualSite: 'cliff',
        sacrificeType: 'blood',
        burialPractice: 'pyre',
        settlementPattern: 'defensible',
        migrationBias: 'storm',
        sacredColors: ['#2a2a4a', '#6a6a8a', '#4a4a6a'],
        sacredDirection: 'north'
      },
      weights: {
        rain: +0.1, drought: +0.2,
        tectonicUp: +0.4, tectonicDown: +0.4,
        lightning: +0.8, flood: +0.5
      }
    },

    ancestorVeneration: {
      id: 'ancestorVeneration',
      preferences: {
        templeLocation: 'ancestral',
        templeOrientation: 'ancestral',
        ritualSite: 'tomb',
        sacrificeType: 'libation',
        burialPractice: 'catacomb',
        settlementPattern: 'ancestral',
        migrationBias: 'ancestral',
        sacredColors: ['#4a3a2a', '#6a5a4a', '#3a2a1a'],
        sacredDirection: 'west'
      },
      weights: {
        rain: +0.2, drought: -0.4,
        tectonicUp: -0.5, tectonicDown: +0.3,
        lightning: -0.1, flood: -0.6
      }
    },

    riverCult: {
      id: 'riverCult',
      preferences: {
        templeLocation: 'waterside',
        templeOrientation: 'downstream',
        ritualSite: 'riverbed',
        sacrificeType: 'drowning',
        burialPractice: 'water',
        settlementPattern: 'riparian',
        migrationBias: 'downstream',
        sacredColors: ['#1a4a6a', '#2a6a8a', '#3a8aaa'],
        sacredDirection: 'downhill'
      },
      weights: {
        rain: +0.6, drought: -0.7,
        tectonicUp: -0.1, tectonicDown: +0.2,
        lightning: 0.0, flood: +0.7
      }
    }
  };

  // ── Belief State ─────────────────────────────────
  class BeliefState {
    constructor() {
      this.affinities = {};
      for (const id in FRAMEWORKS) {
        this.affinities[id] = 0.1;
      }
      this.affinities.animism = 0.5;

      this.dominantFramework   = 'animism';
      this.doctrinalStrength   = 0.3;
      this.doctrinalTensions   = {};
      this.ritualUrgency       = 0;
      this.perceivedDivineMood = 'neutral';
      this.omenMemory          = [];
      this.evangelismDrive     = 0;
      this.architecturalDirectives = [];
      this.tabooHexes          = [];
      this.sacredHexes         = [];
    }

    clone() {
      const c = new BeliefState();
      c.affinities            = { ...this.affinities };
      c.dominantFramework     = this.dominantFramework;
      c.doctrinalStrength     = this.doctrinalStrength;
      c.doctrinalTensions     = { ...this.doctrinalTensions };
      c.ritualUrgency         = this.ritualUrgency;
      c.perceivedDivineMood   = this.perceivedDivineMood;
      c.omenMemory            = this.omenMemory.slice(-20);
      c.evangelismDrive       = this.evangelismDrive;
      c.architecturalDirectives = this.architecturalDirectives.slice(-5);
      c.tabooHexes            = this.tabooHexes.slice(-10);
      c.sacredHexes           = this.sacredHexes.slice(-10);
      return c;
    }
  }

  // ── Pattern Detection ────────────────────────────
  const PatternDetect = {
    cluster(events, type, timeWindow, spatialRadius) {
      if (events.length === 0) return [];

      const latestTime = events[events.length - 1].time;
      const recent = events.filter(
        e => e.type === type && e.time > latestTime - timeWindow
      );

      const clusters = [];
      for (let i = 0; i < recent.length; i++) {
        const center = recent[i];
        let clusterSize = 1;
        for (let j = i + 1; j < recent.length; j++) {
          const other = recent[j];
          const dist = Math.max(
            Math.abs(center.centerQ - other.centerQ),
            Math.abs(center.centerR - other.centerR),
            Math.abs((center.centerQ - other.centerQ) + (center.centerR - other.centerR))
          );
          if (dist <= spatialRadius) clusterSize++;
        }
        if (clusterSize >= 3) {
          clusters.push({
            centerQ: center.centerQ,
            centerR: center.centerR,
            size: clusterSize,
            time: center.time,
            type
          });
        }
      }
      return clusters;
    },

    direction(events, type, timeWindow) {
      if (events.length === 0) return null;

      const latestTime = events[events.length - 1].time;
      const recent = events.filter(
        e => e.type === type && e.time > latestTime - timeWindow
      );
      if (recent.length < 3) return null;

      let dq = 0, dr = 0;
      for (let i = 1; i < recent.length; i++) {
        dq += recent[i].centerQ - recent[i - 1].centerQ;
        dr += recent[i].centerR - recent[i - 1].centerR;
      }
      dq /= (recent.length - 1);
      dr /= (recent.length - 1);

      const magnitude = Math.sqrt(dq * dq + dr * dr);
      if (magnitude > 0.5) {
        return { dq: dq / magnitude, dr: dr / magnitude, magnitude, type };
      }
      return null;
    },

    rhythm(events, type) {
      const typed = events.filter(e => e.type === type);
      if (typed.length < 4) return null;

      const intervals = [];
      for (let i = 1; i < typed.length; i++) {
        intervals.push(typed[i].time - typed[i - 1].time);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce(
        (a, b) => a + Math.pow(b - avgInterval, 2), 0
      ) / intervals.length;

      if (variance < avgInterval * 0.3) {
        return {
          type,
          regularity: 1 - (variance / (avgInterval * 0.3)),
          interval: avgInterval
        };
      }
      return null;
    },

    coupling(events, typeA, typeB, timeWindow) {
      const aEvents = events.filter(e => e.type === typeA);
      if (aEvents.length < 3) return null;

      let cooccurring = 0;
      for (const a of aEvents) {
        if (events.some(
          e => e.type === typeB && Math.abs(e.time - a.time) < timeWindow
        )) {
          cooccurring++;
        }
      }

      if (cooccurring / aEvents.length > 0.6) {
        return {
          typeA, typeB,
          strength: cooccurring / aEvents.length,
          count: cooccurring
        };
      }
      return null;
    },

    escalation(events, type, timeWindow) {
      if (events.length === 0) return null;

      const latestTime = events[events.length - 1].time;
      const recent = events.filter(
        e => e.type === type && e.time > latestTime - timeWindow
      );
      if (recent.length < 3) return null;

      let escalating = 0;
      for (let i = 1; i < recent.length; i++) {
        if (recent[i].intensity > recent[i - 1].intensity) escalating++;
      }

      const ratio = escalating / (recent.length - 1);
      if (ratio > 0.6)  return { type, escalating: true,  ratio };
      if (ratio < 0.3)  return { type, escalating: false, ratio };
      return null;
    }
  };

  // ── Theology Engine ──────────────────────────────
  class TheologyEngine {
    constructor() {
      this.beliefStates      = new Map();
      this.globalEventMemory = [];
    }

    createBeliefState(popId) {
      const state = new BeliefState();
      this.beliefStates.set(popId, state);
      return state;
    }

    removeBeliefState(popId) {
      this.beliefStates.delete(popId);
    }

    getBeliefState(popId) {
      return this.beliefStates.get(popId);
    }

    setBeliefState(popId, state) {
      this.beliefStates.set(popId, state);
    }

    update(events, currentTime, dt) {
      // Ingest new events
      for (const e of events) {
        if (!this.globalEventMemory.some(m => m.id === e.id)) {
          this.globalEventMemory.push(e);
        }
      }
      if (this.globalEventMemory.length > 1000) {
        this.globalEventMemory = this.globalEventMemory.slice(-800);
      }

      for (const [popId, beliefState] of this.beliefStates) {
        this._updateBeliefState(popId, beliefState, currentTime, dt);
      }
    }

    _updateBeliefState(popId, state, currentTime, dt) {
      const recentEvents = this.globalEventMemory.filter(
        e => e.time > currentTime - 500
      );

      if (recentEvents.length === 0) {
        state.ritualUrgency = Math.max(0, state.ritualUrgency - 0.001 * dt);
        if (state.ritualUrgency < 0.1) {
          state.perceivedDivineMood = 'absent';
        }
        return;
      }

      // ── Pattern detection ───────────────────────
      const clusters = [];
      for (const type of ['rain', 'drought', 'lightning', 'flood']) {
        clusters.push(...PatternDetect.cluster(recentEvents, type, 300, 5));
      }

      const directions = [];
      for (const type of ['rain', 'lightning', 'tectonic']) {
        const d = PatternDetect.direction(recentEvents, type, 300);
        if (d) directions.push(d);
      }

      const rhythms = [];
      for (const type of ['rain', 'drought', 'lightning']) {
        const r = PatternDetect.rhythm(recentEvents, type);
        if (r) rhythms.push(r);
      }

      const couplings = [];
      const couplingPairs = [
        ['rain', 'lightning'], ['drought', 'flood'],
        ['flood', 'rain'],     ['tectonic', 'lightning']
      ];
      for (const [a, b] of couplingPairs) {
        const c = PatternDetect.coupling(recentEvents, a, b, 50);
        if (c) couplings.push(c);
      }

      const escalations = [];
      for (const type of ['rain', 'drought', 'lightning']) {
        const e = PatternDetect.escalation(recentEvents, type, 300);
        if (e) escalations.push(e);
      }

      // ── Generate omens ──────────────────────────
      const newOmens = [];

      for (const cluster of clusters) {
        newOmens.push({
          type: 'cluster', eventType: cluster.type,
          q: cluster.centerQ, r: cluster.centerR,
          significance: cluster.size * 0.1,
          time: currentTime
        });
      }

      for (const dir of directions) {
        newOmens.push({
          type: 'direction', eventType: dir.type,
          dq: dir.dq, dr: dir.dr,
          significance: dir.magnitude * 0.2,
          time: currentTime
        });
      }

      for (const rhythm of rhythms) {
        newOmens.push({
          type: 'rhythm', eventType: rhythm.type,
          interval: rhythm.interval,
          significance: rhythm.regularity * 0.3,
          time: currentTime
        });
      }

      for (const coupling of couplings) {
        newOmens.push({
          type: 'coupling',
          types: [coupling.typeA, coupling.typeB],
          significance: coupling.strength * 0.2,
          time: currentTime
        });
      }

      for (const esc of escalations) {
        newOmens.push({
          type: 'escalation', eventType: esc.type,
          escalating: esc.escalating,
          significance: 0.3,
          time: currentTime
        });
      }

      state.omenMemory.push(...newOmens);
      state.omenMemory = state.omenMemory
        .filter(o => o.time > currentTime - 400)
        .slice(-30);

      // ── Update framework affinities ─────────────
      const eventCounts = {};
      for (const type of ['rain', 'drought', 'tectonic', 'lightning', 'flood']) {
        eventCounts[type] = recentEvents.filter(e => e.type === type).length;
      }

      const totalEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0);

      if (totalEvents > 0) {
        const scores = {};
        for (const [fwId, fw] of Object.entries(FRAMEWORKS)) {
          let score = 0;
          for (const [eventType, weight] of Object.entries(fw.weights)) {
            if (eventType === 'tectonicUp') {
              score += recentEvents.filter(e => e.type === 'tectonic' && e.raise).length * weight;
            } else if (eventType === 'tectonicDown') {
              score += recentEvents.filter(e => e.type === 'tectonic' && !e.raise).length * weight;
            } else {
              score += (eventCounts[eventType] || 0) * weight;
            }
          }
          scores[fwId] = score / totalEvents;
        }

        const maxScore  = Math.max(...Object.values(scores));
        const minScore  = Math.min(...Object.values(scores));
        const scoreRange = maxScore - minScore || 1;

        for (const fwId in scores) {
          const normalized = (scores[fwId] - minScore) / scoreRange;
          const targetAffinity = 0.1 + normalized * 0.7;
          const drift = (targetAffinity - state.affinities[fwId]) * 0.002 * dt;
          state.affinities[fwId] = Math.max(
            0, Math.min(1, state.affinities[fwId] + drift)
          );
        }
      }

      // Pattern-based affinity boosts
      for (const omen of newOmens) {
        if (omen.type === 'cluster' && omen.eventType === 'lightning') {
          state.affinities.stormLord =
            Math.min(1, state.affinities.stormLord + omen.significance * 0.01);
          state.affinities.skyGod =
            Math.min(1, state.affinities.skyGod + omen.significance * 0.005);
        }
        if (omen.type === 'cluster' && omen.eventType === 'rain') {
          state.affinities.riverCult =
            Math.min(1, state.affinities.riverCult + omen.significance * 0.01);
          state.affinities.earthMother =
            Math.min(1, state.affinities.earthMother + omen.significance * 0.005);
        }
        if (omen.type === 'rhythm') {
          state.affinities.ancestorVeneration =
            Math.min(1, state.affinities.ancestorVeneration + omen.significance * 0.008);
        }
        if (omen.type === 'direction') {
          state.affinities.skyGod =
            Math.min(1, state.affinities.skyGod + omen.significance * 0.005);
        }
      }

      // Normalize affinities to sum to 1
      const affinitySum = Object.values(state.affinities).reduce((a, b) => a + b, 0);
      if (affinitySum > 0) {
        for (const fwId in state.affinities) {
          state.affinities[fwId] /= affinitySum;
        }
      }

      // ── Dominant framework ──────────────────────
      let maxAffinity = 0;
      let dominant = state.dominantFramework;
      for (const [fwId, aff] of Object.entries(state.affinities)) {
        if (aff > maxAffinity) {
          maxAffinity = aff;
          dominant = fwId;
        }
      }

      if (dominant !== state.dominantFramework) {
        const currentAff = state.affinities[state.dominantFramework];
        const newAff     = state.affinities[dominant];
        if (newAff > currentAff * 1.3) {
          state.dominantFramework = dominant;
          state.evangelismDrive   = Math.min(1, state.evangelismDrive + 0.2);
        }
      }

      const sortedAffinities = Object.values(state.affinities).sort((a, b) => b - a);
      state.doctrinalStrength = sortedAffinities[0] - (sortedAffinities[1] || 0);

      // ── Doctrinal tensions ──────────────────────
      state.doctrinalTensions = {};
      for (const [fwId, aff] of Object.entries(state.affinities)) {
        if (fwId !== state.dominantFramework && aff > 0.15) {
          state.doctrinalTensions[fwId] = aff;
        }
      }

      // ── Divine mood ─────────────────────────────
      const fw = FRAMEWORKS[state.dominantFramework];
      let moodScore = 0;
      for (const [eventType, weight] of Object.entries(fw.weights)) {
        const count = eventCounts[eventType] || 0;
        moodScore += count * weight;
      }
      if (totalEvents > 0) moodScore /= totalEvents;

      if (totalEvents === 0) {
        state.perceivedDivineMood = 'absent';
      } else if (moodScore > 0.3) {
        state.perceivedDivineMood = 'pleased';
      } else if (moodScore > 0) {
        state.perceivedDivineMood = 'neutral';
      } else if (moodScore > -0.3) {
        state.perceivedDivineMood = 'testing';
      } else {
        state.perceivedDivineMood = 'wrathful';
      }

      // ── Ritual urgency ──────────────────────────
      for (const esc of escalations) {
        if (esc.escalating) {
          state.ritualUrgency = Math.min(1, state.ritualUrgency + 0.05 * dt);
        }
      }
      state.ritualUrgency = Math.max(0, state.ritualUrgency - 0.002 * dt);
      if (totalEvents > 10) {
        state.ritualUrgency = Math.min(1, state.ritualUrgency + 0.01 * dt);
      }

      // ── Architectural directives ────────────────
      state.architecturalDirectives = [];
      const prefs = fw.preferences;

      // Sacred sites from clusters
      for (const cluster of clusters) {
        if (cluster.size >= 3) {
          state.sacredHexes.push({
            q: cluster.centerQ, r: cluster.centerR,
            reason: `divine_${cluster.type}_cluster`,
            framework: state.dominantFramework,
            strength: Math.min(1, cluster.size * 0.15),
            time: currentTime
          });
          state.architecturalDirectives.push({
            type: 'ritual_site',
            q: cluster.centerQ, r: cluster.centerR,
            style: prefs.ritualSite,
            priority: cluster.size * 0.1
          });
        }
      }

      // Lightning strikes: sacred or taboo depending on framework
      const lightningEvents = recentEvents.filter(e => e.type === 'lightning');
      for (const le of lightningEvents) {
        if (state.dominantFramework === 'stormLord' ||
            state.dominantFramework === 'animism') {
          state.sacredHexes.push({
            q: le.centerQ, r: le.centerR,
            reason: state.dominantFramework === 'stormLord'
              ? 'lightning_strike' : 'spirit_manifestation',
            framework: state.dominantFramework,
            strength: state.dominantFramework === 'stormLord' ? 0.8 : 0.5,
            time: currentTime
          });
        } else {
          state.tabooHexes.push({
            q: le.centerQ, r: le.centerR,
            reason: 'divine_judgment',
            strength: 0.6,
            time: currentTime
          });
        }
      }

      // Flood sites are sacred to the river cult
      if (state.dominantFramework === 'riverCult') {
        for (const fe of recentEvents.filter(e => e.type === 'flood')) {
          state.sacredHexes.push({
            q: fe.centerQ, r: fe.centerR,
            reason: 'flood_blessing',
            framework: 'riverCult',
            strength: 0.7,
            time: currentTime
          });
        }
      }

      // Tectonic events disturb ancestors
      if (state.dominantFramework === 'ancestorVeneration') {
        for (const te of recentEvents.filter(e => e.type === 'tectonic')) {
          state.tabooHexes.push({
            q: te.centerQ, r: te.centerR,
            reason: 'ancestors_disturbed',
            strength: 0.9,
            time: currentTime
          });
        }
      }

      // Trim stale entries
      state.sacredHexes = state.sacredHexes
        .filter(h => h.time > currentTime - 600)
        .slice(-15);
      state.tabooHexes = state.tabooHexes
        .filter(h => h.time > currentTime - 400)
        .slice(-15);

      // Direction-based temple orientation
      if (directions.length > 0 && state.doctrinalStrength > 0.2) {
        state.architecturalDirectives.push({
          type: 'temple_orientation',
          dq: directions[0].dq,
          dr: directions[0].dr,
          eventType: directions[0].type,
          priority: directions[0].magnitude * 0.2
        });
      }

      state.evangelismDrive = Math.max(0, state.evangelismDrive - 0.003 * dt);
    }

    /**
     * Get behavioral modifiers for a population.
     * NO BELIEF TEXT — only behavioral outputs the player can observe.
     */
    getBehavioralModifiers(popId) {
      const state = this.beliefStates.get(popId);
      if (!state) return null;

      const fw    = FRAMEWORKS[state.dominantFramework];
      const prefs = fw.preferences;

      return {
        // Location preferences
        preferredElevation: prefs.templeLocation === 'elevated' ? 0.7 :
                             prefs.templeLocation === 'lowland'  ? 0.3 : 0.5,
        preferredMoisture:  prefs.templeLocation === 'waterside' ? 0.7 :
                             prefs.templeLocation === 'natural'  ? 0.4 : 0.5,
        preferCoastal:      prefs.templeLocation === 'waterside',

        // Movement
        migrationBias:    prefs.migrationBias,
        reluctanceToLeave: prefs.migrationBias === 'ancestral' ? 0.8 :
                            prefs.migrationBias === 'center'   ? 0.6 : 0.3,

        // Architecture
        templeStyle:       prefs.templeLocation,
        templeOrientation: prefs.templeOrientation,
        ritualSiteStyle:   prefs.ritualSite,
        sacredColors:      prefs.sacredColors,
        sacredDirection:   prefs.sacredDirection,

        // Ritual
        sacrificeType:       prefs.sacrificeType,
        sacrificeFrequency:  state.ritualUrgency,
        burialPractice:      prefs.burialPractice,
        settlementPattern:   prefs.settlementPattern,

        // Social
        urgency:          state.ritualUrgency,
        evangelismDrive:  state.evangelismDrive,

        tabooHexes: state.tabooHexes.slice(),
        sacredHexes: state.sacredHexes.slice(),

        // Morale derived from perceived divine mood
        morale: state.perceivedDivineMood === 'pleased'   ? 0.8 :
                state.perceivedDivineMood === 'neutral'  ? 0.5 :
                state.perceivedDivineMood === 'testing'  ? 0.3 :
                state.perceivedDivineMood === 'wrathful' ? 0.1 : 0.4,

        schismRisk: Object.keys(state.doctrinalTensions).length > 0
          ? Math.max(...Object.values(state.doctrinalTensions))
          : 0,

        unity: state.doctrinalStrength
      };
    }

    propagateBeliefs(sourceId, targetId, influenceStrength) {
      const source = this.beliefStates.get(sourceId);
      const target = this.beliefStates.get(targetId);
      if (!source || !target) return;

      for (const fwId in source.affinities) {
        const diff = source.affinities[fwId] - target.affinities[fwId];
        target.affinities[fwId] += diff * influenceStrength * source.evangelismDrive * 0.1;
        target.affinities[fwId]  = Math.max(0, Math.min(1, target.affinities[fwId]));
      }

      // Renormalize
      const sum = Object.values(target.affinities).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        for (const fwId in target.affinities) {
          target.affinities[fwId] /= sum;
        }
      }
    }

    createSchism(parentId) {
      const parent = this.beliefStates.get(parentId);
      if (!parent) return null;

      const child    = parent.clone();
      const tensions = Object.entries(parent.doctrinalTensions);
      if (tensions.length === 0) return null;

      tensions.sort((a, b) => b[1] - a[1]);
      const [heresyId, heresyStrength] = tensions[0];

      child.affinities[child.dominantFramework] = heresyStrength;
      child.affinities[heresyId] = parent.affinities[child.dominantFramework];
      child.dominantFramework = heresyId;
      child.evangelismDrive   = 0.8;

      return child;
    }

    // ── Serialization ────────────────────────────
    serialize() {
      const states = {};
      for (const [id, state] of this.beliefStates) {
        states[id] = {
          affinities:            state.affinities,
          dominantFramework:     state.dominantFramework,
          doctrinalStrength:     state.doctrinalStrength,
          doctrinalTensions:     state.doctrinalTensions,
          ritualUrgency:         state.ritualUrgency,
          perceivedDivineMood:   state.perceivedDivineMood,
          evangelismDrive:       state.evangelismDrive,
          omenMemory:            state.omenMemory.slice(-20),
          architecturalDirectives: state.architecturalDirectives.slice(-5),
          tabooHexes:            state.tabooHexes.slice(-10),
          sacredHexes:           state.sacredHexes.slice(-10)
        };
      }
      return {
        beliefStates: states,
        globalEventMemory: this.globalEventMemory.slice(-200)
      };
    }

    deserialize(data) {
      this.globalEventMemory = data.globalEventMemory || [];
      this.beliefStates.clear();

      for (const [id, stateData] of Object.entries(data.beliefStates)) {
        const state = new BeliefState();
        Object.assign(state, stateData);
        this.beliefStates.set(id, state);
      }
    }
  }

  // ── Architecture Manifestations ──────────────────
  const Architecture = {
    determineStructure(hex, modifiers) {
      if (!modifiers) return null;

      // Check proximity to sacred hexes
      const nearSacred = modifiers.sacredHexes.some(sh =>
        Math.max(Math.abs(sh.q - hex.q), Math.abs(sh.r - hex.r)) <= 3
      );

      // Ritual site near sacred areas
      if (nearSacred && modifiers.urgency > 0.15) {
        return {
          type: 'ritual_site',
          style: modifiers.ritualSiteStyle,
          color: modifiers.sacredColors[0],
          size: Math.min(1, modifiers.urgency * 1.5),
          orientation: modifiers.sacredDirection
        };
      }

      // Temple at auspicious locations
      const auspice = this._evaluateAuspice(hex, modifiers);
      if (auspice > 0.5 && modifiers.urgency > 0.2) {
        return {
          type: 'temple',
          style: modifiers.templeStyle,
          color: modifiers.sacredColors[1] || modifiers.sacredColors[0],
          size: auspice,
          orientation: modifiers.templeOrientation
        };
      }

      // Burial ground
      if (hex.elevation > 0.3 && hex.elevation < 0.65 && modifiers.urgency > 0.15) {
        return {
          type: 'burial',
          style: modifiers.burialPractice,
          color: '#5a5a5a',
          size: 0.5,
          orientation: modifiers.sacredDirection
        };
      }

      return null;
    },

    _evaluateAuspice(hex, modifiers) {
      let score = 0;

      if (modifiers.preferredElevation !== undefined) {
        const elevDiff = Math.abs(hex.elevation - modifiers.preferredElevation);
        score += (1 - elevDiff) * 0.3;
      }

      const sacredDist = modifiers.sacredHexes.length > 0
        ? modifiers.sacredHexes
            .map(sh => Math.max(Math.abs(sh.q - hex.q), Math.abs(sh.r - hex.r)))
            .reduce((min, d) => Math.min(min, d), Infinity)
        : Infinity;

      if (sacredDist <= 3) {
        score += (3 - sacredDist) / 3 * 0.4;
      }

      const tabooDist = modifiers.tabooHexes.length > 0
        ? modifiers.tabooHexes
            .map(th => Math.max(Math.abs(th.q - hex.q), Math.abs(th.r - hex.r)))
            .reduce((min, d) => Math.min(min, d), Infinity)
        : Infinity;

      if (tabooDist <= 2) {
        score -= 0.5;
      }

      return Math.max(0, Math.min(1, score));
    },

    getStructureVisuals(structure) {
      const visuals = {
        shape: 'square',
        heightMultiplier: 1,
        ornamentLevel: 0,
        color: '#888',
        glowColor: null,
        particleType: null
      };

      switch (structure.style) {
        case 'peak':
          visuals.shape            = 'pillar';
          visuals.heightMultiplier = 1.5;
          visuals.ornamentLevel    = 2;
          visuals.color            = '#c4a035';
          visuals.glowColor        = '#e8d07040';
          visuals.particleType     = 'rising';
          break;

        case 'grove':
          visuals.shape            = 'circle';
          visuals.heightMultiplier = 0.5;
          visuals.ornamentLevel    = 1;
          visuals.color            = '#2d5a1e';
          visuals.glowColor        = '#4a6b2a30';
          visuals.particleType     = 'firefly';
          break;

        case 'spring':
          visuals.shape            = 'dome';
          visuals.heightMultiplier = 0.8;
          visuals.ornamentLevel    = 2;
          visuals.color            = '#5a3a1e';
          visuals.glowColor        = '#7a5a3020';
          visuals.particleType     = 'mist';
          break;

        case 'cliff':
          visuals.shape            = 'spire';
          visuals.heightMultiplier = 2;
          visuals.ornamentLevel    = 3;
          visuals.color            = '#2a2a4a';
          visuals.glowColor        = '#6a6a8a40';
          visuals.particleType     = 'spark';
          break;

        case 'tomb':
          visuals.shape            = 'mound';
          visuals.heightMultiplier = 0.6;
          visuals.ornamentLevel    = 1;
          visuals.color            = '#4a3a2a';
          visuals.glowColor        = '#6a5a4a20';
          visuals.particleType     = 'wisp';
          break;

        case 'riverbed':
          visuals.shape            = 'basin';
          visuals.heightMultiplier = 0.3;
          visuals.ornamentLevel    = 2;
          visuals.color            = '#1a4a6a';
          visuals.glowColor        = '#3a8aaa30';
          visuals.particleType     = 'ripple';
          break;
      }

      return visuals;
    }
  };

  return {
    FRAMEWORKS,
    TheologyEngine,
    Architecture,
    BeliefState
  };
})();
