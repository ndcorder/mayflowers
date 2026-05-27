/**
 * environment.js — Environmental force model
 *
 * Manages rain, drought, tectonic shifts, floods, lightning, and fire.
 * All player actions flow through this module before affecting the hex grid.
 * Every change is recorded as an event for the theology engine to interpret.
 */

const Environment = (() => {

  // ── Constants ────────────────────────────────────
  const RAIN_RADIUS      = 3;
  const RAIN_INTENSITY   = 0.35;
  const RAIN_EVAPORATION = 0.005;

  const DROUGHT_RADIUS    = 4;
  const DROUGHT_INTENSITY = 0.4;

  const FLOOD_THRESHOLD   = 0.6;
  const FLOOD_SPREAD_RATE = 0.12;
  const FLOOD_DRAIN_RATE  = 0.08;

  const TECTONIC_RADIUS    = 2;
  const TECTONIC_INTENSITY = 0.15;

  const LIGHTNING_FIRE_CHANCE = 0.6;
  const FIRE_DECAY            = 0.03;
  const FIRE_SPREAD_CHANCE    = 0.08;

  // ── Internal state ───────────────────────────────
  let grid       = null;
  let gridWidth  = 0;
  let gridHeight = 0;
  let eventLog   = [];
  let eventIndex = 0;
  let currentTime = 0;

  let moisture     = null;
  let floodLevel   = null;
  let fireLevel    = null;
  let droughtStress = null;
  let scorchMarks  = null;

  let activeRainZones       = [];
  let activeDroughtZones    = [];
  let pendingTectonicEvents = [];
  let pendingLightningStrikes = [];

  // ── Hex utilities ────────────────────────────────
  function hexToIndex(q, r) {
    if (q < 0 || q >= gridWidth || r < 0 || r >= gridHeight) return -1;
    return r * gridWidth + q;
  }

  function getHexNeighbors(q, r) {
    const dirs = [[+1, 0], [-1, 0], [0, +1], [0, -1], [+1, -1], [-1, +1]];
    const neighbors = [];
    for (const [dq, dr] of dirs) {
      const idx = hexToIndex(q + dq, r + dr);
      if (idx >= 0) {
        neighbors.push({ q: q + dq, r: r + dr, idx });
      }
    }
    return neighbors;
  }

  function hexesInRadius(cq, cr, radius) {
    const results = [];
    for (let dq = -radius; dq <= radius; dq++) {
      for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
        const idx = hexToIndex(cq + dq, cr + dr);
        if (idx >= 0) {
          const dist = Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
          results.push({ q: cq + dq, r: cr + dr, idx, dist });
        }
      }
    }
    return results;
  }

  // ── Event recording ──────────────────────────────
  function recordEvent(type, data) {
    const event = {
      id: eventIndex++,
      time: currentTime,
      type,
      ...data
    };
    eventLog.push(event);
    return event;
  }

  // ── Initialization ───────────────────────────────
  function init(hexGrid, width, height) {
    grid       = hexGrid;
    gridWidth  = width;
    gridHeight = height;
    eventLog   = [];
    eventIndex = 0;
    currentTime = 0;

    const count = width * height;
    moisture     = new Float32Array(count);
    floodLevel   = new Float32Array(count);
    fireLevel    = new Float32Array(count);
    droughtStress = new Float32Array(count);
    scorchMarks  = new Float32Array(count);

    activeRainZones        = [];
    activeDroughtZones     = [];
    pendingTectonicEvents  = [];
    pendingLightningStrikes = [];

    for (let i = 0; i < count; i++) {
      moisture[i] = Math.max(0, 0.5 - hexGrid[i].elevation * 0.3);
    }
  }

  // ── Player actions ───────────────────────────────

  function applyRain(q, r, intensity) {
    const hexes = hexesInRadius(q, r, RAIN_RADIUS);
    const affected = [];

    for (const hex of hexes) {
      const falloff = 1.0 - (hex.dist / (RAIN_RADIUS + 1));
      const amount  = RAIN_INTENSITY * falloff * (intensity || 1.0);

      moisture[hex.idx] += amount;

      if (floodLevel[hex.idx] > 0) {
        floodLevel[hex.idx] += amount * 0.3;
      }

      droughtStress[hex.idx] = Math.max(0, droughtStress[hex.idx] - amount * 2);
      affected.push({ q: hex.q, r: hex.r, amount });
    }

    activeRainZones.push({
      q, r,
      radius: RAIN_RADIUS,
      intensity: intensity || 1.0,
      startTime: currentTime,
      duration: 40
    });

    recordEvent('rain', {
      centerQ: q,
      centerR: r,
      radius: RAIN_RADIUS,
      intensity: intensity || 1.0,
      hexCount: affected.length,
      affected: affected.slice(0, 12)
    });
  }

  function applyDrought(q, r, intensity) {
    const hexes = hexesInRadius(q, r, DROUGHT_RADIUS);
    const affected = [];

    for (const hex of hexes) {
      const falloff = 1.0 - (hex.dist / (DROUGHT_RADIUS + 1));
      const amount  = DROUGHT_INTENSITY * falloff * (intensity || 1.0);

      moisture[hex.idx]     = Math.max(0, moisture[hex.idx] - amount);
      droughtStress[hex.idx] += amount;
      floodLevel[hex.idx]  = Math.max(0, floodLevel[hex.idx] - amount * 0.5);
      affected.push({ q: hex.q, r: hex.r, amount });
    }

    activeDroughtZones.push({
      q, r,
      radius: DROUGHT_RADIUS,
      intensity: intensity || 1.0,
      startTime: currentTime,
      duration: 50
    });

    recordEvent('drought', {
      centerQ: q,
      centerR: r,
      radius: DROUGHT_RADIUS,
      intensity: intensity || 1.0,
      hexCount: affected.length,
      affected: affected.slice(0, 12)
    });
  }

  function applyTectonic(q, r, raise) {
    const hexes = hexesInRadius(q, r, TECTONIC_RADIUS);
    const affected = [];

    for (const hex of hexes) {
      const falloff = 1.0 - (hex.dist / (TECTONIC_RADIUS + 1));
      const shift   = TECTONIC_INTENSITY * falloff * (raise ? 1 : -1);

      grid[hex.idx].elevation =
        Math.max(0, Math.min(1, grid[hex.idx].elevation + shift));

      if (Math.abs(shift) > 0.05 && grid[hex.idx].structure) {
        grid[hex.idx].structureDamage =
          (grid[hex.idx].structureDamage || 0) + Math.abs(shift) * 2;
      }

      affected.push({
        q: hex.q,
        r: hex.r,
        elevationChange: shift,
        newElevation: grid[hex.idx].elevation
      });
    }

    pendingTectonicEvents.push({
      q, r,
      radius: TECTONIC_RADIUS,
      raise,
      startTime: currentTime,
      duration: 60
    });

    recordEvent('tectonic', {
      centerQ: q,
      centerR: r,
      radius: TECTONIC_RADIUS,
      raise,
      hexCount: affected.length,
      affected: affected.slice(0, 12)
    });
  }

  function applyLightning(q, r) {
    const idx = hexToIndex(q, r);
    if (idx < 0) return;

    const hex = grid[idx];
    const strikes = [{ q, r, idx }];

    scorchMarks[idx] = Math.min(1, (scorchMarks[idx] || 0) + 0.7);

    const fireStarted = Math.random() < LIGHTNING_FIRE_CHANCE;
    if (fireStarted) fireLevel[idx] += 0.8;

    if (hex.structure) {
      hex.structureDamage = (hex.structureDamage || 0) + 0.5;
    }

    // Chain lightning — one possible secondary strike
    const neighbors = getHexNeighbors(q, r);
    if (Math.random() < 0.3 && neighbors.length > 0) {
      const target = neighbors[Math.floor(Math.random() * neighbors.length)];
      scorchMarks[target.idx] =
        Math.min(1, (scorchMarks[target.idx] || 0) + 0.3);

      if (Math.random() < LIGHTNING_FIRE_CHANCE * 0.5) {
        fireLevel[target.idx] += 0.4;
      }
      strikes.push({ q: target.q, r: target.r, idx: target.idx });
    }

    pendingLightningStrikes.push({
      q, r,
      chainCount: strikes.length - 1,
      fireStarted,
      startTime: currentTime,
      duration: 30
    });

    recordEvent('lightning', {
      centerQ: q,
      centerR: r,
      fireStarted,
      chainCount: strikes.length - 1,
      strikes,
      targetStructure: hex.structure || null,
      targetPopulation: hex.population || 0
    });
  }

  function triggerFlood(q, r, force) {
    const hexes = hexesInRadius(q, r, 2);
    const affected = [];

    for (const hex of hexes) {
      if (grid[hex.idx].elevation < 0.6) {
        const amount = force || (moisture[hex.idx] * FLOOD_SPREAD_RATE);
        floodLevel[hex.idx] = Math.min(1, floodLevel[hex.idx] + amount);
        affected.push({ q: hex.q, r: hex.r, depth: floodLevel[hex.idx] });
      }
    }

    if (affected.length > 0) {
      recordEvent('flood', {
        centerQ: q,
        centerR: r,
        hexCount: affected.length,
        affected: affected.slice(0, 12),
        forced: !!force
      });
    }
  }

  // ── Simulation tick ──────────────────────────────
  function tick(dt) {
    currentTime += dt;

    // Evaporation
    for (let i = 0; i < moisture.length; i++) {
      moisture[i] = Math.max(0, moisture[i] - RAIN_EVAPORATION * dt);
    }

    // Flood spread and drain
    const newFlood = new Float32Array(floodLevel);
    for (let i = 0; i < gridWidth * gridHeight; i++) {
      if (floodLevel[i] > 0.01) {
        newFlood[i] = Math.max(0, floodLevel[i] - FLOOD_DRAIN_RATE * dt);

        const q = i % gridWidth;
        const r = Math.floor(i / gridWidth);
        const neighbors = getHexNeighbors(q, r);

        for (const n of neighbors) {
          if (grid[n.idx].elevation < grid[i].elevation) {
            newFlood[n.idx] += floodLevel[i] * FLOOD_SPREAD_RATE * dt * 0.1;
          }
        }

        if (floodLevel[i] > 0.4 && grid[i].structure) {
          grid[i].structureDamage = (grid[i].structureDamage || 0) + 0.02 * dt;
        }
      }
    }
    floodLevel.set(newFlood);

    // Fire spread and decay
    const newFire = new Float32Array(fireLevel);
    for (let i = 0; i < gridWidth * gridHeight; i++) {
      if (fireLevel[i] > 0.01) {
        newFire[i] = Math.max(0, fireLevel[i] - FIRE_DECAY * dt);

        if (Math.random() < FIRE_SPREAD_CHANCE * dt) {
          const q = i % gridWidth;
          const r = Math.floor(i / gridWidth);
          const neighbors = getHexNeighbors(q, r);
          if (neighbors.length > 0) {
            const target = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (moisture[target.idx] < 0.3) {
              newFire[target.idx] += 0.3;
            }
          }
        }

        if (grid[i].structure) {
          grid[i].structureDamage = (grid[i].structureDamage || 0) + 0.05 * dt;
        }
        scorchMarks[i] = Math.min(1, scorchMarks[i] + 0.01 * dt);
      }
    }
    fireLevel.set(newFire);

    // General decay
    for (let i = 0; i < droughtStress.length; i++) {
      droughtStress[i] = Math.max(0, droughtStress[i] - 0.005 * dt);
      scorchMarks[i]   = Math.max(0, scorchMarks[i] - 0.0005 * dt);
    }

    // Natural flood from saturation
    if (Math.random() < 0.01 * dt) {
      for (let i = 0; i < gridWidth * gridHeight; i++) {
        if (moisture[i] > FLOOD_THRESHOLD && grid[i].elevation < 0.4) {
          triggerFlood(i % gridWidth, Math.floor(i / gridWidth));
          break;
        }
      }
    }

    // Expire visual effects
    activeRainZones = activeRainZones.filter(
      z => currentTime - z.startTime < z.duration
    );
    activeDroughtZones = activeDroughtZones.filter(
      z => currentTime - z.startTime < z.duration
    );
    pendingTectonicEvents = pendingTectonicEvents.filter(
      e => currentTime - e.startTime < e.duration
    );
    pendingLightningStrikes = pendingLightningStrikes.filter(
      s => currentTime - s.startTime < s.duration
    );

    // Cap event memory
    if (eventLog.length > 2000) {
      eventLog = eventLog.slice(-1500);
    }
  }

  // ── Queries ──────────────────────────────────────

  function getMoisture(q, r) {
    const idx = hexToIndex(q, r);
    return idx >= 0 ? moisture[idx] : 0;
  }

  function getFloodLevel(q, r) {
    const idx = hexToIndex(q, r);
    return idx >= 0 ? floodLevel[idx] : 0;
  }

  function getFireLevel(q, r) {
    const idx = hexToIndex(q, r);
    return idx >= 0 ? fireLevel[idx] : 0;
  }

  function getDroughtStress(q, r) {
    const idx = hexToIndex(q, r);
    return idx >= 0 ? droughtStress[idx] : 0;
  }

  function getScorchMarks(q, r) {
    const idx = hexToIndex(q, r);
    return idx >= 0 ? scorchMarks[idx] : 0;
  }

  function getEventsSince(sinceTime) {
    return eventLog.filter(e => e.time >= sinceTime);
  }

  function getRecentEvents(count) {
    return eventLog.slice(-count);
  }

  function getCurrentTime() {
    return currentTime;
  }

  function getHexData(q, r) {
    const idx = hexToIndex(q, r);
    if (idx < 0) return null;
    return {
      moisture:     moisture[idx],
      floodLevel:   floodLevel[idx],
      fireLevel:    fireLevel[idx],
      droughtStress: droughtStress[idx],
      scorchMarks:  scorchMarks[idx]
    };
  }

  function getActiveEffects() {
    return {
      rainZones:       activeRainZones,
      droughtZones:    activeDroughtZones,
      tectonicEvents:  pendingTectonicEvents,
      lightningStrikes: pendingLightningStrikes
    };
  }

  // ── Serialization ────────────────────────────────
  function serialize() {
    return {
      moisture:      Array.from(moisture),
      floodLevel:    Array.from(floodLevel),
      fireLevel:     Array.from(fireLevel),
      droughtStress: Array.from(droughtStress),
      scorchMarks:   Array.from(scorchMarks),
      currentTime,
      eventLog: eventLog.slice(-500)
    };
  }

  function deserialize(data) {
    moisture      = new Float32Array(data.moisture);
    floodLevel    = new Float32Array(data.floodLevel);
    fireLevel     = new Float32Array(data.fireLevel);
    droughtStress = new Float32Array(data.droughtStress);
    scorchMarks   = new Float32Array(data.scorchMarks);
    currentTime   = data.currentTime;
    eventLog      = data.eventLog || [];
    eventIndex    = eventLog.length > 0
      ? eventLog[eventLog.length - 1].id + 1
      : 0;
  }

  return {
    init, tick,
    applyRain, applyDrought, applyTectonic, applyLightning, triggerFlood,
    getMoisture, getFloodLevel, getFireLevel, getDroughtStress, getScorchMarks,
    getEventsSince, getRecentEvents, getCurrentTime, getHexData,
    getActiveEffects,
    serialize, deserialize,
    hexesInRadius, getHexNeighbors
  };
})();
