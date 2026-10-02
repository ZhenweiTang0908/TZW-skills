# TTS and timing

## Provider contract

Read `AI_HUB_BASEURL` and `AI_HUB_APIKEY` from the `ENV` file in this skill directory; `generate-voice.mjs` loads that file automatically, and a variable already set in the real environment wins over it. The primary request uses `gemini-3.8-flash-lite-tts` with voice `Kore`; fallback uses `gpt-4o-mini-tts` with voice `cedar`. POST to `https://api.inferera.com/v1/audio/speech` with `Authorization: Bearer`, `Content-Type: application/json`, and a body of `model`, `voice`, `input`, `response_format: "wav"`, and `language`; the base from `AI_HUB_BASEURL` is normalized, so a bare host, a `/v1` base, or the full endpoint all resolve to that URL. Request WAV output. Do not log headers, keys, or full provider responses.

## Scene timing

Generate one WAV per narration segment, measure it with `ffprobe`, then concatenate segments into a scene WAV. Segment measurements control subtitle cues and `syncWith` actions. Cache segments by language, text, model, voice, mock state, and processing version.

The manifest records characters, requests, fallbacks, cache hits, and actual models. Estimate cost only when a pricing JSON supplies `models.<model>.perMillionCharacters`; otherwise leave cost unknown.

## Speaking rate

The default rate is `1.2`, exposed as root `ttsSpeed` in the storyboard and `--tts-speed` on the CLI, valid from `0.5` through `3`. This keeps the narration efficient while leaving enough time for viewers to follow the highlighted interface.

Apply the rate locally with ffmpeg `atempo` rather than trusting a provider `speed` field, so every model and gateway behaves the same and the pitch is preserved; chain `atempo=2` segments above 2x. Rate changes happen before duration measurement, so subtitle cues and `syncWith` windows already reflect the final pace. Include the rate in the audio cache key and record it as `tts.speed` in the manifest.

## Tail quality

Validate RIFF/WAVE structure and positive duration. Some OpenAI-compatible gateways place a complete WAV inside the outer WAV `data` chunk; detect this nested RIFF header and unwrap the inner file before validation, caching, or rendering. Decode the final 250 ms and compare its peak with the preceding 500 ms. Treat a near-full-scale final peak (about -0.5 dBFS or above) that is materially louder than preceding audio as a probable tail burst. First trim up to 220 ms and apply a short fade-out, then remeasure. If the cleaned primary still fails, regenerate once with fallback. Record whether trimming occurred and the actual model/voice.

Also reject undecodable files, zero duration, clipping that persists outside a transient click-like tail, and large disagreement between manifest and `ffprobe` duration.

## Tests

Use `generate-voice.mjs --mock` for automated tests. It creates deterministic silent WAV files with ffmpeg, based on narration length, and exercises timing, manifest, and subtitle generation without network access or API charges.
