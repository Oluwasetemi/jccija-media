import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const scriptureOverlaySchema = z.object({
  verseNumber: z.string(),              // e.g. "2" — shown as superscript
  verse: z.string(),                    // main verse text
  reference: z.string(),               // e.g. "Psalms 133:2 (KJV)"
  translation: z.string(),             // second-language verse (leave blank to hide)
  translationReference: z.string(),    // e.g. "Psaumes 133:2 (LSG)"
  tagline: z.string(),                 // gold bar at bottom
  cameraGap: z.number(),               // px from left to leave transparent for camera
});

export type ScriptureOverlayProps = z.infer<typeof scriptureOverlaySchema>;

const GOLD = '#f59e0b';
const PANEL_PADDING_H = 52;

export function ScriptureOverlay({
  verseNumber,
  verse,
  reference,
  translation,
  translationReference,
  tagline,
  cameraGap,
}: ScriptureOverlayProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: rise up + fade in
  const entrance = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);

  const hasTranslation = translation.trim().length > 0;

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      {/* Panel — right of camera gap, transparent on left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: cameraGap,
          right: 0,
          backgroundColor: 'rgba(6, 6, 14, 0.93)',
          opacity,
          transform: `translateY(${translateY}px)`,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 48,
          paddingLeft: PANEL_PADDING_H,
          paddingRight: PANEL_PADDING_H,
          paddingBottom: 0,
        }}
      >
        {/* ── Verse section ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Verse number + text */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.38,
              fontFamily: 'sans-serif',
              marginBottom: 18,
            }}
          >
            {verseNumber ? (
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: GOLD,
                  verticalAlign: 'super',
                  lineHeight: 0,
                  marginRight: 5,
                }}
              >
                {verseNumber}
              </span>
            ) : null}
            {verse}
          </div>

          {/* Reference — right-aligned, gold */}
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: GOLD,
              textAlign: 'right',
              fontFamily: 'sans-serif',
              marginBottom: 24,
            }}
          >
            {reference}
          </div>

          {/* Gold divider */}
          <div
            style={{
              height: 2,
              backgroundColor: GOLD,
              opacity: 0.55,
              marginBottom: 28,
            }}
          />

          {/* Translation (optional) */}
          {hasTranslation ? (
            <>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 400,
                  color: 'rgba(255, 255, 255, 0.82)',
                  lineHeight: 1.45,
                  fontFamily: 'sans-serif',
                  marginBottom: 14,
                }}
              >
                {verseNumber ? (
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.55)',
                      verticalAlign: 'super',
                      lineHeight: 0,
                      marginRight: 4,
                    }}
                  >
                    {verseNumber}
                  </span>
                ) : null}
                {translation}
              </div>

              <div
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'right',
                  fontFamily: 'sans-serif',
                }}
              >
                {translationReference}
              </div>
            </>
          ) : null}
        </div>

        {/* ── Gold tagline bar ───────────────────────────────── */}
        <div
          style={{
            backgroundColor: GOLD,
            marginLeft: -PANEL_PADDING_H,
            marginRight: -PANEL_PADDING_H,
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: PANEL_PADDING_H,
            paddingRight: PANEL_PADDING_H,
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#0a0808',
              letterSpacing: 10,
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
