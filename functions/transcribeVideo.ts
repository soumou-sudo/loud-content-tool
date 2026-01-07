import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.57.0';
import { toFile } from 'npm:openai@4.57.0/uploads';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const mediaFile = formData.get('video') || formData.get('audio') || formData.get('file');
        
        if (!mediaFile || typeof mediaFile === 'string') {
            return Response.json({ error: 'No media file provided' }, { status: 400 });
        }

        // Ensure uploaded blob is converted to a proper File for OpenAI SDK
        const filename = (mediaFile && mediaFile.name) ? mediaFile.name : `media.${(mediaFile?.type?.split('/')?.[1] || 'mp3')}`;
        const fileForOpenAI = await toFile(mediaFile, filename);

        // Transcribe using Whisper with segment timestamps
        const transcription = await openai.audio.transcriptions.create({
            file: fileForOpenAI,
            model: "whisper-1",
            response_format: "verbose_json",
            timestamp_granularities: ["segment"]
        });

        // Convert OpenAI response to SRT format
        let srtContent = "";
        if (transcription.segments && transcription.segments.length > 0) {
            transcription.segments.forEach((segment, index) => {
                const startTime = formatTime(segment.start);
                const endTime = formatTime(segment.end);
                
                srtContent += `${index + 1}\n`;
                srtContent += `${startTime} --> ${endTime}\n`;
                srtContent += `${segment.text.trim()}\n\n`;
            });
        } else {
            // Fallback if no segments
            const words = transcription.text || "No speech detected";
            srtContent = `1\n00:00:01,000 --> 00:00:04,000\n${words}\n\n`;
        }

        return Response.json({ 
            success: true,
            subtitles: srtContent.trim(),
            duration: transcription.duration || 0,
            language: transcription.language || 'unknown'
        });

    } catch (error) {
        console.error("Transcription error:", error);
        
        // Handle specific OpenAI errors
        if (error.code === 'file_not_supported') {
            return Response.json({ 
                error: 'File format not supported. Please try common video/audio formats (MP4, MOV, MKV, MP3, WAV, M4A, OGG).' 
            }, { status: 400 });
        }
        
        if (error.code === 'file_too_large') {
            return Response.json({ 
                error: 'File is too large. Please try a smaller file under 25MB.' 
            }, { status: 400 });
        }

        return Response.json({ 
            error: `Transcription failed: ${error.message}` 
        }, { status: 500 });
    }
});

// Helper function to format time in SRT format
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}