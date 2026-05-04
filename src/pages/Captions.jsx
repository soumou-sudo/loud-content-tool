import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CaptionHistory, User } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import {
  Languages,
  Type,
  Sparkles,
  Copy,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";

export default function Captions() {
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("english");
  const [targetLanguage, setTargetLanguage] = useState("arabic");
  const [translationStyle, setTranslationStyle] = useState("formal");
  const [genderContext, setGenderContext] = useState("both");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [toneIntensity, setToneIntensity] = useState(0); // -2 to +2
  const [isEditingOutput, setIsEditingOutput] = useState(false);
  const [dialect, setDialect] = useState("msa"); // New state for dialect

  const toneLabel = (v) => {
    if (v <= -2) return "Softer / More Neutral";
    if (v === -1) return "Less Intense";
    if (v === 0) return "Balanced";
    if (v === 1) return "More Energetic";
    return "Highly Energetic";
  };

  React.useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const translateCaption = async () => {
    if (!originalText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    if (originalText.trim().length < 10) {
      setError("Caption should be at least 10 characters long");
      return;
    }

    setIsTranslating(true);
    setError(null);
    setSuccess(null);

    try {
      const dialectLabelMap = {
        msa: "Modern Standard (Fusha)",
        egyptian: "Egyptian",
        levantine: "Levantine (Shami)",
        gulf: "Gulf (Khaleeji)",
        maghrebi: "Maghrebi (Morocco/Algeria/Tunisia)",
        iraqi: "Iraqi",
        sudanese: "Sudanese",
        yemeni: "Yemeni",
      };

      const toneSection = targetLanguage !== 'arabic'
        ? `Tone Adjustment: ${toneIntensity} (${toneLabel(toneIntensity)}).`
        : '';

      const toneGuidelines = targetLanguage !== 'arabic'
        ? `Guidelines: negative values mean calmer/neutral tone, positive values mean more energetic/enthusiastic.`
        : '';

      const dialectSection = targetLanguage === 'arabic'
        ? `Arabic Dialect: ${dialectLabelMap[dialect] || dialect}. Use this dialect consistently and naturally.`
        : '';

      const prompt = `
        Translate the following ${sourceLanguage} caption to ${targetLanguage} with these specifications:

        Translation Style: ${translationStyle}
        ${targetLanguage === 'arabic' ? `Gender Context: ${genderContext}` : ''}
        ${toneSection}
        ${dialectSection}
        ${toneGuidelines}

        Core Requirements:
        - Preserve the original meaning, intent, and emotional tone
        - Adapt for ${translationStyle === 'marketing' ? 'marketing/social media' : translationStyle} context
        - Keep it natural, fluent, and audience-ready
        - Preserve hashtags, mentions, emojis, URLs, and promo codes exactly unless they clearly need translation
        - Do NOT translate brand names, product names, app names, company names, campaign names, or named entities unless there is a widely used established translation
        - If a brand or product name is written in English, usually keep it in English
        - Do not translate slogans, taglines, or product feature names literally if that makes them sound unnatural; rewrite them in a way that feels native while keeping the original intent
        - Avoid word-for-word translation
        - Length should be appropriate for social media (4-10 lines)
        ${targetLanguage === 'arabic' ? `- Use appropriate gender forms for ${genderContext} audience` : ''}

        ${sourceLanguage === 'english' && targetLanguage === 'arabic' ? `
        English to Arabic rules:
        - Prioritize natural Arabic phrasing over literal sentence structure
        - Restructure sentences when needed so they sound like they were originally written in Arabic
        - Use idiomatic Arabic and culturally natural wording
        - Keep marketing copy persuasive, smooth, and modern
        - Do not mirror English wording mechanically
        - If the English phrase is awkward when translated literally, rewrite it into natural ${dialectLabelMap[dialect] || dialect} Arabic
        ` : ''}

        Original caption: "${originalText}"

        Return only the final translated caption text with no explanations, no labels, and no quotation marks.
      `;

      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setTranslatedText(result.trim());
      setSuccess("Translation completed successfully!");
      setIsEditingOutput(false); // Reset editing mode after new translation

    } catch (error) {
      console.error("Translation error:", error);
      setError("Failed to translate caption. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const saveToHistory = async () => {
    if (!user) {
      setError("Please sign in to save translation history");
      return;
    }

    if (!translatedText) {
      setError("No translation to save");
      return;
    }

    try {
      await CaptionHistory.create({
        original_text: originalText,
        translated_text: translatedText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        translation_style: translationStyle,
        gender_context: genderContext,
        user_id: user.id
      });

      setSuccess("Translation saved to history!");
    } catch (error) {
      console.error("Save error:", error);
      setError("Failed to save translation");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setSuccess("Copied to clipboard!");
    } catch (error) {
      setError("Failed to copy to clipboard");
    }
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);

    if (translatedText) {
      setOriginalText(translatedText);
      setTranslatedText("");
    }
    setIsEditingOutput(false); // Reset editing mode when swapping languages
  };

  const resetForm = () => {
    setOriginalText("");
    setTranslatedText("");
    setError(null);
    setSuccess(null);
    setIsEditingOutput(false); // Reset editing mode
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-5xl mx-auto section-fade">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 pill border-[rgba(245,217,10,0.35)] bg-[rgba(245,217,10,0.08)] text-yellow-400">
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">AI Translation Studio</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Caption Translation</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Intelligent Arabic-English translation with full customization for tone, style, and context
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto bg-red-900/20 border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-8 max-w-2xl mx-auto bg-green-900/20 border-green-800">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Translation Configuration */}
          <Card className="glass-effect border-gray-800 shadow-xl bg-gray-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Translation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">From</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-full bg-black text-white border-gray-700 focus:ring-offset-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700 text-white">
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">To</label>
                  <div className="flex gap-2">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="flex-1 bg-black text-white border-gray-700 focus:ring-offset-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-700 text-white">
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={swapLanguages}
                      className="shrink-0 btn-outline-dark"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Style, Context, Tone or Dialect */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Translation Style */}
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-300">Translation Style</label>
                  <Select value={translationStyle} onValueChange={setTranslationStyle}>
                    <SelectTrigger className="bg-black text-white border-gray-700 focus:ring-offset-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700 text-white">
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="informal">Informal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="literal">Literal</SelectItem>
                      <SelectItem value="marketing">Marketing-Adapted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Context if Arabic */}
                {targetLanguage === 'arabic' && (
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-gray-300">Gender Context</label>
                    <Select value={genderContext} onValueChange={setGenderContext}>
                      <SelectTrigger className="bg-black text-white border-gray-700 focus:ring-offset-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-700 text-white">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="both">Both/Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Dialect if Arabic; else Tone Slider */}
                {targetLanguage === 'arabic' ? (
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-gray-300">Dialect</label>
                    <Select value={dialect} onValueChange={setDialect}>
                      <SelectTrigger className="bg-black text-white border-gray-700 focus:ring-offset-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gray-700 text-white">
                        <SelectItem value="msa">Modern Standard (Fusha)</SelectItem>
                        <SelectItem value="egyptian">Egyptian</SelectItem>
                        <SelectItem value="levantine">Levantine (Shami)</SelectItem>
                        <SelectItem value="gulf">Gulf (Khaleeji)</SelectItem>
                        <SelectItem value="maghrebi">Maghrebi</SelectItem>
                        <SelectItem value="iraqi">Iraqi</SelectItem>
                        <SelectItem value="sudanese">Sudanese</SelectItem>
                        <SelectItem value="yemeni">Yemeni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className={`space-y-2 ${targetLanguage === 'arabic' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                    <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                      <span>Tone Adjustment</span>
                      <span className="text-xs text-gray-400">{toneLabel(toneIntensity)}</span>
                    </label>
                    <div className="px-1">
                      <Slider
                        value={[toneIntensity]}
                        min={-2}
                        max={2}
                        step={1}
                        onValueChange={(v) => setToneIntensity(v[0])}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Calmer</span><span>Balanced</span><span>Energetic</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Settings Display */}
              <div className="flex flex-wrap gap-2 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Badge variant="outline" className="border-gray-700 text-gray-300 bg-gray-800">
                  {sourceLanguage} → {targetLanguage}
                </Badge>
                <Badge variant="outline" className="border-gray-700 text-gray-300 bg-gray-800">
                  {translationStyle}
                </Badge>
                {targetLanguage === 'arabic' && (
                  <>
                    <Badge variant="outline" className="border-gray-700 text-gray-300 bg-gray-800">
                      {genderContext}
                    </Badge>
                    <Badge variant="outline" className="border-gray-700 text-gray-300 bg-gray-800">
                      Dialect: {dialect === 'msa' ? 'Fusha' : dialect}
                    </Badge>
                  </>
                )}
                {targetLanguage !== 'arabic' && (
                  <Badge variant="outline" className="border-gray-700 text-gray-300 bg-gray-800">
                    Tone: {toneLabel(toneIntensity)}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Translation Interface */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input */}
            <Card className="glass-effect border-gray-800 shadow-xl bg-gray-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Original Caption</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="Enter your caption text here (4-10 lines recommended)..."
                    className="min-h-[200px] resize-none bg-black text-white border-gray-700 placeholder:text-gray-500 focus-visible:ring-offset-black"
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      {originalText.length}/1000 characters
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        disabled={isTranslating}
                        className="btn-outline-dark"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={translateCaption}
                        disabled={isTranslating || !originalText.trim()}
                        className="btn-primary bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <Languages className="w-4 h-4 mr-2" />
                            Translate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="glass-effect border-gray-800 shadow-xl bg-gray-900/40">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Translated Caption</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingOutput(!isEditingOutput)}
                  className="btn-outline-dark"
                  disabled={!translatedText}
                >
                  {isEditingOutput ? 'Preview' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent>
                {translatedText ? (
                  <div className="space-y-4">
                    {isEditingOutput ? (
                      <Textarea
                        value={translatedText}
                        onChange={(e) => setTranslatedText(e.target.value)}
                        className="min-h-[220px] resize-none bg-black text-white border-gray-700 focus-visible:ring-offset-black focus-visible:ring-2 focus-visible:ring-yellow-500"
                      />
                    ) : (
                      <div className="bg-black border border-gray-800 rounded-xl p-4 min-h-[200px]">
                        <div className="whitespace-pre-wrap text-white">
                          {translatedText}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="flex-1 btn-outline-dark"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      {user && (
                        <Button
                          onClick={saveToHistory}
                          variant="outline"
                          className="flex-1 btn-outline-dark"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter text and click translate to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="glass-effect border border-white/10 bg-[#0b0b0b] hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">AI-Powered Translation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our advanced AI understands context, tone, and cultural nuances to deliver
                    high-quality translations perfect for social media and marketing content.
                    {user ? ' Sign in to save your translation history.' : ' Sign in to save your translations and access history.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}