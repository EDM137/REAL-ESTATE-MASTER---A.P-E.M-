import React, { useState, useEffect } from 'react';
import { Listing, RealEstateStatus } from '../types';
import { Button } from './ui/Button';
import { Sparkles, Send } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

interface ContextualAssistantProps {
    listing: Listing;
    activeStep: RealEstateStatus;
}

const ContextualAssistant: React.FC<ContextualAssistantProps> = ({ listing, activeStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [promptInput, setPromptInput] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

     useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const getContextualPrompt = () => {
        switch (activeStep) {
            case RealEstateStatus.LISTING:
                return `Acting as a sovereign-grade real estate copywriter, draft an expanded and engaging property description for ${listing.address} (Price: $${listing.price.toLocaleString()}).
                
                Current Draft: "${listing.description}"
                
                Please ensure the following points are elaborated upon with sophisticated language:
                1. Emphasize the mid-century modern architectural style.
                2. Highlight the recent kitchen renovation details.
                3. Detail the spacious backyard's suitability for high-end entertaining.
                4. Mention the quiet, family-friendly neighborhood and top-rated schools.
                
                The final output should be suitable for a luxury brochure.`;
            case RealEstateStatus.ROOM_SPECS:
                return `For a room named '${listing.roomSpecs[0]?.roomName || 'Living Room'}' with ${listing.roomSpecs[0]?.sunlightExposure} sunlight, suggest two ways to stage it to maximize its appeal to buyers.`;
            case RealEstateStatus.OFFERS:
                const highestOffer = listing.offers.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
                return `Analyze this offer for the property at ${listing.address}. Offer Amount: $${highestOffer.amount}, Contingencies: ${highestOffer.contingencies.join(', ')}. Provide two pros and one potential concern for the seller.`;
            case RealEstateStatus.ESCROW:
                return `Explain the concept of an 'appraisal contingency' in a real estate transaction in simple, clear terms for a first-time home seller.`;
            case RealEstateStatus.DOCUMENTS:
                return `What is a 'seller's disclosure' and why is it a critical document in a real estate transaction? Provide a brief, easy-to-understand explanation.`;
            default:
                return `Provide a brief summary of the current property status which is '${activeStep}'.`;
        }
    };

    const handleGenerate = async (prompt: string) => {
        if (!ai) {
            setResponse("AI Service not initialized. Check API Key.");
            return;
        }
        setIsLoading(true);
        setResponse('');
        try {
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setResponse(result.text || '');
        } catch (error) {
            console.error('Gemini API error:', error);
            setResponse('Sorry, I encountered an error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCustomPrompt = (e: React.FormEvent) => {
        e.preventDefault();
        if(promptInput.trim()) {
            handleGenerate(promptInput);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <Button onClick={() => handleGenerate(getContextualPrompt())} disabled={isLoading || !ai} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? 'Thinking...' : `Analyze ${activeStep}`}
            </Button>
            
            {response && (
                <div className="p-3 bg-brand-secondary rounded-lg max-h-60 overflow-y-auto text-sm">
                    <p className="whitespace-pre-wrap">{response}</p>
                </div>
            )}
             {isLoading && !response && (
                <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            )}
            
            <form onSubmit={handleCustomPrompt} className="w-full space-y-2">
                <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Ask a follow-up or custom query..."
                    rows={3}
                    className="w-full bg-brand-secondary border border-brand-accent rounded-md p-2 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow"
                />
                 <div className="flex items-center justify-end">
                    <Button type="submit" size="sm" disabled={isLoading || !promptInput.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ContextualAssistant;