import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import OpenAI from 'npm:openai@4.57.0';
import { toFile } from 'npm:openai@4.57.0/uploads';
import { secrets } from 'base44:runtime';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const PAUSE_SPLIT_THRESHOLD = 1.2;
const STRONG_PAUSE_SPLIT_THRESHOLD = 0.6;
const MAX_SEGMENT_DURATION = 6;
const MAX_SEGMENT_CHARS = 90;
const MIN_SEGMENT_CHARS = 18;
const MIN_SEGMENT_WORDS = 3;
const FALLBACK_WORDS_PER_CUE = 8;
// Short sample-style text (NOT instructions) so auto mode keeps Arabic in Arabic
// script instead of romanizing it. Long instruction prompts make Whisper loop.
const BILINGUAL_STYLE_PROMPT = 'Hello everyone. مرحبا بكم.';

export default async function(req) {
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
      const requestedWords = Number(body?.words_per_segment);
      wordsPerSegment = Number.isFinite(requestedWords) && requestedWords >= 1 ? Math.floor(requestedWords) : 0;

      if (fileUrl) {
        const fetched = await fetchPublicMedia(fileUrl);
        if (!fetched.ok) {
          return Response.json({ error: 'Could not read the uploaded file.' }, { status: 400 });
        }

        const contentLength = Number(fetched.headers.get('content-length') || 0);
        if (contentLength > MAX_FILE_SIZE_BYTES) {
          return Response.json({ error: 'File is too large. Please upload a file under 25MB.' }, { status: 400 });
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

    const openai = new OpenAI({ apiKey: secrets.get('OPENAI_API_KEY') });
    const safeName = mediaFile.name || filename;
    const fileForOpenAI = await toFile(mediaFile, safeName);

    // No `prompt` is sent: Whisper treats the prompt as preceding transcript text,
    // which makes it echo/loop and duplicate segments until the end of the file.
    const transcription = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: 'whisper-1',
      ...(requestedLanguage ? {} : { prompt: BILINGUAL_STYLE_PROMPT }),
      temperature: 0,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      ...(requestedLanguage ? { language: requestedLanguage } : {}),
    });

    const rawSegments = dropHallucinatedSegments(transcription.segments || []);
    const normalizedSegments = ensureMixedLanguageSegments(rawSegments);
    const smartSegments = splitOverlongSegments(buildSmartSegments(normalizedSegments));
    const withoutRepeats = dropRepeatedSegments(smartSegments);
    const segments = wordsPerSegment > 0 ? splitSegmentsByWordCount(withoutRepeats, wordsPerSegment) : withoutRepeats;
    const finalSegments = segments.length > 0
      ? segments
      : buildFallbackSegments(transcription.text, transcription.duration);
    const srtContent = finalSegments
      .map((segment, index) => `${index + 1}\n${formatTime(segment.start)} --> ${formatTime(segment.end)}\n${segment.text.trim()}\n`)
      .join('\n')
      .trim();

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

    if (error?.message === 'Invalid uploaded file URL.') {
      return Response.json({ error: 'Invalid uploaded file URL.' }, { status: 400 });
    }

    return Response.json({ error: 'Transcription failed. Please try again.' }, { status: 500 });
  }
}

async function fetchPublicMedia(inputUrl) {
  let currentUrl = new URL(String(inputUrl));

  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    await assertPublicHttpsUrl(currentUrl);
    const response = await fetch(currentUrl, { redirect: 'manual' });

    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    if (redirectCount === 3) throw new Error('Invalid uploaded file URL.');

    const location = response.headers.get('location');
    if (!location) throw new Error('Invalid uploaded file URL.');
    currentUrl = new URL(location, currentUrl);
  }

  throw new Error('Invalid uploaded file URL.');
}

async function assertPublicHttpsUrl(url) {
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Invalid uploaded file URL.');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Invalid uploaded file URL.');
  }

  if (isBlockedAddress(hostname)) throw new Error('Invalid uploaded file URL.');

  const lookups = await Promise.allSettled([
    Deno.resolveDns(hostname, 'A'),
    Deno.resolveDns(hostname, 'AAAA'),
  ]);
  const addresses = lookups.flatMap((result) => result.status === 'fulfilled' ? result.value : []);

  if (!addresses.length || addresses.some(isBlockedAddress)) {
    throw new Error('Invalid uploaded file URL.');
  }
}

function isBlockedAddress(address) {
  const value = String(address).toLowerCase().replace(/^\[|\]$/g, '');
  const mappedIpv4 = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mappedIpv4) return isBlockedIpv4(mappedIpv4);

  if (value.includes(':')) {
    return value === '::' || value === '::1' || value.startsWith('fc') ||
      value.startsWith('fd') || /^fe[89ab]/.test(value);
  }

  return isBlockedIpv4(value);
}

function isBlockedIpv4(address) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(address)) return false;
  const parts = address.split('.').map(Number);
  if (parts.some((part) => part < 0 || part > 255)) return true;
  const [a, b] = parts;

  return a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224;
}

function normalizeRequestedLanguage(language) {
  const value = String(language || '').trim().toLowerCase();
  if (!value || value === 'auto') return '';
  if (value === 'english' || value === 'en') return 'en';
  if (value === 'arabic' || value === 'ar') return 'ar';
  return '';
}

// Whisper sometimes returns one very long segment for a whole passage. Merging
// logic alone can never break that up, so split it on sentence ends, then on
// word chunks, keeping timing proportional to the text.
function splitOverlongSegments(segments) {
  return segments.flatMap((segment) => {
    const duration = Math.max(segment.end - segment.start, 0.01);
    const pieces = splitIntoReadablePieces(segment.text, duration);
    if (pieces.length <= 1) return [segment];

    const totalChars = pieces.reduce((sum, piece) => sum + piece.length, 0) || pieces.length;
    let cursor = segment.start;

    return pieces.map((piece, index) => {
      const isLast = index === pieces.length - 1;
      const pieceEnd = isLast
        ? segment.end
        : Math.min(segment.end, cursor + (duration * piece.length) / totalChars);
      const cue = { start: cursor, end: pieceEnd, text: piece, language: segment.language };
      cursor = pieceEnd;
      return cue;
    });
  });
}

function splitIntoReadablePieces(text, duration) {
  const fullText = String(text || '').trim();
  if (!fullText) return [];

  // One cue should never carry several sentences, so sentence ends split first.
  const sentences = fullText
    .split(/(?<=[.!?؟…])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const totalChars = fullText.length || 1;

  return sentences.flatMap((sentence) => {
    const sentenceDuration = (duration * sentence.length) / totalChars;
    const chunksNeeded = Math.max(
      Math.ceil(sentence.length / MAX_SEGMENT_CHARS),
      Math.ceil(sentenceDuration / MAX_SEGMENT_DURATION)
    );

    if (chunksNeeded <= 1) return [sentence];

    // A single long sentence with no punctuation still has to be broken up,
    // so chunk it on word boundaries into evenly sized pieces.
    const words = sentence.split(/\s+/).filter(Boolean);
    const wordsPerChunk = Math.ceil(words.length / chunksNeeded);
    const chunks = [];

    for (let index = 0; index < words.length; index += wordsPerChunk) {
      chunks.push(words.slice(index, index + wordsPerChunk).join(' '));
    }

    return chunks.filter(Boolean);
  });
}

// Whisper marks looped/hallucinated audio with a poor average logprob or a high
// no-speech probability, and repeated text inflates the compression ratio.
function dropHallucinatedSegments(rawSegments) {
  return rawSegments.filter((segment) => {
    const noSpeechProb = Number(segment.no_speech_prob);
    const avgLogprob = Number(segment.avg_logprob);
    const compressionRatio = Number(segment.compression_ratio);

    if (Number.isFinite(noSpeechProb) && noSpeechProb > 0.6) return false;
    if (Number.isFinite(avgLogprob) && avgLogprob < -1) return false;
    if (Number.isFinite(compressionRatio) && compressionRatio > 2.4) return false;

    return true;
  });
}

// Collapses the runaway "same line over and over" tail Whisper produces when it
// gets stuck, while leaving genuine repeated phrases (a line said twice) intact.
function dropRepeatedSegments(segments) {
  const result = [];
  let previousKey = '';
  let repeatCount = 0;

  for (const segment of segments) {
    const key = repeatKey(segment.text);

    if (key && key === previousKey) {
      repeatCount += 1;
      if (repeatCount >= 2) continue;
    } else {
      repeatCount = 0;
      previousKey = key;
    }

    result.push(segment);
  }

  return result;
}

function repeatKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Used only when Whisper returns no usable timed segments: spreads the plain
// transcript over the media duration instead of dumping it into one cue.
function buildFallbackSegments(text, duration) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

  if (!words.length) {
    return [{ start: 0, end: 4, text: 'No speech detected' }];
  }

  const totalDuration = Number(duration) > 0 ? Number(duration) : words.length * 0.45;
  const wordDuration = totalDuration / words.length;
  const cues = [];

  for (let index = 0; index < words.length; index += FALLBACK_WORDS_PER_CUE) {
    const chunk = words.slice(index, index + FALLBACK_WORDS_PER_CUE);
    cues.push({
      start: wordDuration * index,
      end: wordDuration * (index + chunk.length),
      text: chunk.join(' '),
    });
  }

  return cues;
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

  // No tiny-segment rebalancing here: the user asked for an exact word count per
  // line, and merging short chunks back would silently double some lines.
  return chunkedSegments.map(finalizeSegment);
}

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}