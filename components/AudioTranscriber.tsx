import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Mic } from './ui/Icons';
import { encode } from '../utils/audio';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob } from '@google/genai';

type LiveSession = {
    sendRealtimeInput: (params: { media: GenaiBlob }) => void;
    close: () => void;
};

const AudioTranscriber: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const finalTranscriptionRef = useRef('');

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const startRecording = async () => {
        if (!ai) {
            setError("AI Service not initialized. Check API Key.");
            return;
        }
        setError('');
        setTranscription('');
        finalTranscriptionRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = context;
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {},
                    onmessage: (message: LiveServerMessage) => {
                        const transcript = message.serverContent?.inputTranscription;
                        if (transcript) {
                            if (transcript.isFinal) {
                                finalTranscriptionRef.current += transcript.text + ' ';
                                setTranscription(finalTranscriptionRef.current);
                            } else {
                                setTranscription(finalTranscriptionRef.current + transcript.text);
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error', e);
                        setError(`Session error: ${e.message || 'Unknown error'}`);
                    },
                    onclose: () => {},
                },
                config: {
                    inputAudioTranscription: {},
                },
            });
            
            const source = context.createMediaStreamSource(stream);
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: GenaiBlob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };

                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(context.destination);

            setIsRecording(true);

        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Could not start recording. Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
        }
        sessionPromiseRef.current?.then(session => session.close());

        setIsRecording(false);
    };

    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording]);

    return (
        <div className="space-y-4 animate-fade-in text-center">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
                disabled={!ai}
            >
                <Mic className={`w-5 h-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? 'Stop Transcribing' : 'Start Transcribing'}
            </Button>
            
            <div className="p-3 bg-brand-secondary rounded-lg min-h-[100px] text-left text-sm">
                {transcription || <span className="text-brand-light">Transcription will appear here...</span>}
            </div>
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
        </div>
    );
};

export default AudioTranscriber;