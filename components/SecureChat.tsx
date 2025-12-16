
import React, { useState, useRef, useEffect } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Shield, Camera, Mic, CheckCircle, FileText, User, Pause, Play, Lock, Languages, Check } from './ui/Icons';
import AdBanner from './AdBanner';
import { GoogleGenAI } from '@google/genai';
import AudioTranscriber from './AudioTranscriber';

interface SecureChatProps {
    listing: Listing;
    onListingUpdate?: (listing: Listing) => void;
    onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
    "Spanish", "Vietnamese", "French", "German", "Mandarin", "Japanese", "Russian", "Arabic"
];

const SecureChat: React.FC<SecureChatProps> = ({ listing, onListingUpdate, onClose }) => {
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Translation State
    const [showTranslateSettings, setShowTranslateSettings] = useState(false);
    const [showVoiceInterpreter, setShowVoiceInterpreter] = useState(false);
    const [translationEnabled, setTranslationEnabled] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    // Mock participants for the 4-person grid (1 Local + 3 Remote)
    const participants = [
        { name: 'Alice (Realtor)', role: 'Listing Agent', color: 'bg-purple-600' },
        { name: 'John (Buyer)', role: 'Buyer', color: 'bg-blue-600' },
        { name: 'Sarah (Mediator)', role: 'Mediator/Contractor', color: 'bg-orange-600' },
    ];

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isVideoMode && !isOnHold) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                })
                .catch(err => console.error("Video access denied:", err));
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoMode, isOnHold]);

    // Translation Effect
    useEffect(() => {
        if (!translationEnabled || !ai) return;

        const translateMessages = async () => {
            const newCache = { ...translationCache };
            let hasUpdates = false;

            for (let i = 0; i < listing.communications.length; i++) {
                const msg = listing.communications[i];
                const cacheKey = `${i}-${targetLanguage}`; // Simple key based on index + lang

                if (!newCache[cacheKey]) {
                    try {
                        // Skip translation if it's already in target language (heuristic)
                        // In a real app, we'd detect language first.
                        const prompt = `Translate the following chat message to ${targetLanguage}. Output only the translation, no extra text: "${msg.message}"`;
                        const result = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: prompt,
                        });
                        
                        if (result.text) {
                            newCache[cacheKey] = result.text.trim();
                            hasUpdates = true;
                        }
                    } catch (err) {
                        console.error("Translation error:", err);
                    }
                }
            }

            if (hasUpdates) {
                setTranslationCache(newCache);
            }
        };

        translateMessages();
    }, [listing.communications, translationEnabled, targetLanguage, ai]);

    const toggleChecklistItem = (itemId: string) => {
        if (!onListingUpdate) return;
        const updatedChecklist = listing.closingChecklist.map(item => {
            if (item.id === itemId) {
                const isApproved = !item.completed;
                return { 
                    ...item, 
                    completed: isApproved, 
                    approvedBy: isApproved ? [...item.approvedBy, 'Seller'] : item.approvedBy.filter(u => u !== 'Seller')
                };
            }
            return item;
        });
        onListingUpdate({ ...listing, closingChecklist: updatedChecklist });
    };

    const VideoPlaceholder: React.FC<{ name: string; role: string; color: string }> = ({ name, role, color }) => (
        <div className={`relative w-full h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col items-center justify-center`}>
            <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-xl font-bold text-white mb-2`}>
                {name.charAt(0)}
            </div>
            <div className="text-white font-semibold text-sm">{name}</div>
            <div className="text-gray-400 text-xs">{role}</div>
            <div className="absolute top-2 right-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
             <div className="absolute bottom-2 left-2 flex gap-1">
                 <Mic className="w-3 h-3 text-white" />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in p-4">
            <Card className="w-full max-w-7xl flex flex-col h-[90vh] relative overflow-hidden">
                <Card.Header className="flex justify-between items-center py-3 z-20 bg-brand-secondary/90 backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-brand-green" />
                            <div>
                                 <Card.Title>Secure Closing War Room</Card.Title>
                                 <Card.Description>MLS ID: {listing.id} | Multi-Party</Card.Description>
                            </div>
                        </div>
                        {isVideoMode && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-brand-primary rounded border border-brand-accent">
                                <Lock className="w-3 h-3 text-brand-green" />
                                <span className="text-xs text-brand-green font-mono">E2E ENCRYPTED</span>
                                <span className="w-px h-3 bg-brand-light/30 mx-1"></span>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-red-500 font-mono">REC</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                         {!isVideoMode && (
                            <div className="relative flex gap-2">
                                <Button
                                    size="sm"
                                    variant={showVoiceInterpreter ? 'primary' : 'outline'}
                                    onClick={() => setShowVoiceInterpreter(!showVoiceInterpreter)}
                                    title="Live Voice Interpreter"
                                    className="hidden md:flex"
                                >
                                    <Mic className="w-4 h-4 mr-2" />
                                    Interpreter
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={translationEnabled ? 'primary' : 'outline'}
                                    onClick={() => setShowTranslateSettings(!showTranslateSettings)}
                                    title="Text Translation Settings"
                                >
                                    <Languages className="w-4 h-4 mr-2" />
                                    {translationEnabled ? targetLanguage : 'Text Trans'}
                                </Button>
                                {showTranslateSettings && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-brand-secondary border border-brand-accent rounded-lg shadow-xl p-3 z-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-brand-highlight">Text Translator</span>
                                            <button 
                                                onClick={() => setTranslationEnabled(!translationEnabled)}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${translationEnabled ? 'bg-brand-green' : 'bg-gray-600'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${translationEnabled ? 'left-6' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-brand-light">Target Language:</label>
                                            <select 
                                                value={targetLanguage}
                                                onChange={(e) => setTargetLanguage(e.target.value)}
                                                className="w-full bg-brand-primary border border-brand-accent rounded p-1 text-sm text-brand-highlight"
                                                disabled={!translationEnabled}
                                            >
                                                {SUPPORTED_LANGUAGES.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isVideoMode && (
                            <>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className={isOnHold ? "bg-brand-yellow text-brand-primary border-brand-yellow" : ""}
                                    onClick={() => setIsOnHold(!isOnHold)}
                                >
                                    {isOnHold ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                                    {isOnHold ? "Resume" : "Hold"}
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={showChecklist ? 'primary' : 'outline'} 
                                    onClick={() => setShowChecklist(!showChecklist)}
                                    disabled={isOnHold}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Checklist
                                </Button>
                            </>
                        )}
                         <Button 
                            size="sm" 
                            variant={isVideoMode ? 'destructive' : 'primary'} 
                            onClick={() => { setIsVideoMode(!isVideoMode); setIsOnHold(false); }}
                         >
                            <Camera className="w-4 h-4 mr-2" />
                            {isVideoMode ? 'End Call' : 'Start Video Call'}
                         </Button>
                        <Button size="icon" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </Card.Header>
                
                <Card.Content className="flex-grow overflow-hidden flex gap-4 p-4 relative">
                    {/* Voice Interpreter Overlay */}
                    {showVoiceInterpreter && (
                        <div className="absolute top-4 right-4 z-40 w-80 bg-brand-primary border border-brand-accent rounded-lg shadow-2xl p-4 animate-fade-in">
                            <div className="flex justify-between items-center mb-4 border-b border-brand-accent pb-2">
                                <h4 className="font-bold text-brand-highlight flex items-center gap-2">
                                    <Languages className="w-4 h-4 text-brand-blue" />
                                    Live Interpreter
                                </h4>
                                <button onClick={() => setShowVoiceInterpreter(false)} className="text-brand-light hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-brand-light mb-4">
                                Detects foreign languages and translates to English in real-time.
                            </p>
                            <AudioTranscriber />
                        </div>
                    )}

                    {isVideoMode ? (
                        isOnHold ? (
                            <div className="absolute inset-0 z-10">
                                <AdBanner variant="fullscreen" />
                            </div>
                        ) : (
                            <div className="flex flex-1 gap-4 h-full overflow-hidden">
                                {/* Video Grid - 2x2 Layout for 4 participants */}
                                <div className={`grid gap-4 w-full h-full transition-all duration-300 ${showChecklist ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                                    {/* Local User (Seller) */}
                                    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-brand-blue shadow-lg">
                                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                            You (Seller)
                                        </div>
                                    </div>
                                    
                                    {/* Remote Participants */}
                                    {participants.map((p, i) => (
                                        <VideoPlaceholder key={i} name={p.name} role={p.role} color={p.color} />
                                    ))}
                                </div>

                                {/* Checklist Sidebar */}
                                {showChecklist && (
                                    <div className="w-80 flex-shrink-0 bg-brand-secondary rounded-lg border border-brand-accent p-4 overflow-y-auto animate-fade-in flex flex-col">
                                        <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-brand-blue" />
                                            Closing Checklist
                                        </h3>
                                        <div className="space-y-3 flex-grow">
                                            {listing.closingChecklist.map((item) => (
                                                <div key={item.id} className="p-3 bg-brand-primary rounded border border-brand-accent">
                                                    <div className="flex items-start gap-3">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={item.completed} 
                                                            onChange={() => toggleChecklistItem(item.id)}
                                                            className="mt-1 w-4 h-4 text-brand-blue rounded focus:ring-brand-blue bg-brand-secondary border-brand-light"
                                                        />
                                                        <div>
                                                            <p className={`text-sm font-medium ${item.completed ? 'text-brand-green line-through' : 'text-brand-highlight'}`}>
                                                                {item.label}
                                                            </p>
                                                            {item.completed && (
                                                                <p className="text-[10px] text-brand-green mt-1">Approved by: {item.approvedBy.join(', ')}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        // Chat View
                        <div className="flex-grow flex flex-col h-full w-full">
                             {translationEnabled && (
                                <div className="bg-brand-blue/20 text-brand-blue text-xs p-2 text-center rounded mb-2 border border-brand-blue/30">
                                    Active Translation: All messages converting to <strong>{targetLanguage}</strong>
                                </div>
                            )}
                            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                                {listing.communications.map((msg, index) => {
                                    const cacheKey = `${index}-${targetLanguage}`;
                                    const translatedText = translationCache[cacheKey];
                                    const displayText = (translationEnabled && translatedText) ? translatedText : msg.message;

                                    return (
                                        <div key={index} className={`flex items-end gap-2 ${msg.agentType === "Buyer's Agent" ? 'justify-end' : 'justify-start'}`}>
                                            {msg.agentType === 'Listing Agent' && <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-sm font-bold flex-shrink-0">LA</div>}
                                            <div className={`max-w-[70%] p-3 rounded-lg ${
                                                msg.agentType === "Buyer's Agent"
                                                    ? 'bg-brand-blue text-white rounded-br-none' 
                                                    : 'bg-brand-accent text-brand-highlight rounded-bl-none'
                                            }`}>
                                                <p className="text-sm">{displayText}</p>
                                                {translationEnabled && translatedText && (
                                                    <p className="text-[10px] opacity-70 mt-1 italic border-t border-white/20 pt-1">
                                                        Original: {msg.message}
                                                    </p>
                                                )}
                                                <p className={`text-xs mt-1 opacity-70 ${msg.agentType === "Buyer's Agent" ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                                            </div>
                                            {msg.agentType === "Buyer's Agent" && <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-sm font-bold flex-shrink-0">BA</div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder={translationEnabled ? `Message will be auto-translated to ${targetLanguage}...` : "Message the group..."}
                                    disabled
                                    className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow disabled:opacity-50"
                                />
                                <Button disabled>Send</Button>
                            </div>
                        </div>
                    )}
                </Card.Content>
            </Card>
        </div>
    );
};

export default SecureChat;
