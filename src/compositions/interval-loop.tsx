import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const intervalLoopSchema = z.object({
  preamble: z.string(),   // small top line  e.g. "This is our year of"
  highlight: z.string(),  // large gold word  e.g. "Unprecedented"
  noun: z.string(),       // large white word e.g. "Help"
});

export type IntervalLoopProps = z.infer<typeof intervalLoopSchema>;

const PURPLE_LIGHT = '#a78bfa';
const GOLD = '#f59e0b';

export function IntervalLoop({ preamble, highlight, noun }: IntervalLoopProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // sin(x * 2π) over the full duration = frame 0 and frame N are identical.
  // This is the key to a seamless loop with zero manual tweaking.
  const sineLoop = Math.sin((frame / durationInFrames) * Math.PI * 2);

  // Scale breathes very subtly across the whole loop
  const scale = interpolate(sineLoop, [-1, 1], [0.97, 1.03]);

  // Glow intensity
  const glow = interpolate(sineLoop, [-1, 1], [0.3, 1.0]);

  // Shimmer sweep — one horizontal pass per second across "UNPRECEDENTED"
  const shimmerPos = interpolate(frame % fps, [0, fps - 1], [-300, 300]);

  // Background at a 2× frequency for subtle interference against the scale pulse
  const bgPulse = interpolate(
    Math.sin((frame / durationInFrames) * Math.PI * 4),
    [-1, 1],
    [0.75, 1.0],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#050510', fontFamily: 'sans-serif' }}>
      {/* Atmospheric background */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, #1a0533 0%, #0d0020 50%, #050510 100%)',
          opacity: bgPulse,
        }}
      />

      {/* Content — whole block scales together */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
        }}
      >
        {/* Preamble line */}
        <div
          style={{
            fontSize: 36,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: PURPLE_LIGHT,
            fontWeight: 300,
            marginBottom: 16,
            opacity: interpolate(glow, [0.3, 1.0], [0.5, 1.0]),
          }}
        >
          {preamble}
        </div>

        {/* UNPRECEDENTED — gold with horizontal shimmer sweep */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 4,
            color: GOLD,
            lineHeight: 1,
            marginBottom: 4,
            textShadow: [
              `0 0 20px rgba(245, 158, 11, ${glow})`,
              `0 0 60px rgba(245, 158, 11, ${glow * 0.5})`,
              `${shimmerPos}px 0 30px rgba(252, 211, 77, 0.35)`,
            ].join(', '),
          }}
        >
          {highlight}
        </div>

        {/* HELP */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 14,
            color: '#ffffff',
            lineHeight: 1,
            textShadow: `0 0 20px rgba(139, 92, 246, ${glow * 0.8})`,
          }}
        >
          {noun}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
