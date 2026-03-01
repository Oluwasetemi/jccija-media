import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';

export const lowerThirdSchema = z.object({
  label: z.string(),
  primary: z.string(),
  secondary: z.string(),
  accent: z.enum(['purple', 'gold']),
});

export type LowerThirdProps = z.infer<typeof lowerThirdSchema>;

const ACCENT_COLORS = {
  purple: '#7c3aed',
  gold: '#f59e0b',
} as const;

// Total duration: 150 frames (5s @ 30fps)
// Slide in:  0  → ~20  frames
// Hold:      20 → 120  frames
// Slide out: 120 → 150 frames
const SLIDE_OUT_START = 120;

const LAYOUT = {
  bottomOffset: 100,
  leftOffset: 80,
  cardRadius: 4,
  accentBarWidth: 4,
  cardMinWidth: 480,
  labelFontSize: 18,
  primaryFontSize: 40,
  secondaryFontSize: 20,
} as const;

export function LowerThird({ label, primary, secondary, accent }: LowerThirdProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = ACCENT_COLORS[accent];

  // ── Slide in (spring from -700 → 0) ──────────────────────────────
  const slideIn = spring({ frame, fps, config: { damping: 200 } });
  const xIn = interpolate(slideIn, [0, 1], [-700, 0]);

  // ── Slide out (spring from 0 → -700, starts at frame 120) ────────
  const slideOut = spring({ frame: Math.max(0, frame - SLIDE_OUT_START), fps, config: { damping: 200 } });
  const xOut = interpolate(slideOut, [0, 1], [0, -700], { extrapolateLeft: 'clamp' });

  // Combined translateX — two springs summed
  const translateX = xIn + xOut;

  // ── Text stagger fade-ins (during slide-in phase) ─────────────────
  const labelOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const primaryOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const secondaryOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {/* Card — anchored to bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: LAYOUT.bottomOffset,
          left: LAYOUT.leftOffset,
          transform: `translateX(${translateX}px)`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          overflow: 'hidden',
          borderRadius: LAYOUT.cardRadius,
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            width: LAYOUT.accentBarWidth,
            backgroundColor: accentColor,
            flexShrink: 0,
          }}
        />

        {/* Text panel */}
        <div
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.90)',
            padding: '18px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: LAYOUT.cardMinWidth,
          }}
        >
          {/* Label */}
          <div
            style={{
              opacity: labelOpacity,
              fontSize: LAYOUT.labelFontSize,
              fontWeight: 600,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: accentColor,
              fontFamily: 'sans-serif',
            }}
          >
            {label}
          </div>

          {/* Primary */}
          <div
            style={{
              opacity: primaryOpacity,
              fontSize: LAYOUT.primaryFontSize,
              fontWeight: 900,
              color: '#ffffff',
              fontFamily: 'sans-serif',
              lineHeight: 1.1,
            }}
          >
            {primary}
          </div>

          {/* Secondary */}
          <div
            style={{
              opacity: secondaryOpacity,
              fontSize: LAYOUT.secondaryFontSize,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'sans-serif',
            }}
          >
            {secondary}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
