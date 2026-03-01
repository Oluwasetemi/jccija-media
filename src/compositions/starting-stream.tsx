import { Audio } from '@remotion/media';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const startingStreamSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  audioSrc: z.string(),
});

export type StartingStreamProps = z.infer<typeof startingStreamSchema>;

const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';
const PURPLE_GLOW = '#8b5cf6';

/**
 * Controls the visual "heartbeat" of the countdown timer each second.
 *
 * TODO: Implement this function (5–10 lines).
 *
 * @param frameInSecond - how far through the current second we are (0 → fps-1)
 * @param fps           - frames per second of the composition
 * @returns
 *   scale        – multiplicative scale of the timer (e.g. 1.0 – 1.08)
 *   glowIntensity – alpha of the purple glow (0.0 – 1.0)
 *
 * Approaches to consider:
 *  • Smooth sine wave  → calming, meditative feel
 *  • Spring snap       → snappy pop on each second tick
 *  • Double-bump "heartbeat" → two pulses per second, more dramatic
 *
 * Available helpers from 'remotion': interpolate, spring, Easing
 */
function getCountdownPulse(
  frameInSecond: number,
  fps: number,
): { scale: number; glowIntensity: number } {
  // Heartbeat: two bumps per second — strong "lub" then softer "dub"
  const lub      = fps * 0.08; // peak of first beat
  const lubEnd   = fps * 0.18; // first beat settles
  const dub      = fps * 0.30; // peak of second beat
  const dubEnd   = fps * 0.42; // second beat settles

  const keyFrames = [0, lub, lubEnd, dub, dubEnd];

  const scale = interpolate(
    frameInSecond,
    keyFrames,
    [1.0, 1.08, 1.0, 1.045, 1.0],
    { extrapolateRight: 'clamp' },
  );

  const glowIntensity = interpolate(
    frameInSecond,
    keyFrames,
    [0.55, 1.0, 0.55, 0.82, 0.55],
    { extrapolateRight: 'clamp' },
  );

  return { scale, glowIntensity };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ─── component ──────────────────────────────────────────────────────────────

export function StartingStream({ title, subtitle, audioSrc }: StartingStreamProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance animations (all spring-driven, no CSS transitions)
  const entrance = spring({ frame, fps, config: { damping: 200 } });
  const subtitleOpacity = interpolate(entrance, [0, 1], [0, 1]);

  const titleEntrance = spring({ frame: frame - fps * 0.3, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(titleEntrance, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const titleY = interpolate(titleEntrance, [0, 1], [40, 0], { extrapolateLeft: 'clamp' });

  const badgeEntrance = spring({ frame: frame - fps * 0.6, fps, config: { damping: 200 } });
  const badgeOpacity = interpolate(badgeEntrance, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });

  const timerEntrance = spring({ frame: frame - fps * 1.0, fps, config: { damping: 200 } });
  const timerOpacity = interpolate(timerEntrance, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const timerY = interpolate(timerEntrance, [0, 1], [30, 0], { extrapolateLeft: 'clamp' });

  // Slow atmospheric background breathe
  const breathe = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.15),
    [-1, 1],
    [0.85, 1.0],
  );

  // Countdown state
  const remainingFrames = Math.max(0, durationInFrames - frame);
  const remainingSeconds = Math.ceil(remainingFrames / fps);
  const frameInSecond = frame % fps;
  const { scale, glowIntensity } = getCountdownPulse(frameInSecond, fps);

  return (
    <AbsoluteFill style={{ backgroundColor: '#050510', fontFamily: 'sans-serif' }}>
      {/* Atmospheric radial gradient — breathes slowly */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, #1a0533 0%, #0d0020 50%, #050510 100%)',
          opacity: breathe,
        }}
      />

      {/* Top + bottom accent bars */}
      {['top', 'bottom'].map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            [side]: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${PURPLE}, ${PURPLE_LIGHT}, ${PURPLE}, transparent)`,
            opacity: badgeOpacity,
          }}
        />
      ))}

      {/* Background worship music */}
      <Audio src={staticFile(audioSrc)} loop volume={0.7} />

      {/* ── Main content column ── */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 160px',
        }}
      >
        {/* Subtitle — presenter name */}
        <div
          style={{
            opacity: subtitleOpacity,
            fontSize: 28,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: PURPLE_LIGHT,
            marginBottom: 20,
            fontWeight: 300,
          }}
        >
          {subtitle}
        </div>

        {/* Main title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 84,
            fontWeight: 900,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: 6,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 44,
          }}
        >
          {title}
        </div>

        {/* "— Starting Soon —" divider */}
        <div
          style={{
            opacity: badgeOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 56,
          }}
        >
          <div style={{ width: 90, height: 1, background: PURPLE }} />
          <div
            style={{
              fontSize: 20,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: PURPLE,
              fontWeight: 600,
            }}
          >
            Starting Soon
          </div>
          <div style={{ width: 90, height: 1, background: PURPLE }} />
        </div>

        {/* Countdown timer */}
        <div
          style={{
            opacity: timerOpacity,
            transform: `translateY(${timerY}px) scale(${scale})`,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'monospace',
              letterSpacing: -6,
              lineHeight: 1,
              textShadow: [
                `0 0 20px rgba(139, 92, 246, ${glowIntensity})`,
                `0 0 60px rgba(139, 92, 246, ${glowIntensity * 0.6})`,
                `0 0 120px rgba(139, 92, 246, ${glowIntensity * 0.3})`,
              ].join(', '),
            }}
          >
            {formatTime(remainingSeconds)}
          </div>

          <div
            style={{
              fontSize: 16,
              color: PURPLE_LIGHT,
              letterSpacing: 6,
              textTransform: 'uppercase',
              marginTop: 18,
              opacity: 0.6,
            }}
          >
            Until We Begin
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
