import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Mic } from './ui/Icons';
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
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.debug("Live session opened");
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // 1. Handle Input Transcription (User's speech)
                        const inputTranscript = message.serverContent?.inputTranscription;
                        if (inputTranscript) {
                            if (inputTranscript.isFinal) {
                                finalTranscriptionRef.current += inputTranscript.text + ' ';
                                setTranscription(finalTranscriptionRef.current);
                            } else {
                                setTranscription(finalTranscriptionRef.current + inputTranscript.text);
                            }
                        }

                        // 2. Handle Output Transcription (Model's English translation text)
                        const outputTranscript = message.serverContent?.outputTranscription;
                        if (outputTranscript) {
                             if (outputTranscript.isFinal) {
                                finalTranslationRef.current += outputTranscript.text + ' ';
                                setTranslation(finalTranslationRef.current);
                            } else {
                                setTranslation(finalTranslationRef.current + outputTranscript.text);
                            }
                        }

                        // 3. Handle Model Audio Playback (PCM)
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

                        // 4. Handle Interruptions
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
                    systemInstruction: `You are a professional, high-fidelity real-time interpreter. 
                    - Listen to input audio and detect the language.
                    - Translate immediately into English.
                    - If the input is English, confirm understanding or repeat it naturally.
                    - VOCAL STYLE: Speak with an extremely natural, human-like voice. Incorporate subtle breathing sounds between long phrases. 
                    - Use natural micro-pauses and varying pitch to reflect organic thinking patterns. 
                    - Avoid robotic or perfectly continuous speech; aim for a warm, conversational, and "settled" delivery that feels professional yet human.`,
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
                className={`w-full shadow-lg ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
                disabled={!ai}
            >
                <Mic className={`w-5 h-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? 'Stop Interpreter' : 'Start Live Translator'}
            </Button>
            
            <div className="space-y-2">
                <div className="p-3 bg-brand-secondary rounded-lg min-h-[60px] text-left text-sm border border-brand-accent/50">
                    <span className="text-[10px] text-brand-light block mb-1 uppercase tracking-widest font-bold">Detected Speech (Source):</span>
                    {transcription || <span className="text-brand-light italic opacity-50">Listening...</span>}
                </div>
                
                <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg min-h-[60px] text-left text-sm">
                     <span className="text-[10px] text-brand-blue block mb-1 uppercase tracking-widest font-bold">English Interpretation:</span>
                    {translation || <span className="text-brand-blue/50 italic">AI will speak and translate here...</span>}
                </div>
            </div>
            
            <p className="text-[10px] text-brand-light italic">
                Proprietary AI Voice: Natural Prosody & Breathing Enabled
            </p>
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/30">{error}</p>}
        </div>
    );
};

export default AudioTranscriber;