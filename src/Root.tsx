import { Composition } from 'remotion';
import { staticFile } from 'remotion';
import { StartingStream, startingStreamSchema } from './compositions/starting-stream';
import { BrbScreen, brbScreenSchema } from './compositions/brb-screen';
import { EndingScreen, endingScreenSchema } from './compositions/ending-screen';
import { IntervalLoop, intervalLoopSchema } from './compositions/interval-loop';
import { LowerThird, lowerThirdSchema } from './compositions/lower-third';
import { ScriptureOverlay, scriptureOverlaySchema } from './compositions/scripture-overlay';

const AUDIO_FILE = 'worship-session.mp3';
const FPS = 30;
const FALLBACK_DURATION_FRAMES = FPS * 60 * 10; // 10-minute fallback

async function audioDuration(audioSrc: string): Promise<number> {
  const { Input, ALL_FORMATS, UrlSource } = await import('mediabunny');
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(staticFile(audioSrc), { getRetryDelay: () => null }),
  });
  return input.computeDuration();
}

export function RemotionRoot() {
  return (
    <>
      {/* ── Starting Soon ──────────────────────────────────────── */}
      <Composition
        id="StartingStream"
        component={StartingStream}
        schema={startingStreamSchema}
        durationInFrames={FALLBACK_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Welcomes You To Church',
          subtitle: 'JCCI JA',
          audioSrc: AUDIO_FILE,
        }}
        calculateMetadata={async ({ props }) => {
          try {
            const secs = await audioDuration(props.audioSrc);
            return { durationInFrames: Math.ceil(secs * FPS) };
          } catch {
            return { durationInFrames: FALLBACK_DURATION_FRAMES };
          }
        }}
      />
      {/* ── Be Right Back ──────────────────────────────────────── */}
      <Composition
        id="BrbScreen"
        component={BrbScreen}
        schema={brbScreenSchema}
        durationInFrames={FALLBACK_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: AUDIO_FILE }}
        calculateMetadata={async ({ props }) => {
          try {
            const secs = await audioDuration(props.audioSrc);
            return { durationInFrames: Math.ceil(secs * FPS) };
          } catch {
            return { durationInFrames: FALLBACK_DURATION_FRAMES };
          }
        }}
      />
      {/* ── Ending Screen ──────────────────────────────────────── */}
      <Composition
        id="EndingScreen"
        component={EndingScreen}
        schema={endingScreenSchema}
        durationInFrames={FPS * 30} // 30-second outro
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: AUDIO_FILE }}
      />
      {/* ── Interval Loop (GIF-ready) ──────────────────────────── */}
      <Composition
        id="IntervalLoop"
        component={IntervalLoop}
        schema={intervalLoopSchema}
        durationInFrames={FPS * 4} // 4-second seamless loop
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          preamble: 'This is our year of',
          highlight: 'Unprecedented',
          noun: 'Help',
        }}
      />
      {/* ── Lower Third ────────────────────────────────────────── */}
      <Composition
        id="LowerThird"
        component={LowerThird}
        schema={lowerThirdSchema}
        durationInFrames={FPS * 5} // 5-second lower third
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          label: 'PASTOR',
          primary: 'Paul Bamgbose',
          secondary: 'Jubilee | JCCI JA',
          accent: 'purple' as const,
        }}
      />
      {/* ── Scripture Overlay (WebM + alpha for OBS) ───────── */}
      <Composition
        id="ScriptureOverlay"
        component={ScriptureOverlay}
        schema={scriptureOverlaySchema}
        durationInFrames={FPS * 20} // 20-second default hold
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          verseNumber: '2',
          verse:
            "It is like the precious ointment upon the head, that ran down upon the beard, even Aaron's beard: that went down to the skirts of his garments;",
          reference: 'Psalms 133:2 (KJV)',
          translation:
            "C'est comme l'huile précieuse qui, répandue sur la tête, Descend sur la barbe, sur la barbe d'Aaron, Qui descend sur le bord de ses vêtements.",
          translationReference: 'Psaumes 133:2 (LSG)',
          tagline: 'Intimacy | Partnership | Fellowship',
          cameraGap: 380,
        }}
      />
    </>
  );
}
