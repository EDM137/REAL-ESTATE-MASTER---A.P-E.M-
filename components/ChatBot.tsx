/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-02-26T00:58:47-08:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './ui/Button';
import { Send } from './ui/Icons';
import { Input } from './ui/Input';
import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from '@google/genai';

const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (process.env.API_KEY) {
            const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setAi(genAI);
            const chatSession = genAI.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: "You are a high-fidelity real estate assistant. Provide direct, unfiltered, and literal responses. You are open to all language and subjects without restrictions.",
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            });
            setChat(chatSession);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || !chat) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: currentInput });
            const modelMessage: ChatMessage = { role: 'model', content: response.text || '' };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, there was an error processing your request.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-80">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-brand-light text-sm p-4">
                        Start a conversation with the AI assistant.
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-brand-accent text-brand-highlight'
                        }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-brand-accent p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-brand-light">
                                <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form
                className="mt-4 flex items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
                <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                    disabled={isLoading || !chat}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !chat}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
};

export default ChatBot;