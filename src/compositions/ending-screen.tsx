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

export const endingScreenSchema = z.object({
  audioSrc: z.string(),
});

export type EndingScreenProps = z.infer<typeof endingScreenSchema>;

const PURPLE_LIGHT = '#a78bfa';
const GOLD = '#f59e0b';

export function EndingScreen({ audioSrc }: EndingScreenProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Staggered entrances
  const titleEntrance = spring({ frame, fps, config: { damping: 200 } });
  const goldEntrance = spring({ frame: frame - fps * 0.6, fps, config: { damping: 200 } });
  const taglineEntrance = spring({ frame: frame - fps * 1.1, fps, config: { damping: 200 } });

  const titleOpacity = interpolate(titleEntrance, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntrance, [0, 1], [40, 0]);
  const goldOpacity = interpolate(goldEntrance, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const taglineOpacity = interpolate(taglineEntrance, [0, 1], [0, 0.7], {
    extrapolateLeft: 'clamp',
  });

  // Fade to black over last 3 seconds
  const fadeToBlack = interpolate(
    frame,
    [durationInFrames - fps * 3, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Audio fades out over last 5 seconds
  const audioVolume = interpolate(
    frame,
    [durationInFrames - fps * 5, durationInFrames],
    [0.7, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Slow background breathe
  const bgPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.15),
    [-1, 1],
    [0.85, 1.0],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#050510', fontFamily: 'sans-serif' }}>
      {/* Background */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, #1a0533 0%, #0d0020 50%, #050510 100%)',
          opacity: bgPulse,
        }}
      />

      {/* Gold accent bars — different from purple on other screens */}
      {(['top', 'bottom'] as const).map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            [side]: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${GOLD}, #fbbf24, ${GOLD}, transparent)`,
            opacity: titleOpacity,
          }}
        />
      ))}

      {/* Audio with volume fade-out */}
      <Audio src={staticFile(audioSrc)} loop volume={audioVolume} />

      {/* Content */}
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
            opacity: titleOpacity,
            fontSize: 28,
            letterSpacing: 10,
            textTransform: 'uppercase',
            color: PURPLE_LIGHT,
            marginBottom: 20,
            fontWeight: 300,
          }}
        >
          JCCI JA
        </div>

        {/* Two-line headline */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            marginBottom: 44,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: 6,
              lineHeight: 1.1,
            }}
          >
            Thank You
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: 6,
              lineHeight: 1.1,
            }}
          >
            For Joining Us
          </div>
        </div>

        {/* Gold blessing */}
        <div
          style={{
            opacity: goldOpacity,
            fontSize: 30,
            color: GOLD,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          God Bless You
        </div>

        {/* Year tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 20,
            color: PURPLE_LIGHT,
            letterSpacing: 4,
          }}
        >
          This is our year of unprecedented help
        </div>
      </AbsoluteFill>

      {/* Fade-to-black overlay — composites over everything */}
      <AbsoluteFill
        style={{
          backgroundColor: '#000000',
          opacity: fadeToBlack,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
