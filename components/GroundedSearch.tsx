import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Globe, MapPin } from './ui/Icons';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

type SearchMode = 'web' | 'maps';

const GroundedSearch: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<SearchMode>('web');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<{ text: string; sources: any[] } | null>(null);
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const performSearch = async (latitude?: number, longitude?: number) => {
        if (!ai) {
             setError('AI Service not initialized. Check API Key.');
             setIsLoading(false);
             return;
        }

        try {
            let result: GenerateContentResponse;
            if (mode === 'web') {
                 result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { tools: [{ googleSearch: {} }] },
                });
            } else {
                 if(latitude === undefined || longitude === undefined) {
                    setError('Location not available.');
                    setIsLoading(false);
                    return;
                }
                result = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        tools: [{ googleMaps: {} }],
                        toolConfig: {
                            retrievalConfig: { latLng: { latitude, longitude } },
                        },
                    },
                });
            }
            
            const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setResponse({ text: result.text, sources });
        } catch (err) {
            setError('An error occurred during the search.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResponse(null);
        setError('');

        if (mode === 'web') {
            performSearch();
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    performSearch(latitude, longitude);
                },
                (geoError) => {
                    setError('Could not get location. Please enable location services.');
                    console.error('Geolocation Error:', geoError);
                    setIsLoading(false);
                }
            );
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                <Button onClick={() => setMode('web')} className={`w-1/2 ${mode === 'web' ? 'bg-brand-blue' : 'bg-transparent'}`} size="sm"><Globe className="w-4 h-4 mr-2" /> Web</Button>
                <Button onClick={() => setMode('maps')} className={`w-1/2 ${mode === 'maps' ? 'bg-brand-blue' : 'bg-transparent'}`} size="sm"><MapPin className="w-4 h-4 mr-2" /> Maps</Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'web' ? 'Ask about recent events...' : 'Find places nearby...'}
                />
                <Button type="submit" disabled={isLoading || !prompt.trim() || !ai} className="w-full">
                    {isLoading ? 'Searching...' : `Search with ${mode === 'web' ? 'Google' : 'Maps'}`}
                </Button>
            </form>

            {isLoading && (
                 <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            )}
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            {response && (
                <div className="p-3 bg-brand-secondary rounded-lg max-h-80 overflow-y-auto text-sm">
                    <p className="whitespace-pre-wrap">{response.text}</p>
                    {response.sources && response.sources.length > 0 && (
                        <div className="mt-4 pt-2 border-t border-brand-accent">
                            <h4 className="font-semibold text-xs text-brand-light mb-2">SOURCES:</h4>
                            <ul className="space-y-1">
                                {response.sources.map((chunk, index) => {
                                    const source = chunk.web || chunk.maps;
                                    return source?.uri && (
                                        <li key={index}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline text-xs truncate block">
                                               {source.title || source.uri}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroundedSearch;