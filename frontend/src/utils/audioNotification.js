/**
 * Web Audio API chime generator for real-time notifications
 * Generates clean harmonic sine chimes without external audio asset downloads
 */
export const playNotificationChime = (type = 'status') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    if (type === 'new_order') {
      // Cheerful ascending major triad (C5 - E5 - G5)
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

      osc2.frequency.setValueAtTime(1046.5, now + 0.2); // C6
    } else {
      // Gentle status chime (A4 -> C#5)
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(554.37, now + 0.15);

      osc2.frequency.setValueAtTime(880, now);
    }

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    // Audio may be blocked before first user gesture; silently ignore
    console.debug('[Audio] Notification chime skipped or blocked by policy', e);
  }
};
