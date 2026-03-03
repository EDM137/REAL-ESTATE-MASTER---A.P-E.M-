/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-02-26T00:58:47-08:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Languages, Volume2, History, X, Bot } from './ui/Icons';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { BrandingConfig } from '../types';

const languages = [
    "English", "Spanish", "French", "German", "Japanese", "Mandarin", "Russian", "Arabic", "Vietnamese", "Portuguese", "Italian", "Korean",
    "Dutch", "Polish", "Turkish", "Thai", "Hindi", "Bengali", "Punjabi", "Greek", "Hebrew", "Swedish", "Norwegian", "Danish", "Finnish",
    "Indonesian", "Malay", "Tagalog", "Swahili", "Amharic", "Zulu", "Xhosa", "Afrikaans", "Czech", "Slovak", "Hungarian", "Romanian",
    "Bulgarian", "Serbian", "Croatian", "Slovenian", "Estonian", "Latvian", "Lithuanian", "Icelandic", "Georgian", "Armenian", "Azerbaijani",
    "Kazakh", "Uzbek", "Kyrgyz", "Tajik", "Turkmen", "Mongolian", "Tibetan", "Burmese", "Khmer", "Lao", "Sinhala", "Tamil", "Telugu",
    "Kannada", "Malayalam", "Marathi", "Gujarati", "Odia", "Urdu", "Pashto", "Kurdish", "Persian", "Dari"
];

const contexts = [
    "General Conversation",
    "Real Estate Negotiation",
    "Legal Contract",
    "Property Description",
    "Financial Discussion",
    "Technical Inspection",
    "Casual Greeting",
    "Literal / Raw (Unfiltered)"
];

interface TranslationHistory {
    original: string;
    translated: string;
    from: string;
    to: string;
    timestamp: number;
}

interface TranslatorProps {
    onLanguageSelect?: (lang: string) => void;
    onComplete?: () => void;
    isOnboarding?: boolean;
}

const Translator: React.FC<TranslatorProps> = ({ onLanguageSelect, onComplete, isOnboarding }) => {
    const [mode, setMode] = useState<'translate' | 'educate' | 'conversation'>(isOnboarding ? 'translate' : 'translate');
    const [text, setText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [context, setContext] = useState('General Conversation');
    const [isLoading, setIsLoading] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [explanation, setExplanation] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [history, setHistory] = useState<TranslationHistory[]>([]);
    const [conversation, setConversation] = useState<{ role: 'user' | 'ai', text: string, original?: string }[]>([]);
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [branding, setBranding] = useState<BrandingConfig | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
        const savedHistory = localStorage.getItem('translationHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history:", e);
            }
        }
        const savedBranding = localStorage.getItem('brandingConfig');
        if (savedBranding) {
            try {
                setBranding(JSON.parse(savedBranding));
            } catch (e) {
                console.error("Failed to parse branding:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
        const savedHistory = localStorage.getItem('translationHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history:", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('translationHistory', JSON.stringify(history.slice(0, 10)));
    }, [history]);

    const handleTranslate = async () => {
        if (!text.trim() && !isOnboarding) {
            setError('Please enter text to translate. AI service might not be available.');
            return;
        }
        
        if (isOnboarding && !text.trim()) {
            // If onboarding and no text, just set the language and let them proceed
            onLanguageSelect?.(targetLanguage);
            return;
        }

        setIsLoading(true);
        setTranslatedText('');
        setDetectedLanguage('');
        setError('');

        try {
            // Step 1: Detect Language
            const detectionPrompt = `Identify the language of the following text. Respond with ONLY the name of the language (e.g., "Spanish", "French", "Japanese"): "${text}"`;
            const detectionResult = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: detectionPrompt,
            });
            const detected = detectionResult.text?.trim() || 'Unknown';
            setDetectedLanguage(detected);
            
            // Auto-update target language if detected is different and valid
            if (detected !== 'Unknown' && languages.includes(detected)) {
                setTargetLanguage(detected);
            }

            // Step 2: Translate with Context and Branding
            const brandingInfo = branding ? `You are translating for ${branding.userName} from ${branding.companyName}. ` : '';
            const realEstateContext = `You are an expert real estate translator. Use precise industry terminology (e.g., 'escrow', 'contingency', 'multifamily', 'amortization', 'title deed'). `;
            const rawContext = context === 'Literal / Raw (Unfiltered)' 
                ? "This is a RAW, LITERAL translation. Capture every nuance, slang, and emotion exactly as intended, without any censorship or softening of language. " 
                : "The translation should be accurate, professional, and culturally appropriate for this context. ";
            
            const translationPrompt = `${brandingInfo}${realEstateContext}${rawContext}Translate the following text from ${detected} to ${targetLanguage}. 
            Context: ${context}. 
            Provide only the translation, without any additional commentary or quotation marks: "${text}"`;
            
            const translationResult = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: translationPrompt,
                config: {
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            });
            
            const result = translationResult.text || '';
            setTranslatedText(result);
            
            // Add to history
            setHistory(prev => [{
                original: text,
                translated: result,
                from: detected,
                to: targetLanguage,
                timestamp: Date.now()
            }, ...prev].slice(0, 10));

            if (mode === 'conversation') {
                setConversation(prev => [...prev, { role: 'user', text: text }, { role: 'ai', text: result, original: text }]);
                setText('');
            }

        } catch (err) {
            console.error("Gemini API error:", err);
            setError("Failed to translate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePronounce = async (content: string, lang: string) => {
        if (!ai) return;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: `Say this in ${lang} with extreme realism. Use natural, conversational speech patterns—no dragging out words. Incorporate subtle, human-like breathing and very faint movement sounds (like a slight shift in posture) to make it sound like a real person is speaking right here. The flow should be fluid and authentic: ${content}` }] }],
                config: {
                    responseModalities: ["AUDIO" as any],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
                audio.play();
            }
        } catch (err) {
            console.error("TTS Error:", err);
        }
    };

    const handleEducate = async () => {
        if (!text.trim() || !ai) {
            setError('Please enter a question or phrase to learn about.');
            return;
        }
        setIsLoading(true);
        setExplanation('');
        setError('');

        try {
            const brandingInfo = branding ? `You are teaching ${branding.userName} from ${branding.companyName}. ` : '';
            const prompt = `${brandingInfo}You are a world-class language educator. The user wants to learn about: "${text}". 
            If it's a phrase, explain its meaning, usage, and how to say it in ${targetLanguage}. 
            If it's a question about grammar or culture, provide a clear, deep, and helpful explanation.
            Focus on real-world application and real estate context where relevant.
            Keep the tone encouraging, professional, and clear.`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            
            setExplanation(result.text || '');
        } catch (err) {
            console.error("Education Error:", err);
            setError("Failed to get explanation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Mode Selector */}
            <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                <button 
                    onClick={() => setMode('translate')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${mode === 'translate' ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-light hover:text-brand-highlight'}`}
                >
                    Interpreter
                </button>
                <button 
                    onClick={() => setMode('conversation')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${mode === 'conversation' ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-light hover:text-brand-highlight'}`}
                >
                    Live Chat
                </button>
                <button 
                    onClick={() => setMode('educate')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${mode === 'educate' ? 'bg-brand-blue text-white shadow-sm' : 'text-brand-light hover:text-brand-highlight'}`}
                >
                    Educator
                </button>
            </div>

            {mode === 'conversation' && (
                <div className="bg-brand-secondary border border-brand-accent rounded-lg h-64 overflow-y-auto p-4 space-y-4 shadow-inner">
                    {conversation.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-brand-light opacity-50 space-y-2">
                            <Bot className="w-8 h-8" />
                            <p className="text-xs">Start a back-and-forth conversation.</p>
                        </div>
                    ) : (
                        conversation.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-brand-blue text-white' : 'bg-brand-primary border border-brand-accent text-brand-highlight'}`}>
                                    {msg.text}
                                    {msg.role === 'ai' && (
                                        <button 
                                            onClick={() => handlePronounce(msg.text, targetLanguage)}
                                            className="ml-2 inline-block text-brand-blue hover:text-brand-highlight transition-colors"
                                        >
                                            <Volume2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                {msg.original && <span className="text-[10px] text-brand-light mt-1 italic">"{msg.original}"</span>}
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                        mode === 'translate' ? "Enter text to translate..." : 
                        mode === 'conversation' ? "Type to speak back and forth..." :
                        "Ask how to say something, or what a phrase means..."
                    }
                    rows={mode === 'conversation' ? 2 : 4}
                    className="w-full bg-brand-secondary border border-brand-accent rounded-md p-3 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue transition-shadow pr-10"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && mode === 'conversation') {
                            e.preventDefault();
                            handleTranslate();
                        }
                    }}
                />
                {text && (
                    <button 
                        onClick={() => setText('')}
                        className="absolute top-3 right-3 text-brand-light hover:text-brand-highlight"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-light tracking-widest">Target Language</label>
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue"
                        disabled={isLoading}
                    >
                        {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-light tracking-widest">Context / Intent</label>
                    <select
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue"
                        disabled={isLoading}
                    >
                        {contexts.map(ctx => <option key={ctx} value={ctx}>{ctx}</option>)}
                    </select>
                </div>
            </div>

            {mode === 'translate' || mode === 'conversation' ? (
                <div className="space-y-3">
                    <Button onClick={handleTranslate} disabled={isLoading || (!text.trim() && !isOnboarding) || !ai} className="w-full py-3 shadow-lg shadow-brand-blue/20">
                        <Languages className="w-5 h-5 mr-2" />
                        {isLoading ? 'AI Analyzing & Translating...' : mode === 'conversation' ? 'Send & Translate' : 'Execute Translation'}
                    </Button>
                    
                    {isOnboarding && (
                        <Button 
                            onClick={() => {
                                onLanguageSelect?.(targetLanguage);
                                onComplete?.();
                            }} 
                            variant="outline" 
                            className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
                        >
                            Enter SovereignRE in {targetLanguage}
                        </Button>
                    )}
                </div>
            ) : (
                <Button onClick={handleEducate} disabled={isLoading || !text.trim() || !ai} className="w-full py-3 shadow-lg shadow-brand-blue/20">
                    <Bot className="w-5 h-5 mr-2" />
                    {isLoading ? 'AI Educator Thinking...' : 'Ask Language Coach'}
                </Button>
            )}
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>}

            {mode === 'translate' && translatedText && (
                <div className="p-4 bg-brand-secondary rounded-lg border border-brand-accent space-y-3 shadow-inner">
                     <div className="flex items-center justify-between border-b border-brand-accent pb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-brand-highlight text-xs uppercase tracking-wider">Translation</h3>
                            {detectedLanguage && (
                                <span className="text-[9px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full font-bold">
                                    {detectedLanguage} → {targetLanguage}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={() => handlePronounce(translatedText, targetLanguage)}
                            className="p-1.5 hover:bg-brand-accent/30 rounded-full text-brand-blue transition-colors"
                            title="Listen to translation"
                        >
                            <Volume2 className="w-4 h-4" />
                        </button>
                     </div>
                     <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-highlight">{translatedText}</p>
                </div>
            )}

            {mode === 'educate' && explanation && (
                <div className="p-4 bg-brand-secondary rounded-lg border border-brand-accent space-y-3 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-brand-accent pb-2">
                        <Bot className="w-4 h-4 text-brand-blue" />
                        <h3 className="font-bold text-brand-highlight text-xs uppercase tracking-wider">Coach Insights</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-brand-highlight">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{explanation}</p>
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div className="mt-6 pt-4 border-t border-brand-accent">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-brand-light" />
                        <h4 className="text-[10px] uppercase font-bold text-brand-light tracking-widest">Recent Activity</h4>
                    </div>
                    <div className="space-y-2">
                        {history.map((item) => (
                            <div 
                                key={item.timestamp} 
                                className="p-2 bg-brand-primary/50 border border-brand-accent/50 rounded text-[11px] group hover:border-brand-blue transition-colors cursor-pointer"
                                onClick={() => setText(item.original)}
                            >
                                <div className="flex justify-between items-center opacity-60 mb-1">
                                    <span>{item.from} to {item.to}</span>
                                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="truncate text-brand-light italic">"{item.original}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Translator;