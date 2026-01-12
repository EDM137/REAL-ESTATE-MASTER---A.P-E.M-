
import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Sparkles, FileText, Send } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

interface EstimateComposerProps {
    listing: Listing;
}

const EstimateComposer: React.FC<EstimateComposerProps> = ({ listing }) => {
    const [prompt, setPrompt] = useState('');
    const [estimateText, setEstimateText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleGenerate = async () => {
        if (!ai || !prompt.trim()) return;
        setIsLoading(true);
        try {
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Acting as a professional general contractor for a luxury real estate project at ${listing.address}, draft a detailed Scope of Work and Estimate for the following request: "${prompt}". 
                Include:
                1. Itemized labor and material costs.
                2. Estimated timeline.
                3. Quality certifications and warranty terms.
                Make the tone professional and sovereign-grade.`,
            });
            setEstimateText(result.text || '');
        } catch (e) {
            console.error(e);
            setEstimateText("Error generating estimate. Check API configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-brand-primary rounded-lg border border-brand-accent">
                <h4 className="text-sm font-bold text-brand-highlight mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-yellow" /> AI-Powered Scope Drafting
                </h4>
                <div className="flex gap-2">
                    <Input 
                        placeholder="e.g., Full master bath remodel with heated floors..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-grow"
                    />
                    <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
                        {isLoading ? 'Drafting...' : 'Generate Scope'}
                    </Button>
                </div>
            </div>

            {estimateText && (
                <div className="bg-white text-black p-6 rounded shadow-lg font-serif animate-fade-in relative min-h-[400px]">
                    <div className="absolute top-4 right-4 text-[10px] text-gray-400 font-sans tracking-widest">SOVEREIGN ESTIMATE v1.0</div>
                    <div className="border-b border-gray-300 pb-4 mb-4">
                        <h2 className="text-2xl font-bold uppercase tracking-tighter">Project Estimate</h2>
                        <p className="text-xs text-gray-500 uppercase">{listing.address}</p>
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{estimateText}</div>
                    <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                         <Button size="sm" variant="outline" className="text-black border-gray-400">
                            <FileText className="w-4 h-4 mr-2" /> Convert to Contract
                        </Button>
                    </div>
                </div>
            )}

            {!estimateText && !isLoading && (
                <div className="text-center py-10 text-brand-light border-2 border-dashed border-brand-accent rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Enter a job description above to generate an AI-assisted estimate.</p>
                </div>
            )}
        </div>
    );
};

export default EstimateComposer;
