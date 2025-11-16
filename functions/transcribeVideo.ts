import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import OpenAI from 'npm:openai@4.57.0';

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
        const videoFile = formData.get('video');
        
        if (!videoFile) {
            return Response.json({ error: 'No video file provided' }, { status: 400 });
        }

        // Convert video file to audio using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: videoFile,
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
                error: 'Video format not supported. Please try MP4, MOV, or other common formats.' 
            }, { status: 400 });
        }
        
        if (error.code === 'file_too_large') {
            return Response.json({ 
                error: 'Video file is too large. Please try a smaller file under 25MB.' 
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