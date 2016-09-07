var AudioContext = window.AudioContext || window.webkitAudioContext;
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

const convolver = audioContext.createConvolver();
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

  offlineCtx.startRendering()
    .then(function(buffer) {
      convolver.buffer = buffer;
    });
}

// A4 to A3.
renderLowPassOffline(convolver, 440, 220, 1);

function sin(f) {
  return function(t) {
    return Math.sin(t * 2 * Math.PI * f) * Math.exp(-t * 32);
  };
}

export default function() {
  var buffer = generateNotes(sin, 1, 1);

  var buffer2 = generateAudioBuffer(sin(toFreq(69 - 2 * 12)), 0.5, 1);
  var buffer3 = generateAudioBuffer(sin(toFreq(69 + 2 * 12)), 0.1, 0.5);
  var buffer4 = generateAudioBuffer(sin(toFreq(69 + 2 * 12 + 3)), 0.1, 0.5);

  playSoundArray(master)([
    [buffer.a4, 0.5],
    [buffer2, 0.75],
    [buffer.d4, 0.875],
    [buffer.a4, 1],
    [buffer.e4, 1.125],
    [buffer2, 1.25],
    [buffer.a4, 1.5],
    [buffer.f4, 1.625],
    [buffer3, 1.5],
    [buffer3, 1.5 + (1/16)],
    [buffer3, 1.5 + (1/32)],
    [buffer3, 1.5 + (3/16)],
    [buffer4, 1.5 + (1/8)],
  ]);
}
