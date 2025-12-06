import React, { useState, useRef, useEffect } from 'react';
import { decode, decodeAudioData } from '../utils/audio';
import { Button } from './ui/Button';
import { Volume2 } from './ui/Icons';
import { GoogleGenAI, Modality } from '@google/genai';

const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleGenerateAndPlay = async () => {
        if (!text.trim() || !ai) {
            setError('Please enter some text. AI service might not be available.');
            return;
        }
        setIsLoading(true);
        setError('');

        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            } catch(e) {
                setError("Could not create AudioContext.");
                setIsLoading(false);
                return;
            }
        }
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
            });
            
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (base64Audio) {
                const audioBytes = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.start();
            } else {
                 setError('Failed to generate audio from response.');
            }
        } catch (e) {
            console.error("Error generating or playing audio:", e);
            setError("Failed to generate or play audio.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                rows={5}
                className="w-full bg-brand-secondary border border-brand-accent rounded-md p-2 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow"
                disabled={isLoading}
            />
            <Button onClick={handleGenerateAndPlay} disabled={isLoading || !text.trim() || !ai} className="w-full">
                <Volume2 className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Generate & Play Audio'}
            </Button>
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
        </div>
    );
};

export default TextToSpeech;