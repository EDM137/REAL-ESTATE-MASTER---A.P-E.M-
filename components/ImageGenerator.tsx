import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Image as ImageIcon, Sparkles } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !ai) {
            setError('Please enter a prompt. AI service might not be available.');
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);
        setError('');

        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
                },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            setGeneratedImage(`data:image/jpeg;base64,${base64ImageBytes}`);
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError('Failed to generate image. Please check your prompt or API key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Image Prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A futuristic home in a forest"
                    disabled={isLoading}
                />
                <div>
                    <label className="block text-sm font-medium text-brand-light mb-1">Aspect Ratio</label>
                    <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue"
                        disabled={isLoading}
                    >
                        {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                    </select>
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim() || !ai} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </Button>
            </form>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mb-2"></div>
                    <p className="text-sm text-brand-light">Creating your masterpiece...</p>
                </div>
            )}

            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            {generatedImage && (
                <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2">Result:</h3>
                    <img src={generatedImage} alt={prompt} className="rounded-lg w-full object-contain" />
                </div>
            )}
            {!generatedImage && !isLoading && (
                 <div className="flex flex-col items-center justify-center p-8 text-center text-brand-accent border-2 border-dashed border-brand-accent rounded-lg">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">Your generated image will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;