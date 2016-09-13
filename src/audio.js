import { randFloatSpread, sample } from './math';

var AudioContext = window.AudioContext || window.webkitAudioContext;
var OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
var audioContext = new AudioContext();
var sampleRate = audioContext.sampleRate;

function toFreq(note) {
  // A4 is 69.
  return Math.pow(2, (note - 69) / 12) * 440;
}

function playSound(sound, delay, destination) {
  destination = destination || audioContext.destination;

  var source = audioContext.createBufferSource();
  source.buffer = sound;
  source.connect(destination);
  source.start(delay ? audioContext.currentTime + delay : 0);
}

function playSoundArray(destination) {
  return function(array) {
    array.map(function(note) {
      var sound = note[0];
      var delay = note[1];
      playSound(sound, delay, destination);
    });
  };
}

// duration is in seconds.
function generateAudioBuffer(fn, duration, volume) {
  var length = duration * sampleRate;

  var buffer = audioContext.createBuffer(1, length, sampleRate);
  var channel = buffer.getChannelData(0);
  for (var i = 0; i < length; i++) {
    channel[i] = fn(i / sampleRate, i, channel) * volume;
  }

  return buffer;
}

var noteNames = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

function toNoteString(note) {
  var name = noteNames[note % 12];
  var octave = Math.floor(note / 12) - 1;
  return name + octave;
}

function generateNotes(fn, duration, volume) {
  var notes = {};

  function createNoteProperty(note) {
    var sound;

    var descriptor = {
      get: function() {
        if (!sound) {
          sound = generateAudioBuffer(fn(toFreq(note)), duration, volume);
        }

        return sound;
      },
    };

    Object.defineProperty(notes, note, descriptor);
    Object.defineProperty(notes, toNoteString(note), descriptor);
  }

  // From A1 (21) to A7 (105).
  for (var i = 21; i <= 105; i++) {
    createNoteProperty(i);
  }

  return notes;
}

var wet = audioContext.createGain();
wet.gain.value = 0.5;
wet.connect(audioContext.destination);

var dry = audioContext.createGain();
dry.gain.value = 1 - wet.gain.value;
dry.connect(audioContext.destination);

var convolver = audioContext.createConvolver();
convolver.connect(wet);

var master = audioContext.createGain();
master.gain.value = 0.8;
master.connect(dry);
master.connect(convolver);


function impulseResponse(t, i, a) {
  return (2 * Math.random() - 1) * Math.pow(64, -i / a.length);
}

var impulseResponseBuffer = generateAudioBuffer(impulseResponse, 2, 1);

// Cheap hack for reverb.
function renderLowPassOffline(convolver, startFrequency, endFrequency, duration) {
  var offlineCtx = new OfflineAudioContext(1, impulseResponseBuffer.length, sampleRate);

  var offlineFilter = offlineCtx.createBiquadFilter();
  offlineFilter.type = 'lowpass';
  offlineFilter.Q.value = 0.0001;
  offlineFilter.frequency.value = startFrequency;
  offlineFilter.frequency.linearRampToValueAtTime(endFrequency, duration);
  offlineFilter.connect(offlineCtx.destination);

  var offlineBufferSource = offlineCtx.createBufferSource();
  offlineBufferSource.buffer = impulseResponseBuffer;
  offlineBufferSource.connect(offlineFilter);
  offlineBufferSource.start();

  var render = offlineCtx.startRendering();

  // https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/startRendering
  if (render !== undefined) {
    // Promises.
    render.then(function(buffer) {
      convolver.buffer = buffer;
    });
  } else {
    // Callbacks.
    offlineCtx.oncomplete = function(event) {
      convolver.buffer = event.renderedBuffer;
    };
  }
}

// A4 to A3.
renderLowPassOffline(convolver, 440, 220, 1);

function sin(f) {
  return function(t) {
    return Math.sin(t * 2 * Math.PI * f);
  };
}

function saw(f) {
  return function(t) {
    var n = ((t % (1 / f)) * f) % 1;
    return -1 + 2 * n;
  };
}

function tri(f) {
  return function(t) {
    const n = ((t % (1 / f)) * f) % 1;
    return n < 0.5 ? -1 + (2 * (2 * n)) : 1 - (2 * (2 * n));
  };
}

function square(f) {
  return function(t) {
    const n = ((t % (1 / f)) * f) % 1;
    return n > 0.5 ? 1 : -1;
  };
}

function decay(d) {
  return function() {
    return function(t) {
      return Math.exp(-t * d);
    };
  };
}

// Brown noise.
// https://github.com/Tonejs/Tone.js/blob/master/Tone/source/Noise.js
function noise(magnitude) {
  magnitude = magnitude || 1;

  return function() {
    var value = 0;

    return function() {
      var step = (value + (0.02 * randFloatSpread(1))) / 1.02;
      value += step;

      if (-1 > value || value > 1) {
        value -= step;
      }

      return value * 3.5 * magnitude;
    };
  };
}

function add(a, b) {
  return function(f) {
    var af = a(f);
    var bf = b(f);

    return function(t) {
      return af(t) + bf(t);
    };
  };
}

function mul(a, b) {
  return function(f) {
    var af = a(f);
    var bf = b(f);

    return function(t) {
      return af(t) * bf(t);
    };
  };
}

var W = 1;
var H = W / 2;
var Q = H / 2;
var E = Q / 2;
var S = E / 2;
var T = S / 2;

var laser = generateNotes(
  mul(add(sin, noise()), decay(32)),
  0.25,
  0.5
);

export function playLaser() {
  playSound(laser.a4, 0, master);
}

var explosion = generateNotes(
  mul(noise(2), decay(64)),
  0.25,
  0.25
);

var explosionNotes = ['c3', 'd3', 'e3', 'f3'];

export function playExplosion() {
  playSound(explosion[sample(explosionNotes)], 0, master);
  playSound(explosion[sample(explosionNotes)], Math.random() * T, master);
  playSound(explosion[sample(explosionNotes)], 2 * Math.random() * T, master);
}

export function playMusic() {
  var syn = generateNotes(mul(sin, decay(32)), 1, 1);
  var kick = generateNotes(mul(sin, decay(64)), 0.5, 1);
  var blip = generateNotes(mul(sin, decay(32)), 0.1, 0.5);

  playSoundArray(master)([
    // Kick
    [kick.a2, H + Q],

    [kick.a2, W + Q],
    [kick.a2, W + H + Q],

    [kick.a2, 2 * W + Q],
    [kick.a2, 2 * W + H + Q],

    [kick.a2, 3 * W + Q],
    [kick.a2, 3 * W + H + Q],

    [kick.a2, 4 * W + Q],

    // Synth
    [syn.a4, H],
    [syn.d4, H + Q + E],

    [syn.e4, W + E],
    [syn.a4, W + H],
    [syn.f4, W + H + E],

    [syn.d4, 2 * W + H],
    [syn.g3, 2 * W + H + Q + E],

    [syn.a3, 3 * W + E],
    [syn.d4, 3 * W + H],
    [syn.as3, 3 * W + H + E],

    [blip.a6, W + H],
    [blip.a6, W + H + T],
    [blip.a6, W + H + S],
    [blip.c7, W + H + E],
    [blip.a6, W + H + E + S],
  ]);
}
