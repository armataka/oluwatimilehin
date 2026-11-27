'use client';
// Small, quiet interface sounds, made on the fly with the Web Audio API (no files to load).
// A soft tick when you point at something you can press, a click when you press it, a clink when the coin flips,
// sand when it lifts, a whoosh when the footer opens and a chime when a case study unlocks. After Noel (nemaas.com).
// Browsers only allow sound after your first click or key press; the footer has a mute switch, remembered.
import { useEffect } from 'react';

type Name = 'tick' | 'press' | 'coin' | 'sand' | 'open' | 'close' | 'unlock';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
export const soundOn = () => { try { return localStorage.getItem('sound') !== 'off'; } catch { return true; } };

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(f: number, dur: number, vol: number, type: OscillatorType = 'sine', at = 0, glide?: number) {
  const a = audio(); if (!a || !master) return;
  const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur: number, vol: number, f0: number, f1: number, q = 0.8) {
  const a = audio(); if (!a || !master) return;
  const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 0.6;
  const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
  bp.type = 'bandpass'; bp.Q.value = q; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.buffer = buf; src.connect(bp).connect(g).connect(master); src.start(t);
}

/** One hummed syllable of the name. */
export function note(f: number, dur: number) { if (!soundOn()) return; tone(f, dur, 0.09, 'triangle'); tone(f * 2, dur * 0.8, 0.02, 'sine'); }

let lastTick = 0;
export function play(name: Name) {
  if (!soundOn() || !ctx) return;   // nothing until the first gesture has created the audio context
  switch (name) {
    case 'tick': { const n = performance.now(); if (n - lastTick < 60) return; lastTick = n; tone(2400, 0.03, 0.035, 'sine'); break; }
    case 'press': tone(880, 0.05, 0.06, 'triangle'); tone(1320, 0.04, 0.03, 'sine', 0.01); break;
    case 'coin': [2093, 3136, 4186, 5274, 6272].forEach((f, i) => tone(f * (1 + (Math.random() - 0.5) * 0.004), 0.9 - i * 0.12, 0.05 / (i + 1), 'sine', i * 0.004)); tone(2637, 0.6, 0.03, 'sine', 0.09); break;
    case 'sand': noise(0.7, 0.05, 5200, 2600, 0.6); break;
    case 'open': noise(0.45, 0.04, 400, 1800, 0.7); break;
    case 'close': noise(0.35, 0.03, 1600, 400, 0.7); break;
    case 'unlock': tone(1046.5, 0.5, 0.06, 'sine'); tone(1568, 0.7, 0.05, 'sine', 0.12); tone(2093, 0.9, 0.035, 'sine', 0.24); break;
  }
}

export function Sound() {
  useEffect(() => {
    const prime = () => { if (soundOn()) audio(); };
    const onSfx = (e: Event) => play((e as CustomEvent).detail as Name);
    const pressable = 'a[href], button, [role="radio"], .row, .toy';
    let lastOver: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = (e.target as Element).closest?.(pressable);
      if (t && t !== lastOver) play('tick');
      lastOver = t;
    };
    const down = (e: PointerEvent) => { prime(); if ((e.target as Element).closest?.(pressable) && !(e.target as Element).closest('.coin')) play('press'); };
    addEventListener('pointerdown', down, true); addEventListener('keydown', prime, true);
    addEventListener('pointerover', over, true); addEventListener('sfx', onSfx);
    return () => { removeEventListener('pointerdown', down, true); removeEventListener('keydown', prime, true); removeEventListener('pointerover', over, true); removeEventListener('sfx', onSfx); };
  }, []);
  return null;
}
