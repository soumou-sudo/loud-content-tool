// Pulls the audio track out of a video or audio file in the browser and turns
// it into a small mono 16 kHz MP3. Speech recognition only needs this, and it
// lets large videos fit under the transcription service's 25 MB request limit.

const TARGET_RATE = 16000;

export async function extractSpeechAudio(file, onProgress = () => {}) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || !window.OfflineAudioContext || !window.Worker) {
    throw new Error("This browser cannot extract audio. Please use a recent version of Chrome, Edge or Safari.");
  }

  onProgress({ stage: "reading", progress: 0 });
  const buffer = await file.arrayBuffer();

  onProgress({ stage: "decoding", progress: 0 });
  const ctx = new AudioCtx();
  let decoded;
  try {
    decoded = await ctx.decodeAudioData(buffer);
  } catch {
    throw new Error("Could not read the audio in this file. Try exporting it as MP4 (H.264/AAC) or MP3.");
  } finally {
    ctx.close?.();
  }

  if (!decoded || decoded.duration < 0.2) {
    throw new Error("This file has no audible audio track.");
  }

  // Resample and mix down to mono 16 kHz.
  const length = Math.ceil(decoded.duration * TARGET_RATE);
  const offline = new OfflineAudioContext(1, length, TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const pcm = rendered.getChannelData(0).slice();

  onProgress({ stage: "encoding", progress: 0 });
  const blob = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/mp3Encoder.worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === "progress") onProgress({ stage: "encoding", progress: msg.progress });
      if (msg.type === "done") { worker.terminate(); resolve(msg.blob); }
      if (msg.type === "error") { worker.terminate(); reject(new Error(msg.message)); }
    };
    worker.onerror = () => { worker.terminate(); reject(new Error("Audio encoding failed.")); };
    worker.postMessage({ pcm }, [pcm.buffer]);
  });

  const baseName = (file.name || "audio").replace(/\.[^/.]+$/, "");
  return {
    file: new File([blob], `${baseName}.mp3`, { type: "audio/mpeg" }),
    duration: decoded.duration,
  };
}
