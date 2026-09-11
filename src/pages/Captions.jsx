import React, { useState } from "react";
import WorkspaceHeading from '@/components/WorkspaceHeading';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CaptionHistory, User } from "@/entities/all";
import { translateText } from "@/functions/translateText";
import {
  Languages,
  Type,
  Sparkles,
  Copy,
  RotateCcw,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogIn
} from "lucide-react";
import { base44 } from "@/api/base44Client";
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
      const response = await translateText({
        mode: "caption",
        text: originalText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        translation_style: translationStyle,
        gender_context: genderContext,
        tone_intensity: toneIntensity,
        dialect,
      });
      if (response.data.error) throw new Error(response.data.error);

      setTranslatedText(response.data.translation);
      setSuccess("Translation completed successfully!");
      setIsEditingOutput(false); // Reset editing mode after new translation

    } catch (error) {
      console.error("Translation error:", error);
      const status = error?.response?.status || error?.status;
      const apiMsg = error?.response?.data?.error;
      if (status === 401) setUser(null);
      setError(apiMsg || error.message || "Failed to translate caption. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleLogin = () => base44.auth.redirectToLogin(window.location.href);

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
    <div className="studio-workspace studio-tool-page min-h-screen px-6 lg:px-10 bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        <WorkspaceHeading number="02" label="English ↔ Arabic" title="Caption translation" description="A new language. The same voice. Fine-tune your dialect, tone, and context for the people you want to reach." />

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

        <div className="space-y-5">
          {/* Translation Configuration */}
          <Card className="studio-panel">
            <CardHeader className="studio-panel-header">
              <CardTitle className="flex items-center gap-3 text-base font-medium">
                <Languages className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <span className="text-white">Translation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">From</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-full bg-black/60 text-white border-white/10 rounded-xl focus:ring-offset-black">
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
                      <SelectTrigger className="flex-1 bg-black/60 text-white border-white/10 rounded-xl focus:ring-offset-black">
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
                      <SelectTrigger className="bg-black/60 text-white border-white/10 rounded-xl focus:ring-offset-black">
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
                      <SelectTrigger className="bg-black/60 text-white border-white/10 rounded-xl focus:ring-offset-black">
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
              <div className="flex flex-wrap gap-2 border-t border-border pt-5">
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
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {/* Input */}
            <Card className="studio-panel">
              <CardHeader className="studio-panel-header">
                <CardTitle className="flex items-center gap-3 text-base font-medium">
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
                    className="min-h-[240px] resize-none bg-background text-foreground border-border placeholder:text-muted-foreground"
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
                      {!user ? (
                      <Button onClick={handleLogin} className="btn-primary h-10 px-5">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In to Translate
                      </Button>
                      ) : (
                      <Button
                        onClick={translateCaption}
                        disabled={isTranslating || !originalText.trim()}
                        className="btn-primary h-10 px-5"
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
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="studio-panel">
              <CardHeader className="studio-panel-header flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-3 text-base font-medium">
                  <Languages className="w-5 h-5 text-primary" strokeWidth={1.5} />
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
                        className="min-h-[240px] resize-none bg-background text-foreground border-border"
                      />
                    ) : (
                      <div className="studio-subpanel min-h-[240px]">
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
          <Card className="studio-panel">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-border rounded-md flex items-center justify-center shrink-0">
                  <Languages className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">AI-Powered Translation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our advanced AI understands context, tone, and cultural nuances to deliver
                    high-quality translations perfect for social media and marketing content.
                    {user ? ' Your translations can be saved to your history.' : ' Sign in to translate, save your work, and access history.'}
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