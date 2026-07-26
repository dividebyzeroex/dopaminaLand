"use client";

// Web Audio API Synthesizer & Web Haptics for Awwwards-Level Mobile Immersion

class MobileEffectsManager {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (typeof window === "undefined") return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  // Trigger Native Smartphone Vibration (Haptic Feedback)
  public haptic(type: "light" | "medium" | "heavy" | "success" = "light") {
    if (typeof window === "undefined" || !("navigator" in window) || !navigator.vibrate) return;

    try {
      switch (type) {
        case "light":
          navigator.vibrate(12);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate(45);
          break;
        case "success":
          navigator.vibrate([30, 50, 30, 50, 60]);
          break;
      }
    } catch (e) {
      // Ignore if haptics blocked by device settings
    }
  }

  // Synthesize Tactile Audio Pop / Chime without downloading external audio files
  public playSound(type: "pop" | "dopamine" | "buy" | "swipe") {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "dopamine") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "buy") {
        // High dopamine purchase chord
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
          if (!this.audioCtx) return;
          const subOsc = this.audioCtx.createOscillator();
          const subGain = this.audioCtx.createGain();
          subOsc.type = "sine";
          subOsc.frequency.setValueAtTime(freq, now + i * 0.04);
          subGain.gain.setValueAtTime(0.25, now + i * 0.04);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          subOsc.connect(subGain);
          subGain.connect(this.audioCtx.destination);
          subOsc.start(now + i * 0.04);
          subOsc.stop(now + 0.5);
        });
      } else if (type === "swipe") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Ignore if web audio blocked by browser policy before user gesture
    }
  }

  // Combined Haptic + Sound Trigger
  public trigger(action: "tab" | "pop" | "dopamine" | "buy" | "swipe") {
    switch (action) {
      case "tab":
        this.haptic("light");
        this.playSound("pop");
        break;
      case "pop":
        this.haptic("medium");
        this.playSound("pop");
        break;
      case "dopamine":
        this.haptic("heavy");
        this.playSound("dopamine");
        break;
      case "buy":
        this.haptic("success");
        this.playSound("buy");
        break;
      case "swipe":
        this.haptic("light");
        this.playSound("swipe");
        break;
    }
  }
}

export const mobileEffects = new MobileEffectsManager();
