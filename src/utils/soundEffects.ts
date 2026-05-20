let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextConstructor =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  audioContext = new AudioContextConstructor();
  return audioContext;
};

const startContext = async (context: AudioContext) => {
  if (context.state === "suspended") {
    await context.resume();
  }
};

export const playWrongAnswerSound = async () => {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  await startContext(context);

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(160, now);
  oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.18);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.22);
};

export const playPositiveBeepSound = async () => {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  await startContext(context);

  const now = context.currentTime;
  playTone(context, now, 659.25, 0.12);
  playTone(context, now + 0.08, 880, 0.14);
};

const playTone = (
  context: AudioContext,
  startTime: number,
  frequency: number,
  duration: number
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.08, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
};

const playSparkle = (context: AudioContext, startTime: number) => {
  const bufferSize = context.sampleRate * 0.16;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i += 1) {
    output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  filter.type = "highpass";
  filter.frequency.setValueAtTime(1800, startTime);
  gain.gain.setValueAtTime(0.045, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(startTime);
};

export const playCelebrationSound = async () => {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  await startContext(context);

  const now = context.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    playTone(context, now + index * 0.09, frequency, 0.18);
  });

  playSparkle(context, now + 0.28);
  playSparkle(context, now + 0.46);
};
