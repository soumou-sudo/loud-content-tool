import { Mp3Encoder } from "@breezystack/lamejs";

// Encodes mono 16 kHz PCM into a speech-quality MP3 off the main thread.
// 32 kbps mono keeps about 100 minutes of speech under Whisper's 25 MB limit.
const SAMPLE_RATE = 16000;
const BITRATE = 32;
const BLOCK = 1152 * 20;

self.onmessage = (event) => {
  try {
    const pcm = event.data.pcm;

    // Peak-normalise quiet recordings to -1 dBFS so speech is clearly audible.
    let peak = 0;
    for (let i = 0; i < pcm.length; i += 1) {
      const v = Math.abs(pcm[i]);
      if (v > peak) peak = v;
    }
    const gain = peak > 0 ? Math.min(8, 0.89 / peak) : 1;

    const encoder = new Mp3Encoder(1, SAMPLE_RATE, BITRATE);
    const parts = [];
    const block = new Int16Array(BLOCK);
    let lastReported = 0;

    for (let offset = 0; offset < pcm.length; offset += BLOCK) {
      const size = Math.min(BLOCK, pcm.length - offset);
      for (let i = 0; i < size; i += 1) {
        const s = Math.max(-1, Math.min(1, pcm[offset + i] * gain));
        block[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const out = encoder.encodeBuffer(size === BLOCK ? block : block.subarray(0, size));
      if (out.length) parts.push(new Uint8Array(out));

      const progress = Math.round(((offset + size) / pcm.length) * 100);
      if (progress - lastReported >= 5) {
        lastReported = progress;
        self.postMessage({ type: "progress", progress });
      }
    }
    const tail = encoder.flush();
    if (tail.length) parts.push(new Uint8Array(tail));

    self.postMessage({ type: "done", blob: new Blob(parts, { type: "audio/mpeg" }) });
  } catch (error) {
    self.postMessage({ type: "error", message: error?.message || "Audio encoding failed." });
  }
};
