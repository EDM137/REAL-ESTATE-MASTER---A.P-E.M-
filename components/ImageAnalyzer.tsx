import React, { useState, useRef, useEffect } from 'react';
import { fileToBase64 } from '../utils/image';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { UploadCloud, Send } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

const ImageAnalyzer: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError('File size must be less than 4MB.');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
            setResponse('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !prompt.trim() || !ai) {
            setError('Please upload an image, enter a prompt. AI service might not be available.');
            return;
        }
        setIsLoading(true);
        setResponse('');
        setError('');

        try {
            const imageBase64 = await fileToBase64(imageFile);
            const imagePart = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: imageBase64,
                },
            };
            const textPart = {
                text: prompt,
            };
            
            const result = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, textPart] },
            });
            setResponse(result.text || '');
        } catch (err) {
            setError('Failed to process the image. Please try another file.');
            console.error(err);
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div
                className="border-2 border-dashed border-brand-accent rounded-lg p-6 text-center cursor-pointer hover:border-brand-blue"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                ) : (
                    <div className="text-brand-light">
                        <UploadCloud className="w-10 h-10 mx-auto mb-2" />
                        <p>Click to upload an image</p>
                        <p className="text-xs">(PNG, JPG, WEBP, max 4MB)</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                    label="Question about the image"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., What style of architecture is this?"
                    disabled={isLoading || !imageFile}
                />
                <Button type="submit" disabled={isLoading || !imageFile || !prompt.trim() || !ai} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </Button>
            </form>

            {isLoading && (
                <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                </div>
            )}
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            {response && (
                 <div className="p-3 bg-brand-secondary rounded-lg max-h-60 overflow-y-auto text-sm">
                    <h3 className="font-semibold mb-2 text-brand-highlight">Analysis:</h3>
                    <p className="whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
    );
};

export default ImageAnalyzer;