import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai@4.57.0';
import { toFile } from 'npm:openai@4.57.0/uploads';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const PAUSE_SPLIT_THRESHOLD = 1.2;
const STRONG_PAUSE_SPLIT_THRESHOLD = 0.6;
const MAX_SEGMENT_DURATION = 6;
const MAX_SEGMENT_CHARS = 90;
const MIN_SEGMENT_CHARS = 18;
const MIN_SEGMENT_WORDS = 3;
const MULTILINGUAL_PROMPT = 'Transcribe exactly what is spoken. This audio may switch between English and Arabic. Keep each spoken language as originally spoken and do not translate, normalize, or rewrite one language into the other.';

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
    let wordsPerSegment = 0;
    let requestedLanguage = '';

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
      requestedLanguage = normalizeRequestedLanguage(body?.transcription_language);
      filename = body?.filename || filename;
      mimeType = body?.mime_type || mimeType;
      wordsPerSegment = Math.max(1, Number(body?.words_per_segment) || 0);

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
      prompt: buildTranscriptionPrompt(requestedLanguage),
      temperature: 0,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      ...(requestedLanguage ? { language: requestedLanguage } : {}),
    });

    const rawSegments = transcription.segments || [];
    const normalizedSegments = ensureMixedLanguageSegments(rawSegments);
    const smartSegments = buildSmartSegments(normalizedSegments);
    const segments = wordsPerSegment > 0 ? splitSegmentsByWordCount(smartSegments, wordsPerSegment) : smartSegments;
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

function normalizeRequestedLanguage(language) {
  const value = String(language || '').trim().toLowerCase();
  if (!value || value === 'auto') return '';
  if (value === 'english' || value === 'en') return 'en';
  if (value === 'arabic' || value === 'ar') return 'ar';
  return '';
}

function buildTranscriptionPrompt(requestedLanguage) {
  if (requestedLanguage === 'en') {
    return 'Transcribe exactly what is spoken in English. Do not translate, summarize, or rewrite the speech.';
  }

  if (requestedLanguage === 'ar') {
    return 'Transcribe exactly what is spoken in Arabic. Do not translate, summarize, or rewrite the speech.';
  }

  return MULTILINGUAL_PROMPT;
}

function ensureMixedLanguageSegments(rawSegments) {
  return rawSegments.flatMap((segment) => {
    const start = Number(segment.start) || 0;
    const end = Number(segment.end) || 0;
    const text = String(segment.text || '').replace(/\s+/g, ' ').trim();

    if (!text || end <= start) return [];

    const splitParts = splitMixedLanguageText(text);
    if (splitParts.length <= 1) return [{ ...segment, text }];

    const totalChars = splitParts.reduce((sum, part) => sum + part.text.length, 0) || splitParts.length;
    let cursor = start;

    return splitParts.map((part, index) => {
      const isLast = index === splitParts.length - 1;
      const ratio = part.text.length / totalChars;
      const partDuration = isLast ? Math.max(0.01, end - cursor) : Math.max(0.01, (end - start) * ratio);
      const partStart = cursor;
      const partEnd = isLast ? end : Math.min(end, cursor + partDuration);
      cursor = partEnd;

      return {
        ...segment,
        start: partStart,
        end: partEnd,
        text: part.text,
        language: part.language,
        detected_language: part.language,
      };
    });
  });
}

function buildSmartSegments(rawSegments) {
  const cleanedSegments = rawSegments
    .map((segment) => {
      const text = (segment.text || '').replace(/\s+/g, ' ').trim();
      const detectedLanguage = normalizeLanguage(segment.language || segment.lang || segment.detected_language || '');
      const inferredLanguage = inferLanguageFromText(text);

      return {
        start: Number(segment.start) || 0,
        end: Number(segment.end) || 0,
        text,
        language: detectedLanguage || inferredLanguage,
        inferredLanguage,
      };
    })
    .filter((segment) => segment.text && segment.end > segment.start);

  if (!cleanedSegments.length) return [];

  const mergedSegments = [];
  let current = { ...cleanedSegments[0] };

  for (let index = 1; index < cleanedSegments.length; index += 1) {
    const next = cleanedSegments[index];
    const pauseDuration = next.start - current.end;
    const currentDuration = current.end - current.start;
    const currentWordCount = countWords(current.text);
    const shouldSplitForLanguage = hasLanguageSwitch(current, next);
    const shouldSplitForPause = pauseDuration >= PAUSE_SPLIT_THRESHOLD;
    const shouldSplitForSentence = endsWithStrongBoundary(current.text) && pauseDuration >= 0.35;
    const shouldSplitForStrongPause = pauseDuration >= STRONG_PAUSE_SPLIT_THRESHOLD && currentWordCount >= MIN_SEGMENT_WORDS;
    const shouldSplitForLength = currentDuration >= MAX_SEGMENT_DURATION || current.text.length >= MAX_SEGMENT_CHARS;

    if (shouldSplitForLanguage || shouldSplitForPause || shouldSplitForSentence || shouldSplitForStrongPause || shouldSplitForLength) {
      mergedSegments.push(finalizeSegment(current));
      current = { ...next };
      continue;
    }

    current = mergeSegments(current, next);
  }

  mergedSegments.push(finalizeSegment(current));
  return rebalanceTinySegments(mergedSegments);
}

function normalizeLanguage(language) {
  return String(language || '').trim().toLowerCase();
}

function splitMixedLanguageText(text) {
  const tokens = String(text || '').match(/[^\s]+|\s+/g) || [];
  const parts = [];
  let currentText = '';
  let currentLanguage = '';

  for (const token of tokens) {
    const tokenLanguage = inferLanguageFromText(token) || currentLanguage;

    if (!currentText) {
      currentText = token;
      currentLanguage = tokenLanguage;
      continue;
    }

    const shouldSplit = Boolean(
      tokenLanguage &&
      currentLanguage &&
      tokenLanguage !== currentLanguage &&
      /\S/.test(token)
    );

    if (shouldSplit) {
      parts.push({ text: currentText.trim(), language: currentLanguage });
      currentText = token;
      currentLanguage = tokenLanguage;
      continue;
    }

    currentText += token;
    currentLanguage = currentLanguage || tokenLanguage;
  }

  if (currentText.trim()) {
    parts.push({ text: currentText.trim(), language: currentLanguage });
  }

  return parts.filter((part) => part.text);
}

function inferLanguageFromText(text) {
  const value = String(text || '').trim();
  if (!value) return '';

  const arabicChars = (value.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (value.match(/[A-Za-z]/g) || []).length;

  if (arabicChars >= 1 && arabicChars >= latinChars) return 'arabic';
  if (latinChars >= 1 && latinChars > arabicChars) return 'english';
  return '';
}

function hasLanguageSwitch(current, next) {
  const currentLanguage = normalizeLanguage(current.language || current.inferredLanguage);
  const nextLanguage = normalizeLanguage(next.language || next.inferredLanguage);
  return Boolean(currentLanguage && nextLanguage && currentLanguage !== nextLanguage);
}

function endsWithStrongBoundary(text) {
  return /[.!?؟…:;]$/.test(String(text || '').trim());
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function mergeSegments(current, next) {
  return {
    start: current.start,
    end: next.end,
    text: `${current.text} ${next.text}`.trim(),
    language: current.language || next.language,
    inferredLanguage: current.inferredLanguage || next.inferredLanguage,
  };
}

function finalizeSegment(segment) {
  return {
    start: segment.start,
    end: segment.end,
    text: String(segment.text || '').replace(/\s+/g, ' ').trim(),
    language: segment.language || segment.inferredLanguage || '',
  };
}

function rebalanceTinySegments(segments) {
  if (segments.length <= 1) return segments;

  const balanced = [];

  for (const segment of segments) {
    const previous = balanced[balanced.length - 1];
    const isTiny = segment.text.length < MIN_SEGMENT_CHARS || countWords(segment.text) < 2;
    const sameLanguageAsPrevious = previous && !hasLanguageSwitch(previous, segment);
    const canMergeBack = previous && sameLanguageAsPrevious && !endsWithStrongBoundary(previous.text);

    if (isTiny && canMergeBack) {
      balanced[balanced.length - 1] = mergeSegments(previous, segment);
      continue;
    }

    balanced.push(segment);
  }

  return balanced;
}

function splitSegmentsByWordCount(segments, wordsPerSegment) {
  const chunkedSegments = segments.flatMap((segment) => {
    const words = segment.text.split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    if (words.length <= wordsPerSegment) return [segment];

    const duration = Math.max(segment.end - segment.start, 0.01);
    const wordDuration = duration / words.length;
    const chunks = [];

    for (let index = 0; index < words.length; index += wordsPerSegment) {
      const wordChunk = words.slice(index, index + wordsPerSegment);
      chunks.push({
        start: segment.start + wordDuration * index,
        end: segment.start + wordDuration * (index + wordChunk.length),
        text: wordChunk.join(' '),
        language: segment.language || inferLanguageFromText(wordChunk.join(' ')),
      });
    }

    return chunks;
  });

  return rebalanceTinySegments(chunkedSegments.map(finalizeSegment));
}

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}