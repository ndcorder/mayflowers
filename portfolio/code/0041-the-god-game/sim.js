/**
 * sim.js — Core simulation loop, hex grid state, population agent model,
 * faith propagation, and architectural consequence system.
 *
 * Orchestrates Environment, Theology, and rendering.
 * Manages the hex grid, population agents, settlement placement,
 * structure construction, and the passage of eras.
 */

const Sim = (() => {

  // ── Constants ────────────────────────────────────
  const GRID_COLS = 52;
  const GRID_ROWS = 40;
  const HEX_SIZE  = 14;

  const INITIAL_POPULATIONS    = 4;
  const INITIAL_POP_SIZE       = 12;
  const MAX_POPULATIONS        = 12;
  const MAX_POP_SIZE           = 60;
  const POP_GROWTH_RATE        = 0.003;
  const POP_STARVATION_RATE    = 0.01;
  const POP_MIGRATION_THRESHOLD = 0.35;
  const POP_SPLIT_THRESHOLD    = 40;

  const SETTLEMENT_RADIUS  = 3;
  const INTERACTION_RADIUS = 8;
  const SCHISM_THRESHOLD   = 0.45;

  const ERA_DURATION = 2000;

  // ── Internal state ───────────────────────────────
  let grid           = null;
  let populations    = [];
  let nextPopId      = 0;
  let currentTick    = 0;
  let currentEra     = 0;
  let eraName        = 'Dawn Age';
  let running        = false;
  let theologyEngine = null;

  // ── Noise utility ────────────────────────────────
  function hashNoise(x, y, seed) {
    let h = seed + x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return (h & 0x7fffffff) / 0x7fffffff;
  }

  function smoothNoise(x, y, seed) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const n00 = hashNoise(ix, iy, seed);
    const n10 = hashNoise(ix + 1, iy, seed);
    const n01 = hashNoise(ix, iy + 1, seed);
    const n11 = hashNoise(ix + 1, iy + 1, seed);

    const nx0 = n00 + (n10 - n00) * sx;
    const nx1 = n01 + (n11 - n01) * sx;
    return nx0 + (nx1 - nx0) * sy;
  }

  function fbm(x, y, seed, octaves) {
    let value = 0, amplitude = 0.5, frequency = 1, total = 0;
    for (let i = 0; i < octaves; i++) {
      value     += smoothNoise(x * frequency, y * frequency, seed + i * 1000) * amplitude;
      total     += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / total;
  }

  // ── Hex grid generation ──────────────────────────
  function generateGrid() {
    const seed = Math.floor(Math.random() * 100000);
    grid = new Array(GRID_COLS * GRID_ROWS);

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let q = 0; q < GRID_COLS; q++) {
        const idx = r * GRID_COLS + q;
        const nx  = q / GRID_COLS;
        const ny  = r / GRID_ROWS;

        let elevation = fbm(nx * 6, ny * 6, seed, 5);

        // Lower elevation near borders for natural coastline
        const edgeDist = Math.min(q, r, GRID_COLS - 1 - q, GRID_ROWS - 1 - r);
        elevation = elevation * 0.7 + 0.3 * Math.min(1, edgeDist / 6);

        const isWater = elevation < 0.28;
        if (isWater) elevation = Math.max(0.05, elevation * 0.8);

        const vegetation = (!isWater && elevation < 0.75)
          ? fbm(nx * 10, ny * 10, seed + 5000, 3)
          : 0;

        grid[idx] = {
          q, r, idx,
          elevation,
          baseElevation: elevation,
          isWater,
          vegetation: Math.max(0, vegetation),
          resources: Math.max(0, fbm(nx * 4, ny * 4, seed + 9000, 3)),
          fertility: 0,
          structure:           null,
          structureType:       null,
          structureStyle:      null,
          structureSize:       0,
          structureOrientation: null,
          structureColor:      null,
          structureDamage:     0,
          ownedBy: -1
        };
      }
    }
  }

  // ── Hex coordinate utilities ─────────────────────
  function hexToPixel(q, r) {
    return {
      x: HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
      y: HEX_SIZE * (1.5 * r)
    };
  }

  function pixelToHex(px, py) {
    const q = (Math.sqrt(3) / 3 * px - 1 / 3 * py) / HEX_SIZE;
    const r = (2 / 3 * py) / HEX_SIZE;
    return hexRound(q, r);
  }

  function hexRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs;
    else if (dr > ds) rr = -rq - rs;
    return { q: rq, r: rr };
  }

  function getHex(q, r) {
    if (q < 0 || q >= GRID_COLS || r < 0 || r >= GRID_ROWS) return null;
    return grid[r * GRID_COLS + q];
  }

  function hexDistance(q1, r1, q2, r2) {
    return Math.max(
      Math.abs(q1 - q2),
      Math.abs(r1 - r2),
      Math.abs((q1 + r1) - (q2 + r2))
    );
  }

  function getNeighbors(q, r) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]];
    return dirs
      .map(([dq, dr]) => getHex(q + dq, r + dr))
      .filter(Boolean);
  }

  function hexesInRadius(cq, cr, radius) {
    const results = [];
    for (let dq = -radius; dq <= radius; dq++) {
      for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
        const h = getHex(cq + dq, cr + dr);
        if (h) results.push(h);
      }
    }
    return results;
  }

  // ── Population Agent ─────────────────────────────
  class Population {
    constructor(id, homeQ, homeR, size, skipBelief) {
      this.id    = id;
      this.homeQ = homeQ;
      this.homeR = homeR;
      this.size  = size;
      this.maxSize = size;

      this.territory = new Set();
      this.food  = size * 5;
      this.wealth = 0;

      // Visual agent dots
      this.agentPositions = [];
      this.agentTargets   = [];
      for (let i = 0; i < Math.min(size, 15); i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist  = Math.random() * 2;
        this.agentPositions.push({
          q: homeQ + Math.cos(angle) * dist,
          r: homeR + Math.sin(angle) * dist
        });
        this.agentTargets.push(null);
      }

      this.beliefId = `pop_${id}`;
      if (!skipBelief && theologyEngine) {
        theologyEngine.createBeliefState(this.beliefId);
      }

      this.migrating         = false;
      this.migrationTarget   = null;
      this.migrationProgress = 0;
      this.constructionTimer = 0;
      this.interactionCooldown = 0;
      this.alive = true;

      this._claimTerritory();
    }

    _claimTerritory() {
      this.territory.clear();
      const hexes = hexesInRadius(this.homeQ, this.homeR, SETTLEMENT_RADIUS);
      for (const h of hexes) {
        if (!h.isWater && (h.ownedBy === -1 || h.ownedBy === this.id)) {
          this.territory.add(h.idx);
          h.ownedBy = this.id;
        }
      }
    }
  }

  // ── Initialization ───────────────────────────────
  function init() {
    currentTick = 0;
    currentEra  = 0;
    eraName     = 'Dawn Age';
    nextPopId   = 0;
    populations = [];

    generateGrid();

    Environment.init(grid, GRID_COLS, GRID_ROWS);

    theologyEngine = new Theology.TheologyEngine();

    // Compute initial fertility using Environment moisture
    for (let i = 0; i < grid.length; i++) {
      const hex = grid[i];
      if (hex.isWater) { hex.fertility = 0; continue; }
      const moisture = Environment.getMoisture(hex.q, hex.r);
      hex.fertility = Math.max(0, Math.min(1,
        hex.vegetation * 0.4 + moisture * 0.3 + hex.resources * 0.3
      ));
    }

    // Place initial populations on suitable terrain
    let placed = 0, attempts = 0;
    while (placed < INITIAL_POPULATIONS && attempts < 500) {
      attempts++;
      const q   = Math.floor(Math.random() * (GRID_COLS - 10)) + 5;
      const r   = Math.floor(Math.random() * (GRID_ROWS - 10)) + 5;
      const hex = getHex(q, r);

      if (!hex || hex.isWater || hex.elevation < 0.32 || hex.elevation > 0.75) continue;
      if (populations.some(p => hexDistance(q, r, p.homeQ, p.homeR) < 10))   continue;
      if (hex.fertility < 0.25) continue;

      const pop = new Population(nextPopId++, q, r, INITIAL_POP_SIZE);
      populations.push(pop);
      placed++;

      // Mark the home hex with a shelter
      hex.structure      = 'shelter';
      hex.structureType  = 'settlement';
      hex.structureStyle = 'organic';
      hex.structureSize  = 0.3;
      hex.structureColor = '#8a7a5a';
    }

    running = true;
  }

  // ── Main simulation tick ─────────────────────────
  function tick(dt) {
    if (!running) return;
    currentTick += dt;

    // Era advancement
    const newEra = Math.floor(currentTick / ERA_DURATION);
    if (newEra !== currentEra) {
      currentEra = newEra;
      _updateEraName();
    }

    // Subsystem ticks
    Environment.tick(dt);
    _updateFertility(dt);

    const recentEvents = Environment.getEventsSince(currentTick - 50);
    theologyEngine.update(recentEvents, currentTick, dt);

    // Population updates
    for (const pop of populations) {
      if (pop.alive) _updatePopulation(pop, dt);
    }

    _processInteractions(dt);

    // Prune dead populations
    populations = populations.filter(p => p.alive);

    // World maintenance
    _updateVegetation(dt);
    _updateStructures(dt);
  }

  // ── Population update ────────────────────────────
  function _updatePopulation(pop, dt) {
    const mods = theologyEngine.getBehavioralModifiers(pop.beliefId);
    if (!mods) return;

    // ── Resource gathering ─────────────────────
    let foodProduction = 0;
    for (const idx of pop.territory) {
      const hex = grid[idx];
      if (hex.isWater) continue;

      const envData      = Environment.getHexData(hex.q, hex.r);
      const floodPenalty = envData.floodLevel > 0.3   ? 0.3 : 1;
      const droughtPenalty = envData.droughtStress > 0.3 ? 0.5 : 1;
      const firePenalty  = envData.fireLevel > 0.2    ? 0.1 : 1;

      foodProduction += hex.fertility * floodPenalty * droughtPenalty * firePenalty * 0.15;
    }

    pop.food += foodProduction * dt;
    pop.food -= pop.size * 0.12 * dt;

    // Growth or decline
    if (pop.food > pop.size * 3) {
      pop.size += POP_GROWTH_RATE * pop.size * dt;
    } else if (pop.food < 0) {
      pop.food = 0;
      pop.size -= POP_STARVATION_RATE * pop.size * dt;
      if (pop.size < 3) {
        _killPopulation(pop, 'starvation');
        return;
      }
    }

    // Morale influence on growth
    pop.size += (mods.morale - 0.5) * 0.001 * dt;
    pop.size  = Math.max(1, Math.min(MAX_POP_SIZE, pop.size));
    pop.maxSize = Math.max(pop.maxSize, pop.size);

    pop.wealth += pop.size * 0.005 * mods.morale * dt;

    // ── Migration ──────────────────────────────
    if (mods.morale < POP_MIGRATION_THRESHOLD &&
        !pop.migrating &&
        Math.random() < 0.01 * dt) {
      _startMigration(pop, mods);
    }

    if (pop.migrating) {
      pop.migrationProgress += 0.02 * dt;
      if (pop.migrationProgress >= 1) _completeMigration(pop);
    }

    // ── Construction ───────────────────────────
    _processConstruction(pop, mods, dt);

    // ── Territory management (periodic) ────────
    if (currentTick % 50 < dt) _manageTerritory(pop, mods);

    // ── Agent movement ─────────────────────────
    _moveAgents(pop, mods, dt);

    // ── Splitting ──────────────────────────────
    if (pop.size >= POP_SPLIT_THRESHOLD &&
        populations.length < MAX_POPULATIONS &&
        Math.random() < 0.003 * dt) {
      _splitPopulation(pop);
    }
  }

  // ── Migration ────────────────────────────────────
  function _startMigration(pop, mods) {
    let bestTarget = null;
    let bestScore  = -Infinity;
    const searchRadius = 15;

    for (let dq = -searchRadius; dq <= searchRadius; dq += 2) {
      for (let dr = -searchRadius; dr <= searchRadius; dr += 2) {
        const tq  = pop.homeQ + dq;
        const tr  = pop.homeR + dr;
        const hex = getHex(tq, tr);
        if (!hex || hex.isWater) continue;
        if (hex.ownedBy !== -1 && hex.ownedBy !== pop.id) continue;

        let score = hex.fertility * 0.4;

        switch (mods.migrationBias) {
          case 'water':      score += Environment.getMoisture(tq, tr) * 0.3; break;
          case 'highland':   score += hex.elevation > 0.5 ? 0.4 : -0.2;      break;
          case 'fertile':    score += hex.fertility * 0.3;                    break;
          case 'downstream': score += (1 - hex.elevation) * 0.3;              break;
          case 'storm':      score += Environment.getHexData(tq, tr).fireLevel * 0.3; break;
          case 'ancestral':  score -= hexDistance(tq, tr, pop.homeQ, pop.homeR) * 0.05; break;
        }

        score -= hexDistance(tq, tr, pop.homeQ, pop.homeR) * 0.02;

        for (const sh of mods.sacredHexes) {
          if (hexDistance(tq, tr, sh.q, sh.r) < 3) score += sh.strength * 0.3;
        }
        for (const th of mods.tabooHexes) {
          if (hexDistance(tq, tr, th.q, th.r) < 2) score -= th.strength * 0.5;
        }

        if (score > bestScore) {
          bestScore = score;
          bestTarget = { q: tq, r: tr };
        }
      }
    }

    if (bestTarget) {
      pop.migrating         = true;
      pop.migrationTarget   = bestTarget;
      pop.migrationProgress = 0;
    }
  }

  function _completeMigration(pop) {
    const hex = getHex(pop.migrationTarget.q, pop.migrationTarget.r);
    if (!hex || hex.isWater) {
      pop.migrating       = false;
      pop.migrationTarget = null;
      return;
    }

    // Release old territory
    for (const idx of pop.territory) {
      if (grid[idx]) grid[idx].ownedBy = -1;
    }

    pop.homeQ            = pop.migrationTarget.q;
    pop.homeR            = pop.migrationTarget.r;
    pop.migrating        = false;
    pop.migrationTarget  = null;
    pop.migrationProgress = 0;

    pop._claimTerritory();

    // Reset agent positions around new home
    for (let i = 0; i < pop.agentPositions.length; i++) {
      pop.agentPositions[i] = {
        q: pop.homeQ + (Math.random() - 0.5) * 2,
        r: pop.homeR + (Math.random() - 0.5) * 2
      };
    }
  }

  // ── Construction ─────────────────────────────────
  function _processConstruction(pop, mods, dt) {
    pop.constructionTimer -= dt;
    if (pop.constructionTimer > 0 || pop.size < 6 || pop.wealth < 2) return;

    const buildChance = 0.03 * Math.max(0.1, mods.urgency) * (pop.wealth / 8);
    if (Math.random() > buildChance) {
      pop.constructionTimer = 25;
      return;
    }

    // Evaluate candidate hexes in territory
    const candidates = [];
    for (const idx of pop.territory) {
      const hex = grid[idx];
      if (hex.isWater || hex.structure) continue;

      const auspice   = Theology.Architecture._evaluateAuspice(hex, mods);
      const baseSuit  = (hex.fertility > 0.2 && hex.elevation > 0.3) ? 0.2 : 0;
      const totalScore = auspice + baseSuit;

      if (totalScore > 0.2) {
        candidates.push({ hex, score: totalScore });
      }
    }

    if (candidates.length === 0) {
      pop.constructionTimer = 40;
      return;
    }

    candidates.sort((a, b) => b.score - a.score);
    const chosen = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];

    const structure = Theology.Architecture.determineStructure(chosen.hex, mods);
    if (structure) {
      chosen.hex.structure           = structure.type;
      chosen.hex.structureType       = structure.type;
      chosen.hex.structureStyle      = structure.style;
      chosen.hex.structureSize       = structure.size;
      chosen.hex.structureOrientation = structure.orientation;
      chosen.hex.structureColor      = structure.color;
      chosen.hex.structureDamage     = 0;

      pop.wealth -= 3;
      pop.constructionTimer = 50 + Math.random() * 30;
    } else {
      pop.constructionTimer = 25;
    }
  }

  // ── Territory management ─────────────────────────
  function _manageTerritory(pop, mods) {
    // Expand into unclaimed border hexes
    const borderHexes = [];
    for (const idx of pop.territory) {
      for (const n of getNeighbors(grid[idx].q, grid[idx].r)) {
        if (!n.isWater && n.ownedBy === -1 && !pop.territory.has(n.idx)) {
          borderHexes.push(n);
        }
      }
    }

    if (pop.size > 10 && borderHexes.length > 0) {
      const toClaim = Math.min(
        Math.floor(pop.size / 8) - Math.floor(pop.territory.size / 6), 2
      );
      borderHexes.sort((a, b) => b.fertility - a.fertility);
      for (let i = 0; i < toClaim && i < borderHexes.length; i++) {
        if (borderHexes[i].fertility > 0.15) {
          pop.territory.add(borderHexes[i].idx);
          borderHexes[i].ownedBy = pop.id;
        }
      }
    }

    // Release inhospitable hexes
    for (const idx of Array.from(pop.territory)) {
      const hex     = grid[idx];
      const envData = Environment.getHexData(hex.q, hex.r);
      if (envData.fireLevel > 0.5 || envData.floodLevel > 0.6 || hex.structureDamage > 0.8) {
        pop.territory.delete(idx);
        if (hex.ownedBy === pop.id) hex.ownedBy = -1;
      }
    }
  }

  // ── Agent movement ───────────────────────────────
  function _moveAgents(pop, mods, dt) {
    const agentCount = Math.min(Math.ceil(pop.size / 4), 20);

    // Adjust agent pool to match population size
    while (pop.agentPositions.length < agentCount) {
      pop.agentPositions.push({
        q: pop.homeQ + (Math.random() - 0.5) * SETTLEMENT_RADIUS * 2,
        r: pop.homeR + (Math.random() - 0.5) * SETTLEMENT_RADIUS * 2
      });
      pop.agentTargets.push(null);
    }
    while (pop.agentPositions.length > agentCount) {
      pop.agentPositions.pop();
      pop.agentTargets.pop();
    }

    for (let i = 0; i < pop.agentPositions.length; i++) {
      const pos = pop.agentPositions[i];
      let target = pop.agentTargets[i];

      // Pick a new wandering target
      if (!target || Math.random() < 0.01 * dt) {
        let tq = pop.homeQ + (Math.random() - 0.5) * SETTLEMENT_RADIUS * 2.5;
        let tr = pop.homeR + (Math.random() - 0.5) * SETTLEMENT_RADIUS * 2.5;

        // Gravitate toward sacred sites
        if (mods.sacredHexes.length > 0 && Math.random() < 0.3) {
          const sacred = mods.sacredHexes[Math.floor(Math.random() * mods.sacredHexes.length)];
          tq = sacred.q + (Math.random() - 0.5) * 2;
          tr = sacred.r + (Math.random() - 0.5) * 2;
        }

        // Avoid taboo sites
        for (const th of mods.tabooHexes) {
          const dist = Math.sqrt((pos.q - th.q) ** 2 + (pos.r - th.r) ** 2);
          if (dist < 3) {
            tq = pos.q + (pos.q - th.q) * 0.5;
            tr = pos.r + (pos.r - th.r) * 0.5;
          }
        }

        pop.agentTargets[i] = { q: tq, r: tr };
        target = pop.agentTargets[i];
      }

      if (target) {
        const dx   = target.q - pos.q;
        const dy   = target.r - pos.r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.1) {
          const speed = 0.05 * dt;
          pos.q += (dx / dist) * speed;
          pos.r += (dy / dist) * speed;
        }
      }
    }
  }

  // ── Population splitting ─────────────────────────
  function _splitPopulation(pop) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 6 + Math.random() * 4;
    const tq    = Math.round(pop.homeQ + Math.cos(angle) * dist);
    const tr    = Math.round(pop.homeR + Math.sin(angle) * dist);
    const hex   = getHex(tq, tr);

    if (!hex || hex.isWater || hex.elevation < 0.3) return;
    if (hex.ownedBy !== -1) return;

    // Verify the broader area is unclaimed
    const nearbyHexes = hexesInRadius(tq, tr, SETTLEMENT_RADIUS);
    if (nearbyHexes.some(h => h.ownedBy !== -1 && h.ownedBy !== pop.id)) return;

    const splitSize = Math.floor(pop.size * 0.35);
    if (splitSize < 5) return;

    pop.size -= splitSize;

    const newPop   = new Population(nextPopId++, tq, tr, splitSize);
    newPop.food    = pop.food * 0.3;
    pop.food      *= 0.7;

    // Possible schism on split
    const mods = theologyEngine.getBehavioralModifiers(pop.beliefId);
    if (mods && mods.schismRisk > SCHISM_THRESHOLD && Math.random() < 0.5) {
      const schismState = theologyEngine.createSchism(pop.beliefId);
      if (schismState) {
        theologyEngine.setBeliefState(newPop.beliefId, schismState);
      }
    } else {
      const parentState = theologyEngine.getBeliefState(pop.beliefId);
      if (parentState) {
        theologyEngine.setBeliefState(newPop.beliefId, parentState.clone());
      }
    }

    populations.push(newPop);
  }

  // ── Population death ─────────────────────────────
  function _killPopulation(pop, cause) {
    pop.alive = false;

    for (const idx of pop.territory) {
      if (grid[idx] && grid[idx].ownedBy === pop.id) {
        grid[idx].ownedBy = -1;
      }
    }

    const homeHex = getHex(pop.homeQ, pop.homeR);
    if (homeHex && homeHex.structure) {
      homeHex.structureType  = 'ruin';
      homeHex.structureColor = '#6a6a6a';
      homeHex.structureSize *= 0.6;
    }

    theologyEngine.removeBeliefState(pop.beliefId);
  }

  // ── Population interactions ──────────────────────
  function _processInteractions(dt) {
    for (let i = 0; i < populations.length; i++) {
      const popA = populations[i];
      if (!popA.alive) continue;

      popA.interactionCooldown = Math.max(0, popA.interactionCooldown - dt);
      if (popA.interactionCooldown > 0) continue;

      for (let j = i + 1; j < populations.length; j++) {
        const popB = populations[j];
        if (!popB.alive) continue;

        const dist = hexDistance(popA.homeQ, popA.homeR, popB.homeQ, popB.homeR);
        if (dist > INTERACTION_RADIUS) continue;

        const modsA = theologyEngine.getBehavioralModifiers(popA.beliefId);
        const modsB = theologyEngine.getBehavioralModifiers(popB.beliefId);

        if (modsA && modsB) {
          // Trade wealth
          popA.wealth += 0.1 * dt;
          popB.wealth += 0.1 * dt;

          // Belief propagation
          const exchangeRate = 0.01 / Math.max(1, dist);
          if (modsA.evangelismDrive > 0.2) {
            theologyEngine.propagateBeliefs(popA.beliefId, popB.beliefId, exchangeRate);
          }
          if (modsB.evangelismDrive > 0.2) {
            theologyEngine.propagateBeliefs(popB.beliefId, popA.beliefId, exchangeRate);
          }
        }

        // Territory conflict over overlapping claims
        let overlapCount = 0;
        for (const idx of popA.territory) {
          if (popB.territory.has(idx)) overlapCount++;
        }

        if (overlapCount > 3) {
          const winner = popA.size >= popB.size ? popA : popB;
          const loser  = popA.size >= popB.size ? popB : popA;
          for (const idx of winner.territory) {
            if (loser.territory.has(idx)) {
              loser.territory.delete(idx);
              grid[idx].ownedBy = winner.id;
            }
          }
          loser.food -= overlapCount * 0.5;
        }

        popA.interactionCooldown = 20;
        popB.interactionCooldown = 20;
      }
    }
  }

  // ── Fertility update ─────────────────────────────
  function _updateFertility(dt) {
    for (let i = 0; i < grid.length; i++) {
      const hex = grid[i];
      if (hex.isWater) continue;

      const envData       = Environment.getHexData(hex.q, hex.r);
      const moistureFact  = Math.min(1, envData.moisture * 2 + 0.2);
      const firePenalty   = envData.fireLevel > 0 ? (1 - envData.fireLevel) : 1;
      const scorchPenalty = 1 - envData.scorchMarks * 0.5;
      const floodBonus    = (envData.floodLevel > 0.1 && envData.floodLevel < 0.4) ? 1.2 :
                            envData.floodLevel > 0.4 ? 0.6 : 1;

      hex.fertility = hex.baseElevation > 0.28
        ? Math.max(0, Math.min(1,
            hex.vegetation * 0.3 * moistureFact * firePenalty * scorchPenalty * floodBonus +
            hex.resources * 0.3 +
            moistureFact * 0.2
          ))
        : 0;
    }
  }

  // ── Vegetation update ────────────────────────────
  function _updateVegetation(dt) {
    for (let i = 0; i < grid.length; i++) {
      const hex = grid[i];
      if (hex.isWater || hex.baseElevation > 0.8) continue;

      const envData = Environment.getHexData(hex.q, hex.r);

      if (envData.fireLevel > 0.1) {
        hex.vegetation = Math.max(0, hex.vegetation - envData.fireLevel * 0.1 * dt);
      }
      if (envData.droughtStress > 0.3) {
        hex.vegetation = Math.max(0, hex.vegetation - envData.droughtStress * 0.02 * dt);
      }
      if (envData.moisture > 0.15 && hex.vegetation < hex.fertility) {
        hex.vegetation = Math.min(1, hex.vegetation + 0.003 * dt);
      }
    }
  }

  // ── Structure update ─────────────────────────────
  function _updateStructures(dt) {
    for (let i = 0; i < grid.length; i++) {
      const hex = grid[i];
      if (!hex.structure) continue;

      // Collapse threshold
      if (hex.structureDamage > 1) {
        hex.structureType  = 'ruin';
        hex.structureColor = '#6a6a6a';
        hex.structureSize *= 0.5;
        hex.structureDamage = 0;
      }

      // Owners repair damage slowly
      if (hex.structureDamage > 0 && hex.ownedBy >= 0) {
        const owner = populations.find(p => p.alive && p.id === hex.ownedBy);
        if (owner && owner.wealth > 1) {
          hex.structureDamage = Math.max(0, hex.structureDamage - 0.005 * dt);
          owner.wealth -= 0.001 * dt;
        }
      }
    }
  }

  // ── Era naming ───────────────────────────────────
  function _updateEraName() {
    const ages = [
      'Dawn Age', 'Age of Roots', 'Age of Awakening',
      'Age of Signs', 'Age of Temples', 'Age of Schism',
      'Age of Reckoning', 'Age of Ashes', 'Age of Renewal',
      'Age of Empires', 'Age of Eclipse', 'Age of Prophecy',
      'Age of Silence', 'Age of Floods', 'Age of Storms'
    ];

    const recentEvents = Environment.getRecentEvents(100);
    const fireCount    = recentEvents.filter(e => e.type === 'lightning').length;
    const floodCount   = recentEvents.filter(e => e.type === 'flood').length;
    const droughtCount = recentEvents.filter(e => e.type === 'drought').length;

    if (fireCount > 15)       eraName = 'Age of Storms';
    else if (floodCount > 15) eraName = 'Age of Floods';
    else if (droughtCount > 15) eraName = 'Age of Ashes';
    else                      eraName = ages[currentEra % ages.length];
  }

  // ── Player action handlers ───────────────────────
  function playerAction(action, q, r, extra) {
    if (!running) return;

    switch (action) {
      case 'rain':         Environment.applyRain(q, r, extra?.intensity); break;
      case 'drought':      Environment.applyDrought(q, r, extra?.intensity); break;
      case 'tectonic_up':  Environment.applyTectonic(q, r, true); break;
      case 'tectonic_down': Environment.applyTectonic(q, r, false); break;
      case 'lightning':    Environment.applyLightning(q, r); break;
      case 'flood':        Environment.triggerFlood(q, r, 0.6); break;
    }
  }

  // ── Queries ──────────────────────────────────────
  function getGrid()          { return grid; }
  function getPopulations()   { return populations.filter(p => p.alive); }
  function getCurrentTick()   { return currentTick; }
  function getCurrentEra()    { return currentEra; }
  function getEraName()       { return eraName; }
  function isRunning()        { return running; }

  function getStats() {
    const alive    = populations.filter(p => p.alive);
    const totalPop = alive.reduce((s, p) => s + p.size, 0);
    return {
      totalPopulation: Math.floor(totalPop),
      settlementCount: alive.length,
      era: currentEra,
      eraName,
      tick: currentTick
    };
  }

  function getPopulationAt(q, r) {
    const hex = getHex(q, r);
    if (!hex || hex.ownedBy < 0) return null;
    return populations.find(p => p.alive && p.id === hex.ownedBy) || null;
  }

  // ── Serialization ────────────────────────────────
  function serialize() {
    return {
      grid: grid.map(h => ({
        q: h.q, r: h.r, idx: h.idx,
        elevation: h.elevation,
        baseElevation: h.baseElevation,
        isWater: h.isWater,
        vegetation: h.vegetation,
        resources: h.resources,
        fertility: h.fertility,
        structure: h.structure,
        structureType: h.structureType,
        structureStyle: h.structureStyle,
        structureSize: h.structureSize,
        structureOrientation: h.structureOrientation,
        structureColor: h.structureColor,
        structureDamage: h.structureDamage,
        ownedBy: h.ownedBy
      })),
      populations: populations.filter(p => p.alive).map(p => ({
        id: p.id,
        beliefId: p.beliefId,
        homeQ: p.homeQ,
        homeR: p.homeR,
        size: p.size,
        maxSize: p.maxSize,
        food: p.food,
        wealth: p.wealth,
        territory: Array.from(p.territory),
        migrating: p.migrating,
        migrationTarget: p.migrationTarget,
        migrationProgress: p.migrationProgress
      })),
      nextPopId,
      currentTick,
      currentEra,
      eraName,
      environment: Environment.serialize(),
      theology: theologyEngine.serialize()
    };
  }

  function deserialize(data) {
    grid        = data.grid;
    currentTick = data.currentTick;
    currentEra  = data.currentEra;
    eraName     = data.eraName;
    nextPopId   = data.nextPopId;

    Environment.deserialize(data.environment);
    theologyEngine.deserialize(data.theology);

    populations = data.populations.map(pd => {
      const pop = new Population(pd.id, pd.homeQ, pd.homeR, pd.size, true);
      pop.beliefId          = pd.beliefId;
      pop.maxSize           = pd.maxSize;
      pop.food              = pd.food;
      pop.wealth            = pd.wealth;
      pop.territory         = new Set(pd.territory);
      pop.migrating         = pd.migrating;
      pop.migrationTarget   = pd.migrationTarget;
      pop.migrationProgress = pd.migrationProgress;
      return pop;
    });

    running = true;
  }

  return {
    init, tick, playerAction,
    getGrid, getPopulations,
    getCurrentTick, getCurrentEra, getEraName, isRunning,
    getStats, getPopulationAt,
    serialize, deserialize,
    hexToPixel, pixelToHex, getHex,
    hexDistance, hexesInRadius, getNeighbors,
    GRID_COLS, GRID_ROWS, HEX_SIZE
  };
})();
