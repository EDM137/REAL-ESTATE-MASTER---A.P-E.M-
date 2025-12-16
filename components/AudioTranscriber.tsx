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
    const [translation, setTranslation] = useState('');
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const finalTranscriptionRef = useRef('');
    const finalTranslationRef = useRef('');

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
        setTranslation('');
        finalTranscriptionRef.current = '';
        finalTranslationRef.current = '';

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
                        // Handle Input Transcription (Source Language)
                        const inputTranscript = message.serverContent?.inputTranscription;
                        if (inputTranscript) {
                            if (inputTranscript.isFinal) {
                                finalTranscriptionRef.current += inputTranscript.text + ' ';
                                setTranscription(finalTranscriptionRef.current);
                            } else {
                                setTranscription(finalTranscriptionRef.current + inputTranscript.text);
                            }
                        }

                        // Handle Output Transcription (English Translation)
                        const outputTranscript = message.serverContent?.outputTranscription;
                        if (outputTranscript) {
                             if (outputTranscript.isFinal) {
                                finalTranslationRef.current += outputTranscript.text + ' ';
                                setTranslation(finalTranslationRef.current);
                            } else {
                                setTranslation(finalTranslationRef.current + outputTranscript.text);
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
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: "You are a professional interpreter. Listen to the input audio. Detect the language. Translate it immediately into English. If the input is in English, repeat it exactly. Output the English translation. Speak with a highly natural, conversational tone. Incorporate natural prosody, slight pauses between phrases as if breathing, and varying intonation to reflect human thinking patterns. Avoid monotone delivery.",
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
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
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
                {isRecording ? 'Stop Translating' : 'Start Live Translator'}
            </Button>
            
            <div className="space-y-2">
                <div className="p-3 bg-brand-secondary rounded-lg min-h-[60px] text-left text-sm">
                    <span className="text-xs text-brand-light block mb-1 uppercase tracking-wide">Detected Speech (Source):</span>
                    {transcription || <span className="text-brand-light italic opacity-50">Listening...</span>}
                </div>
                
                <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg min-h-[60px] text-left text-sm">
                     <span className="text-xs text-brand-blue block mb-1 uppercase tracking-wide">English Translation:</span>
                    {translation || <span className="text-brand-blue/50 italic">Translation will appear here...</span>}
                </div>
            </div>
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
        </div>
    );
};

export default AudioTranscriber;