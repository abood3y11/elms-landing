// Small synthesized sounds for the panel (no audio files). Only ever started from a user's press.

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = context ?? new Ctor();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, length: number, gain = 0.12, type: OscillatorType = 'sine') {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + start;
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + length + 0.05);
}

export const sounds = {
  click: () => tone(1800, 0, 0.05, 0.05, 'square'),
  chime: () => { tone(1318.5, 0, 1.2, 0.14); tone(1046.5, 0.32, 1.6, 0.14); },
  alarm: () => { for (let i = 0; i < 3; i += 1) tone(880, i * 0.28, 0.2, 0.08, 'triangle'); },
};
