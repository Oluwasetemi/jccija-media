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

export const brbScreenSchema = z.object({
  audioSrc: z.string(),
});

export type BrbScreenProps = z.infer<typeof brbScreenSchema>;

const PURPLE = '#7c3aed';
const PURPLE_LIGHT = '#a78bfa';

export function BrbScreen({ audioSrc }: BrbScreenProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const entrance = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scaleIn = interpolate(entrance, [0, 1], [0.9, 1]);

  // Float oscillation — completes one cycle every ~5 seconds
  const floatY = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.4),
    [-1, 1],
    [-10, 10],
  );

  // Glow pulses at a different frequency to avoid lock-step with float
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.27),
    [-1, 1],
    [0.4, 0.8],
  );

  // Slow background breathe
  const bgPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.15),
    [-1, 1],
    [0.85, 1.0],
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

      {/* Accent bars */}
      {(['top', 'bottom'] as const).map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            [side]: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${PURPLE}, ${PURPLE_LIGHT}, ${PURPLE}, transparent)`,
            opacity,
          }}
        />
      ))}

      {/* Background music */}
      <Audio src={staticFile(audioSrc)} loop volume={0.7} />

      {/* Main content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Church label */}
        <div
          style={{
            opacity,
            fontSize: 28,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: PURPLE_LIGHT,
            marginBottom: 24,
            fontWeight: 300,
          }}
        >
          JCCI JA
        </div>

        {/* BRB hero text — floats */}
        <div
          style={{
            opacity,
            transform: `translateY(${floatY}px) scale(${scaleIn})`,
            fontSize: 130,
            fontWeight: 900,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: 8,
            textShadow: [
              `0 0 30px rgba(139, 92, 246, ${glowPulse})`,
              `0 0 80px rgba(139, 92, 246, ${glowPulse * 0.5})`,
            ].join(', '),
          }}
        >
          Be Right Back
        </div>

        {/* Sub-text floats at half amplitude */}
        <div
          style={{
            opacity: interpolate(entrance, [0, 1], [0, 0.65]),
            transform: `translateY(${floatY * 0.4}px)`,
            fontSize: 24,
            color: PURPLE_LIGHT,
            letterSpacing: 4,
            marginTop: 28,
          }}
        >
          We'll be back shortly
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
