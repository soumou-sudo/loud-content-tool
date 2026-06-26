import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { transcribeVideo } from "@/functions/transcribeVideo.js";
import {
  Upload,
  Video,
  FileText,
  Download,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Cpu,
  Circle,
  Mic,
  Languages
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvokeLLM, UploadFile } from "@/integrations/Core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

const MAX_FILE_SIZE_MB = 25; // OpenAI Whisper limit
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const AGENT_STEPS = [
  { id: 1, message: "Initializing AI transcription agent..." },
  { id: 2, message: "Uploading file to OpenAI processing servers...", action: 'upload' },
  { id: 3, message: "Extracting audio track..." },
  { id: 4, message: "Running OpenAI Whisper speech-to-text model...", action: 'transcribe' },
  { id: 5, message: "Analyzing speech patterns and creating timestamps..." },
  { id: 6, message: "Converting transcription to SRT subtitle format..." },
  { id: 7, message: "Finalizing subtitles and preparing download..." },
];

export default function Subtitles() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [agentStep, setAgentStep] = useState(-1);
  const [subtitles, setSubtitles] = useState("");
  const [editedSubtitles, setEditedSubtitles] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptionInfo, setTranscriptionInfo] = useState(null);
  const fileInputRef = useRef(null);

  const [translateTarget, setTranslateTarget] = useState("arabic");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dialect, setDialect] = useState("msa");
  const [isTranslatingSub, setIsTranslatingSub] = useState(false);
  const [segmentationMode, setSegmentationMode] = useState("auto");
  const [wordsPerSentence, setWordsPerSentence] = useState(8);
  const [sectionsCount, setSectionsCount] = useState(10);

  const supportedFormats = [
    'video/mp4', 'video/mov', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska',
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/ogg', 'audio/webm'
  ];

  const arabicDialects = [
    { value: "msa", label: "Modern Standard (Fusha)" },
    { value: "egyptian", label: "Egyptian" },
    { value: "levantine", label: "Levantine (Shami)" },
    { value: "gulf", label: "Gulf (Khaleeji)" },
    { value: "maghrebi", label: "Maghrebi (Morocco/Algeria/Tunisia)" },
    { value: "iraqi", label: "Iraqi" },
    { value: "sudanese", label: "Sudanese" },
    { value: "yemeni", label: "Yemeni" }
  ];

  const progressPercent = processing && agentStep >= 0
    ? Math.min(100, Math.round(((agentStep + 1) / AGENT_STEPS.length) * 100))
    : 0;

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!supportedFormats.includes(selectedFile.type)) {
      setError("Please upload a supported video or audio format (MP4, MOV, AVI, MKV, MP3, WAV, M4A, OGG)");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Please upload a file under ${MAX_FILE_SIZE_MB} MB for OpenAI Whisper processing.`);
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const runAgentStep = async (stepIndex) => {
    setAgentStep(stepIndex);
    const step = AGENT_STEPS[stepIndex];
    if (!step.action) {
      await new Promise(res => setTimeout(res, 1500));
    }
  };

  const processVideo = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      setError("Please sign in before starting transcription.");
      return;
    }

    setProcessing(true);
    setAgentStep(0);
    setError(null);
    setSubtitles("");
    setEditedSubtitles("");
    setTranscriptionInfo(null);

    try {
      // Step 1: Initialize
      await runAgentStep(0);

      // Step 2: Upload and process
      await runAgentStep(1);

      // Step 3-4: Extract audio and transcribe
      await runAgentStep(2);

      // Upload file first to get a URL (works for both video and audio)
      const { file_url } = await UploadFile({ file });

      // Proceed to transcription
      await runAgentStep(3);
      const response = await transcribeVideo({
        file_url,
        filename: file.name,
        mime_type: file.type,
        words_per_segment: segmentationMode === "fixed" ? Number(wordsPerSentence) || 0 : 0,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Step 5-7: Format and finalize
      await runAgentStep(4);
      await runAgentStep(5);
      await runAgentStep(6);

      const result = response.data;
      setSubtitles(result.subtitles);
      setEditedSubtitles(result.subtitles);
      setTranscriptionInfo({
        duration: result.duration,
        language: result.language,
        segments: result.subtitles.split('\n\n').length
      });

    } catch (error) {
      console.error("Transcription error:", error);
      const apiMsg = error?.response?.data?.error || error?.response?.data?.details?.message;
      setError(apiMsg || error.message || "Failed to transcribe file. Please check your file and try again.");
      if ((error?.response?.status || error?.status) === 401) {
        setIsAuthenticated(false);
      }
      setAgentStep(-1);
    } finally {
      setProcessing(false);
    }
  };

  const downloadSubtitles = (format) => {
    if (!editedSubtitles) return;

    let content = editedSubtitles;
    let filename = `${file?.name?.replace(/\.[^/.]+$/, "") || "subtitles"}.${format}`;
    let mimeType = 'text/plain';

    if (format === 'vtt') {
      content = 'WEBVTT\n\n' + content.replace(/(\d+)\n/g, '').replace(/,/g, '.');
      mimeType = 'text/vtt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetProcess = () => {
    setFile(null);
    setSubtitles("");
    setEditedSubtitles("");
    setAgentStep(-1);
    setError(null);
    setIsEditing(false);
    setProcessing(false);
    setTranscriptionInfo(null);
    setTranslateTarget("arabic");
    setDialect("msa");
    setIsTranslatingSub(false);
    setSegmentationMode("auto");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const translateSubtitles = async () => {
    if (!editedSubtitles.trim()) return;
    setIsTranslatingSub(true);
    setError(null);

    try {
      const dialectText = translateTarget === 'arabic'
        ? `
Arabic Dialect: ${arabicDialects.find(d => d.value === dialect)?.label || dialect}.
Use authentic phrasing of this dialect while remaining clear for broad audiences.
`
        : '';

      const prompt = `
Translate the subtitle text within the following SRT content to ${translateTarget}.
- Keep all SRT numbering and timestamp lines EXACTLY as they are.
- Translate ONLY the dialogue text lines (the lines after the timestamps).
- Do not add, remove, merge, or split segments.
- Preserve existing line breaks and keep punctuation natural.
${dialectText}

Original SRT:
"""
${editedSubtitles}
"""

Return only the translated SRT content, with timestamps untouched.
`;
      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setEditedSubtitles(result.trim());
      setIsEditing(false);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate subtitles. Please try again.");
    } finally {
      setIsTranslatingSub(false);
    }
  };

  // SRT utilities and re-segmentation helpers
  const srtTimeToSeconds = (t) => {
    const [h, m, rest] = t.split(':');
    const [s, ms] = rest.split(',');
    return (+h)*3600 + (+m)*60 + (+s) + (+ms)/1000;
  };
  const secondsToSrtTime = (sec) => {
    const safe = Math.max(0, Number(sec) || 0);
    const totalMs = Math.round(safe * 1000);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    const pad = (n, l=2) => String(n).padStart(l, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(ms,3)}`;
  };
  const parseSRT = (srt) => {
    const blocks = (srt || '').trim().split(/\n\s*\n/);
    const cues = [];
    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim());
      if (lines.length < 2) continue;
      let idx = 0;
      if (/^\d+$/.test(lines[0])) idx = 1;
      const timeMatch = lines[idx]?.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
      if (!timeMatch) continue;
      const start = srtTimeToSeconds(timeMatch[1]);
      const end = srtTimeToSeconds(timeMatch[2]);
      const text = lines.slice(idx+1).join(' ').replace(/\s+/g,' ').trim();
      cues.push({ start, end, text });
    }
    return cues;
  };
  const formatSRT = (cues) => {
    return cues.map((c, i) => `${i+1}\n${secondsToSrtTime(c.start)} --> ${secondsToSrtTime(c.end)}\n${c.text}\n`).join('\n\n').trim();
  };
  const applyWordsPerSentence = () => {
    const max = Math.max(1, Number(wordsPerSentence) || 1);
    const cues = parseSRT(editedSubtitles || subtitles || '');
    if (!cues.length) return;

    const timedWords = cues.flatMap((cue) => {
      const words = cue.text.split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      const duration = Math.max(cue.end - cue.start, 0.01);
      const wordDuration = duration / words.length;

      return words.map((word, index) => ({
        text: word,
        start: cue.start + wordDuration * index,
        end: cue.start + wordDuration * (index + 1),
      }));
    });

    if (!timedWords.length) return;

    const newCues = [];
    for (let index = 0; index < timedWords.length; index += max) {
      const chunk = timedWords.slice(index, index + max);
      newCues.push({
        start: chunk[0].start,
        end: chunk[chunk.length - 1].end,
        text: chunk.map((word) => word.text).join(' '),
      });
    }

    setEditedSubtitles(formatSRT(newCues));
    setIsEditing(false);
  };
  const applySectionsCount = () => {
    const n = Math.max(1, Number(sectionsCount) || 1);
    const cues = parseSRT(editedSubtitles || subtitles || '');
    if (!cues.length) return;
    const total = cues.reduce((acc, c) => acc + (c.end - c.start), 0);
    const target = total / n;
    const groups = [];
    let curGroup = [];
    let curDur = 0;
    for (const cue of cues) {
      curGroup.push(cue);
      curDur += (cue.end - cue.start);
      if (groups.length < n - 1 && curDur >= target) {
        groups.push(curGroup);
        curGroup = [];
        curDur = 0;
      }
    }
    if (curGroup.length) groups.push(curGroup);
    const newCues = groups.map(g => ({
      start: g[0].start,
      end: g[g.length - 1].end,
      text: g.map(x => x.text).join(' ').replace(/\s+/g,' ').trim()
    }));
    setEditedSubtitles(formatSRT(newCues));
    setIsEditing(false);
  };

  const AgentProgress = () => (
    <div className="space-y-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
      {/* Thin progress bar for smoothness */}
      <div className="h-1 w-full bg-gray-800 rounded overflow-hidden mb-1">
        <div
          className="h-1 bg-yellow-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
          <Cpu className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h4 className="font-semibold text-white">OpenAI Whisper Agent</h4>
          <p className="text-sm text-gray-400">Transcribing your file...</p>
        </div>
      </div>

      {AGENT_STEPS.map((step, index) => {
        const isCompleted = agentStep > index;
        const isInProgress = agentStep === index;

        return (
          <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
            isCompleted ? 'bg-green-900/20' : isInProgress ? 'bg-yellow-900/20' : 'bg-gray-900'
          }`}>
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : isInProgress ? (
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            ) : (
              <Circle className="w-4 h-4 text-gray-600" />
            )}
            <span className={`text-sm ${
              isCompleted ? 'text-green-400' : isInProgress ? 'font-medium text-yellow-400' : 'text-gray-500'
            }`}>
              {step.message}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-black text-gray-300">
      <div className="max-w-6xl mx-auto section-fade">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border text-yellow-400"
               style={{ borderColor: 'rgba(245,217,10,0.35)', background: 'rgba(245,217,10,0.08)' }}>
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">OpenAI Whisper Integration</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Audio & Video Transcription</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your video or audio file and our AI will extract all spoken words with precise timestamps using OpenAI's Whisper
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto bg-red-900 border-red-700 text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-effect border-0 shadow-xl bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="w-5 h-5 text-yellow-400" />
                Upload Video or Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive ? 'border-yellow-400 bg-gray-800' : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Drop your video or audio here</h3>
                  <p className="text-gray-400 mb-4">or click to browse</p>
                  <Button onClick={() => fileInputRef.current?.click()}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105">
                    Choose File
                  </Button>
                  <div className="mt-4 text-sm text-gray-500">
                    Supported: MP4, MOV, AVI, MKV, MP3, WAV, M4A, OGG. Max size: {MAX_FILE_SIZE_MB}MB
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl border border-gray-700">
                    <Video className="w-8 h-8 text-yellow-400" />
                    <div className="flex-1">
                      <div className="font-medium text-white">{file.name}</div>
                      <div className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    {subtitles ? (
                      <Badge className="bg-green-900 text-green-400 hover:bg-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete
                      </Badge>
                    ) : processing ? (
                      <Badge className="bg-yellow-900 text-yellow-400 hover:bg-yellow-800">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700">Ready</Badge>
                    )}
                  </div>

                  {!processing && !subtitles && (
                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 space-y-4">
                      <div>
                        <Label className="text-gray-300 text-sm">Segmentation mode</Label>
                        <Select value={segmentationMode} onValueChange={setSegmentationMode}>
                          <SelectTrigger className="mt-2 bg-black text-white border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-gray-700 text-white">
                            <SelectItem value="auto">AI smart auto</SelectItem>
                            <SelectItem value="fixed">Fixed words per segment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {segmentationMode === "fixed" ? (
                        <div>
                          <Label htmlFor="preprocess-wps" className="text-gray-300 text-sm">Words per segment before transcription</Label>
                          <Input
                            id="preprocess-wps"
                            type="number"
                            min={1}
                            value={wordsPerSentence}
                            onChange={(e) => setWordsPerSentence(e.target.value)}
                            className="mt-2 bg-black text-white border-gray-700"
                          />
                          <p className="text-xs text-gray-500 mt-2">Use this when you want a consistent line length.</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 leading-relaxed">
                          AI smart auto splits subtitles based on pauses, stops, breath moments, sentence flow, and language changes for more natural caption timing.
                        </p>
                      )}
                    </div>
                  )}

                  {processing && <AgentProgress />}

                  {transcriptionInfo && (
                    <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 font-medium">Transcription Complete!</span>
                      </div>
                      <div className="text-sm text-yellow-400">
                        Duration: {Math.round(transcriptionInfo.duration)}s &bull;
                        Language: {transcriptionInfo.language} &bull;
                        Segments: {transcriptionInfo.segments} &bull;
                        Mode: {segmentationMode === "auto" ? "AI smart auto" : "Fixed words"}
                      </div>
                    </div>
                  )}

                  {!processing && !subtitles && (
                    isAuthenticated ? (
                      <Button onClick={processVideo} 
                              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                        <Mic className="w-4 h-4 mr-2" />
                        Transcribe with OpenAI Whisper
                      </Button>
                    ) : (
                      <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                        <Mic className="w-4 h-4 mr-2" />
                        Sign In to Transcribe
                      </Button>
                    )
                  )}

                  {!processing && (
                    <Button
                      variant="outline"
                      onClick={resetProcess}
                      className="w-full btn-outline-dark text-white"
                    >
                      Process Different File
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-xl bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-yellow-400" />
                Transcribed Subtitles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subtitles ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {editedSubtitles.split('\n\n').length} segments
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-outline-dark text-white"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditing ? 'Preview' : 'Edit'}
                    </Button>
                  </div>

                  {isEditing ? (
                    <Textarea
                      value={editedSubtitles}
                      onChange={(e) => setEditedSubtitles(e.target.value)}
                      className="min-h-[300px] font-mono text-sm bg-gray-800 text-gray-300 border-gray-700 focus:border-yellow-400"
                    />
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-4 max-h-[300px] overflow-y-auto border border-gray-700">
                      <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300">
                        {editedSubtitles}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => downloadSubtitles('srt')}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download SRT
                    </Button>
                    <Button
                      onClick={() => downloadSubtitles('vtt')}
                      variant="outline"
                      className="flex-1 btn-outline-dark text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download VTT
                    </Button>
                  </div>

                  {/* Translate Subtitles Panel */}
                  <div className="mt-2 p-4 bg-gray-900 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Languages className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Translate subtitles</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <Select value={translateTarget} onValueChange={setTranslateTarget}>
                          <SelectTrigger className="bg-black text-white border-gray-700">
                            <SelectValue placeholder="Target language" />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-gray-700 text-white">
                            <SelectItem value="arabic">Arabic</SelectItem>
                            <SelectItem value="english">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {translateTarget === "arabic" && (
                        <div className="sm:col-span-1">
                          <Select value={dialect} onValueChange={setDialect}>
                            <SelectTrigger className="bg-black text-white border-gray-700">
                              <SelectValue placeholder="Dialect" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-gray-700 text-white">
                              {arabicDialects.map((d) => (
                                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="sm:col-span-1">
                        <Button
                          onClick={translateSubtitles}
                          disabled={isTranslatingSub || !editedSubtitles.trim()}
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black"
                        >
                          {isTranslatingSub ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Translating...
                            </>
                          ) : (
                            "Translate"
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Timestamps remain untouched; only subtitle text is translated.
                    </p>
                  </div>

                  {/* Resection Controls */}
                  <div className="mt-2 p-4 bg-gray-900 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-300">Resegment subtitles</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-1">
                        <Label htmlFor="wps" className="text-gray-300 text-sm">Words per sentence</Label>
                        <Input id="wps" type="number" min={1} value={wordsPerSentence} onChange={(e)=>setWordsPerSentence(e.target.value)} className="mt-1 bg-black text-white border-gray-700" />
                      </div>
                      <div className="sm:col-span-1">
                        <Label htmlFor="sections" className="text-gray-300 text-sm">Number of sections</Label>
                        <Input id="sections" type="number" min={1} value={sectionsCount} onChange={(e)=>setSectionsCount(e.target.value)} className="mt-1 bg-black text-white border-gray-700" />
                      </div>
                      <div className="sm:col-span-1 flex gap-2">
                        <Button onClick={applyWordsPerSentence} disabled={!editedSubtitles.trim()} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black">
                          Apply words/line
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 grid sm:grid-cols-2 gap-2">
                      <Button variant="outline" onClick={applySectionsCount} disabled={!editedSubtitles.trim()} className="btn-outline-dark text-white">
                        Apply sections count
                      </Button>
                      <Button variant="outline" onClick={()=>setEditedSubtitles(subtitles)} disabled={!subtitles} className="btn-outline-dark text-white">
                        Reset to original segmentation
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Timestamps are merged across grouped segments to keep sync close to the original.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-700" />
                  <p>Upload a video or audio file to extract subtitles</p>
                  <p className="text-sm mt-2 text-gray-600">Powered by OpenAI Whisper</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}