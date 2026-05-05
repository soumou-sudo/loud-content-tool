import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai@4.57.0';
import { toFile } from 'npm:openai@4.57.0/uploads';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const PAUSE_SPLIT_THRESHOLD = 1.2;
const MAX_SEGMENT_DURATION = 6;
const MAX_SEGMENT_CHARS = 90;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Please sign in before starting transcription.' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let mediaFile = null;
    let filename = 'media';
    let mimeType = 'audio/mpeg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('video') || formData.get('audio') || formData.get('file');
      if (file && typeof file !== 'string') {
        mediaFile = file;
        filename = file.name || filename;
        mimeType = file.type || mimeType;
      }
    } else {
      const body = await req.json();
      const fileUrl = body?.file_url;
      filename = body?.filename || filename;
      mimeType = body?.mime_type || mimeType;

      if (fileUrl) {
        const fetched = await fetch(fileUrl);
        if (!fetched.ok) {
          return Response.json({ error: 'Could not read the uploaded file.' }, { status: 400 });
        }

        const blob = await fetched.blob();
        const detectedType = mimeType || blob.type || 'application/octet-stream';
        mediaFile = new File([blob], filename, { type: detectedType });
      }
    }

    if (!mediaFile) {
      return Response.json({ error: 'No media file was provided.' }, { status: 400 });
    }

    if (mediaFile.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: 'File is too large. Please upload a file under 25MB.' }, { status: 400 });
    }

    const safeName = mediaFile.name || filename;
    const fileForOpenAI = await toFile(mediaFile, safeName);

    const transcription = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const rawSegments = transcription.segments || [];
    const segments = buildSmartSegments(rawSegments);
    const srtContent = segments.length > 0
      ? segments
          .map((segment, index) => `${index + 1}\n${formatTime(segment.start)} --> ${formatTime(segment.end)}\n${segment.text.trim()}\n`)
          .join('\n')
          .trim()
      : `1\n00:00:00,000 --> 00:00:04,000\n${(transcription.text || 'No speech detected').trim()}\n`;

    return Response.json({
      success: true,
      subtitles: srtContent,
      duration: transcription.duration || 0,
      language: transcription.language || 'unknown',
    });
  } catch (error) {
    console.error('Transcription error:', error);

    if (error?.status === 401) {
      return Response.json({ error: 'Please sign in before starting transcription.' }, { status: 401 });
    }

    if (error?.code === 'file_not_supported') {
      return Response.json({ error: 'File format not supported. Please use MP4, MOV, MKV, MP3, WAV, M4A, or OGG.' }, { status: 400 });
    }

    if (error?.code === 'file_too_large') {
      return Response.json({ error: 'File is too large. Please upload a file under 25MB.' }, { status: 400 });
    }

    return Response.json({
      error: error?.message || 'Transcription failed. Please try again.',
    }, { status: 500 });
  }
});

function buildSmartSegments(rawSegments) {
  const cleanedSegments = rawSegments
    .map((segment) => ({
      start: Number(segment.start) || 0,
      end: Number(segment.end) || 0,
      text: (segment.text || '').replace(/\s+/g, ' ').trim(),
    }))
    .filter((segment) => segment.text && segment.end > segment.start);

  if (!cleanedSegments.length) return [];

  const mergedSegments = [];
  let current = { ...cleanedSegments[0] };

  for (let index = 1; index < cleanedSegments.length; index += 1) {
    const next = cleanedSegments[index];
    const pauseDuration = next.start - current.end;
    const currentDuration = current.end - current.start;
    const shouldSplitForPause = pauseDuration >= PAUSE_SPLIT_THRESHOLD;
    const shouldSplitForSentence = /[.!?…:]$/.test(current.text) && pauseDuration >= 0.45;
    const shouldSplitForLength = currentDuration >= MAX_SEGMENT_DURATION || current.text.length >= MAX_SEGMENT_CHARS;

    if (shouldSplitForPause || shouldSplitForSentence || shouldSplitForLength) {
      mergedSegments.push(current);
      current = { ...next };
      continue;
    }

    current = {
      start: current.start,
      end: next.end,
      text: `${current.text} ${next.text}`.trim(),
    };
  }

  mergedSegments.push(current);
  return mergedSegments;
}

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}