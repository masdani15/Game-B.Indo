// Synthesized classroom-friendly Web Audio API sound effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    slideToFreq?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playTap() {
    this.playTone(620, 0.055, 'sine', 0.09, 0, 740);
  }

  /**
   * Neutral crystalline glass chime played on EVERY answer submission
   * so students cannot tell from audio whether an answer was right or wrong.
   */
  public playAnswerSubmit() {
    this.playTone(587.33, 0.09, 'sine', 0.14, 0);
    this.playTone(880, 0.14, 'triangle', 0.12, 0.055);
  }

  public playRelaySwitch() {
    this.playTone(783.99, 0.07, 'sine', 0.07, 0, 987.77);
  }

  public playCountdownBeep(isFinalGo = false) {
    if (isFinalGo) {
      this.playTone(587.33, 0.12, 'triangle', 0.18, 0);
      this.playTone(783.99, 0.12, 'triangle', 0.18, 0.08);
      this.playTone(1046.5, 0.32, 'sine', 0.2, 0.16);
    } else {
      this.playTone(440, 0.13, 'sine', 0.14, 0);
    }
  }

  public playUrgentTick() {
    this.playTone(940, 0.045, 'sine', 0.07, 0);
  }

  public playMatchEnd() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.25, 'triangle', 0.15, idx * 0.09);
    });
    this.playTone(1046.5, 0.5, 'sine', 0.17, 0.4);
  }

  public playChampionFanfare() {
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 523.25, d: 0.14, t: 0.15 },
      { f: 523.25, d: 0.14, t: 0.3 },
      { f: 659.25, d: 0.35, t: 0.45 },
      { f: 587.33, d: 0.16, t: 0.82 },
      { f: 659.25, d: 0.16, t: 1.0 },
      { f: 783.99, d: 0.55, t: 1.18 },
      { f: 1046.5, d: 0.7, t: 1.4 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'triangle', 0.18, m.t);
    });
  }
}

export const soundEngine = new SoundEngine();
