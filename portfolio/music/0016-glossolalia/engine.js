/**
 * engine.js — Web Audio engine for Glossolalia
 *
 * Manages AudioContext, letter-to-tone triggering with ADSR envelopes,
 * a recording layer that replays the last 30 seconds with increasing
 * pitch-shift / time-stretch, and an analyser for waveform visuals.
 */

import {
  getCurrentMapping,
  getEntropyLevel,
} from "./drift.js";

const BUFFER_SECONDS = 30;
const REPLAY_INTERVAL_BASE = 15;
const REPLAY_INTERVAL_MIN = 5;
const REPLAY_START_ENTROPY = 0.1;
const REPLAY_FADE_SECONDS = 1.5;
const REPLAY_MAX_GAIN = 0.35;
const MASTER_VOLUME = 0.55;
const NOTE_VOLUME = 0.22;
const NOTE_ATTACK = 0.012;
const NOTE_DECAY = 0.09;
const NOTE_SUSTAIN = 0.6;
const NOTE_RELEASE = 0.28;
const NOTE_DURATION = 0.55;

let ctx = null;
let masterGain = null;
let analyser = null;
let compressor = null;
let startTime = 0;
let replayCount = 0;
let nextReplayTime = 0;
let initialised = false;

// Ring buffer for captured audio
const BUFFER_SAMPLES = 44100 * BUFFER_SECONDS;
const recordBuffer = new Float32Array(BUFFER_SAMPLES);
let recordWritePos = 0;

function getAudioContext() { return ctx; }
function getAnalyser() { return analyser; }
function getStartTime() { return startTime; }

function init() {
  if (initialised) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, ctx.currentTime);
  compressor.knee.setValueAtTime(12, ctx.currentTime);
  compressor.ratio.setValueAtTime(6, ctx.currentTime);
  compressor.attack.setValueAtTime(0.003, ctx.currentTime);
  compressor.release.setValueAtTime(0.15, ctx.currentTime);
  compressor.connect(ctx.destination);

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(MASTER_VOLUME, ctx.currentTime);
  masterGain.connect(compressor);

  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  masterGain.connect(analyser);

  // Capture audio into ring buffer
  // ScriptProcessorNode is deprecated but remains functional in all browsers.
  // For a self-contained single-page instrument this is the simplest correct choice.
  const sp = ctx.createScriptProcessor(4096, 1, 1);
  sp.onaudioprocess = function (e) {
    const input = e.inputBuffer.getChannelData(0);
    for (let i = 0; i < input.length; i++) {
      recordBuffer[recordWritePos] = input[i];
      recordWritePos = (recordWritePos + 1) % BUFFER_SAMPLES;
    }
  };
  masterGain.connect(sp);
  sp.connect(ctx.destination);

  startTime = ctx.currentTime;
  nextReplayTime = startTime + REPLAY_INTERVAL_BASE;
  initialised = true;
}

function snapshotBuffer() {
  const buf = ctx.createBuffer(1, BUFFER_SAMPLES, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < BUFFER_SAMPLES; i++) {
    ch[i] = recordBuffer[(recordWritePos + i) % BUFFER_SAMPLES];
  }
  return buf;
}

function scheduleReplay() {
  if (!ctx || ctx.state !== "running") return;

  const entropy = getEntropyLevel((ctx.currentTime - startTime) * 1000);
  if (entropy < REPLAY_START_ENTROPY) return;

  const buf = snapshotBuffer();
  if (!buf) return;

  replayCount++;
  const rate = 1.0 + entropy * 0.8;
  const duration = BUFFER_SECONDS / rate;

  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.playbackRate.value = rate;

  const vol = Math.min(entropy * REPLAY_MAX_GAIN, 0.4);
  const replayGain = ctx.createGain();
  const now = ctx.currentTime;
  const fadeInEnd = now + REPLAY_FADE_SECONDS;
  const fadeOutStart = now + duration - REPLAY_FADE_SECONDS;
  const endTime = now + duration;

  replayGain.gain.setValueAtTime(0.0001, now);
  replayGain.gain.linearRampToValueAtTime(vol, fadeInEnd);
  replayGain.gain.setValueAtTime(vol, fadeOutStart);
  replayGain.gain.linearRampToValueAtTime(0.0001, endTime);

  const shelf = ctx.createBiquadFilter();
  shelf.type = "highshelf";
  shelf.frequency.value = 2800;
  shelf.gain.value = entropy * 10;
  shelf.Q.value = 0.7;

  source.connect(shelf);
  shelf.connect(replayGain);
  replayGain.connect(masterGain);

  source.start(now);
  source.stop(endTime);
}

function updateReplay() {
  if (!ctx || ctx.state !== "running") return;
  if (ctx.currentTime >= nextReplayTime) {
    scheduleReplay();
    const entropy = getEntropyLevel((ctx.currentTime - startTime) * 1000);
    const interval =
      REPLAY_INTERVAL_BASE -
      entropy * (REPLAY_INTERVAL_BASE - REPLAY_INTERVAL_MIN);
    nextReplayTime = ctx.currentTime + interval;
  }
}

function triggerNote(letter) {
  if (!ctx || ctx.state !== "running") return;

  const l = letter.toLowerCase();
  if (l.length !== 1 || l < "a" || l > "z") return;

  const mapping = getCurrentMapping((ctx.currentTime - startTime) * 1000);
  const freq = mapping[l];
  if (freq === undefined) return;

  const now = ctx.currentTime;
  const vol = NOTE_VOLUME + Math.random() * 0.04;

  function makeOsc(type, detune) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime(detune, now);
    return osc;
  }

  const osc1 = makeOsc("triangle", 0);
  const osc2 = makeOsc("sine", 5 + Math.random() * 3);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(vol, now + NOTE_ATTACK);
  env.gain.linearRampToValueAtTime(vol * NOTE_SUSTAIN, now + NOTE_ATTACK + NOTE_DECAY);
  env.gain.setValueAtTime(vol * NOTE_SUSTAIN, now + NOTE_DURATION - NOTE_RELEASE);
  env.gain.exponentialRampToValueAtTime(0.0001, now + NOTE_DURATION);

  osc1.connect(env);
  osc2.connect(env);
  env.connect(masterGain);

  const stopTime = now + NOTE_DURATION + 0.05;
  osc1.start(now);
  osc2.start(now);
  osc1.stop(stopTime);
  osc2.stop(stopTime);
}

function silence() {
  if (masterGain) {
    masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
  }
  if (ctx && ctx.state === "running") {
    ctx.suspend();
  }
}

export {
  init,
  triggerNote,
  updateReplay,
  getAudioContext,
  getAnalyser,
  getStartTime,
  silence,
  NOTE_DURATION,
};
