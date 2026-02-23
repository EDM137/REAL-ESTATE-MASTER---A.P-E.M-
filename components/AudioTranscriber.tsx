import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Mic, Activity, Zap } from './ui/Icons';
import { encode, decode, decodeAudioData } from '../utils/audio';
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
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
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
        nextStartTimeRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputContext;

            const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputContext;
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        console.debug("Live session opened");
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const inputTranscript = message.serverContent?.inputTranscription as any;
                        if (inputTranscript) {
                            if (inputTranscript.isFinal) {
                                finalTranscriptionRef.current += inputTranscript.text + ' ';
                                setTranscription(finalTranscriptionRef.current);
                            } else {
                                setTranscription(finalTranscriptionRef.current + inputTranscript.text);
                            }
                        }

                        const outputTranscript = message.serverContent?.outputTranscription as any;
                        if (outputTranscript) {
                             if (outputTranscript.isFinal) {
                                finalTranslationRef.current += outputTranscript.text + ' ';
                                setTranslation(finalTranslationRef.current);
                            } else {
                                setTranslation(finalTranslationRef.current + outputTranscript.text);
                            }
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const audioBytes = decode(audioData);
                            const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
                            
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(ctx.destination);
                            
                            source.onended = () => {
                                activeSourcesRef.current.delete(source);
                            };
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                            activeSourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            activeSourcesRef.current.forEach(source => {
                                try { source.stop(); } catch(e) {}
                            });
                            activeSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error', e);
                        setError(`Session error: ${e.message || 'Unknown error'}`);
                    },
                    onclose: () => {
                        console.debug("Live session closed");
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are Kindra, a professional, high-fidelity real-time interpreter for SovereignRE.
                    - Listen to input audio and detect the language.
                    - Translate immediately into English.
                    - VOCAL STYLE: Maintain a calm, professional, and helpful tone.
                    - Speak clearly and at a regular pace.
                    - Do NOT sound strained or panicked.
                    - Be helpful and accurate in your translations.`,
                },
            });
            
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
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
            scriptProcessor.connect(inputContext.destination);

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
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
        }
        activeSourcesRef.current.forEach(source => {
            try { source.stop(); } catch(e) {}
        });
        activeSourcesRef.current.clear();
        
        sessionPromiseRef.current?.then(session => session.close());

        setIsRecording(false);
    };

    return (
        <div className="space-y-4 animate-fade-in text-center">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-full shadow-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
                disabled={!ai}
            >
                <Mic className={`w-5 h-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? 'Stop Interpreter' : 'Ignite Kindra Voice Interpreter'}
            </Button>
            
            <div className="space-y-2">
                <div className="p-3 bg-brand-secondary rounded-lg min-h-[60px] text-left text-sm border border-brand-accent/50 relative overflow-hidden">
                    {isRecording && <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-blue/30 animate-pulse"></div>}
                    <span className="text-[10px] text-brand-light block mb-1 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Activity className="w-3 h-3 text-brand-blue" />
                        Source Audio:
                    </span>
                    {transcription || <span className="text-brand-light italic opacity-50">Awaiting input...</span>}
                </div>
                
                <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg min-h-[60px] text-left text-sm relative">
                     <span className="text-[10px] text-brand-blue block mb-1 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Kindra's English Interpretation:
                    </span>
                    {translation || <span className="text-brand-blue/50 italic">Kindra is listening...</span>}
                </div>
            </div>
            
            <div className="flex justify-center items-center gap-4 py-1">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-brand-green animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-[9px] uppercase tracking-tighter text-brand-light">Voice Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-brand-yellow animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-[9px] uppercase tracking-tighter text-brand-light">Processing</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-brand-blue animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-[9px] uppercase tracking-tighter text-brand-light">Active</span>
                </div>
            </div>
            
            <p className="text-[10px] text-brand-light italic font-serif">
                Sovereign Bio-Performance Suite • Eric Daniel Malley IP
            </p>
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/30">{error}</p>}
        </div>
    );
};

export default AudioTranscriber;
