import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const LANGUAGES = ['english', 'arabic'];
const STYLES = ['formal', 'informal', 'casual', 'literal', 'marketing'];
const GENDERS = ['male', 'female', 'both'];
const DIALECTS = {
  msa: 'Modern Standard (Fusha)',
  egyptian: 'Egyptian',
  levantine: 'Levantine (Shami)',
  gulf: 'Gulf (Khaleeji)',
  maghrebi: 'Maghrebi (Morocco/Algeria/Tunisia)',
  iraqi: 'Iraqi',
  sudanese: 'Sudanese',
  yemeni: 'Yemeni',
};
const MAX_CAPTION_CHARS = 1000;
const MAX_SRT_CHARS = 30000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Your session has expired. Please sign in again to translate.' }, { status: 401 });

    const body = await req.json();
    const mode = body?.mode === 'srt' ? 'srt' : 'caption';
    const text = String(body?.text || '').trim();
    const targetLanguage = LANGUAGES.includes(body?.target_language) ? body.target_language : 'arabic';
    const dialect = DIALECTS[body?.dialect] || DIALECTS.msa;

    if (!text) return Response.json({ error: 'No text to translate.' }, { status: 400 });
    if (text.length > (mode === 'srt' ? MAX_SRT_CHARS : MAX_CAPTION_CHARS)) {
      return Response.json({ error: 'Text is too long to translate.' }, { status: 400 });
    }

    const prompt = mode === 'srt'
      ? buildSrtPrompt(text, targetLanguage, dialect)
      : buildCaptionPrompt(text, {
          sourceLanguage: LANGUAGES.includes(body?.source_language) ? body.source_language : 'english',
          targetLanguage,
          style: STYLES.includes(body?.translation_style) ? body.translation_style : 'formal',
          gender: GENDERS.includes(body?.gender_context) ? body.gender_context : 'both',
          tone: Math.max(-2, Math.min(2, Math.round(Number(body?.tone_intensity) || 0))),
          dialect,
        });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
    });

    return Response.json({ translation: String(result || '').trim() });
  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ error: `Translation failed: ${error?.message || 'unknown error'}` }, { status: 500 });
  }
}

function toneLabel(v) {
  if (v <= -2) return 'Softer / More Neutral';
  if (v === -1) return 'Less Intense';
  if (v === 0) return 'Balanced';
  if (v === 1) return 'More Energetic';
  return 'Highly Energetic';
}

function buildCaptionPrompt(text, { sourceLanguage, targetLanguage, style, gender, tone, dialect }) {
  const isArabic = targetLanguage === 'arabic';
  return `
Translate the following ${sourceLanguage} caption to ${targetLanguage} with these specifications:

Translation Style: ${style}
${isArabic ? `Gender Context: ${gender}` : ''}
${!isArabic ? `Tone Adjustment: ${tone} (${toneLabel(tone)}).` : ''}
${isArabic ? `Arabic Dialect: ${dialect}. Use this dialect consistently and naturally.` : ''}
${!isArabic ? 'Guidelines: negative values mean calmer/neutral tone, positive values mean more energetic/enthusiastic.' : ''}

Core Requirements:
- Preserve the original meaning, intent, and emotional tone
- Adapt for ${style === 'marketing' ? 'marketing/social media' : style} context
- Keep it natural, fluent, and audience-ready
- Preserve hashtags, mentions, emojis, URLs, and promo codes exactly unless they clearly need translation
- Do NOT translate brand names, product names, app names, company names, campaign names, or named entities unless there is a widely used established translation
- If a brand or product name is written in English, usually keep it in English
- Do not translate slogans, taglines, or product feature names literally if that makes them sound unnatural; rewrite them in a way that feels native while keeping the original intent
- Avoid word-for-word translation
- Length should be appropriate for social media (4-10 lines)
${isArabic ? `- Use appropriate gender forms for ${gender} audience` : ''}

${sourceLanguage === 'english' && isArabic ? `
English to Arabic rules:
- Prioritize natural Arabic phrasing over literal sentence structure
- Restructure sentences when needed so they sound like they were originally written in Arabic
- Use idiomatic Arabic and culturally natural wording
- Keep marketing copy persuasive, smooth, and modern
- Do not mirror English wording mechanically
- If the English phrase is awkward when translated literally, rewrite it into natural ${dialect} Arabic
` : ''}

Original caption: "${text}"

Return only the final translated caption text with no explanations, no labels, and no quotation marks.
`;
}

function buildSrtPrompt(srt, targetLanguage, dialect) {
  const dialectText = targetLanguage === 'arabic'
    ? `\nArabic Dialect: ${dialect}.\nUse authentic phrasing of this dialect while remaining clear for broad audiences.\n`
    : '';
  return `
Translate the subtitle text within the following SRT content to ${targetLanguage}.
- Keep all SRT numbering and timestamp lines EXACTLY as they are.
- Translate ONLY the dialogue text lines (the lines after the timestamps).
- Do not add, remove, merge, or split segments.
- Preserve existing line breaks and keep punctuation natural.
${dialectText}
Original SRT:
"""
${srt}
"""

Return only the translated SRT content, with timestamps untouched.
`;
}