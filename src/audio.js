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

var wet = audioContext.createGain();
wet.gain.value = 0.5;
wet.connect(audioContext.destination);

var dry = audioContext.createGain();
dry.gain.value = 1 - wet.gain.value;
dry.connect(audioContext.destination);

const convolver = audioContext.createConvolver();
convolver.connect(wet);

var master = audioContext.createGain();
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

renderLowPassOffline(convolver, 440, 220, 1);

function sin(f) {
  return function(t) {
    return Math.sin(t * 2 * Math.PI * f) * Math.exp(-t * 32);
  };
}

export default function() {
  var buffer = generateAudioBuffer(sin(toFreq(69)), 1, 1);
  playSound(buffer, 0.5, master);
  playSound(buffer, 1, master);
  var buffer2 = generateAudioBuffer(sin(toFreq(69 - 2 * 12)), 0.5, 1);
  var buffer3 = generateAudioBuffer(sin(toFreq(69 + 2 * 12)), 0.1, 1);
  var buffer4 = generateAudioBuffer(sin(toFreq(69 + 2 * 12 + 3)), 0.1, 1);
  playSound(buffer2, 0.75, master);
  playSound(buffer2, 1.25, master);
  playSound(buffer3, 1.5, master);
  playSound(buffer3, 1.5 + (1/16), master);
  playSound(buffer3, 1.5 + (1/32), master);
  playSound(buffer3, 1.5 + (3/16), master);
  playSound(buffer4, 1.5 + (1/8), master);
}
