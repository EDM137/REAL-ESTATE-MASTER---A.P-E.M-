
import React, { useRef, useState, useEffect } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadCloud, Save, Trash2, PenTool, MousePointer } from './ui/Icons';
import { fileToDataUrl } from '../utils/file';

interface PlotPlanEditorProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const PlotPlanEditor: React.FC<PlotPlanEditorProps> = ({ listing, onListingUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'select'>('pen');
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (listing.plotPlan) {
            const img = new Image();
            img.src = listing.plotPlan;
            img.onload = () => {
                setImage(img);
                drawImage(img);
            };
        }
    }, []);

    const drawImage = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Resize canvas to match image aspect ratio, max width container
        const parent = canvas.parentElement;
        if(parent) {
             canvas.width = parent.clientWidth;
             const scale = canvas.width / img.width;
             canvas.height = img.height * scale;
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToDataUrl(e.target.files[0]);
                const img = new Image();
                img.src = base64;
                img.onload = () => {
                    setImage(img);
                    drawImage(img);
                    // Save initial state
                    onListingUpdate({ ...listing, plotPlan: base64 });
                };
            } catch (err) {
                console.error(err);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (tool !== 'pen' || !image) return;
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || tool !== 'pen') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if(isDrawing) {
            setIsDrawing(false);
            saveCanvas();
        }
    };

    const saveCanvas = () => {
        if(canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            onListingUpdate({ ...listing, plotPlan: dataUrl });
        }
    };

    const clearCanvas = () => {
        if(image) {
            drawImage(image);
            saveCanvas();
        }
    };

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                <Card.Title>Plot Plan & Design</Card.Title>
                <Card.Description>Visualize property layout and landscaping.</Card.Description>
            </Card.Header>
            <Card.Content>
                <div className="flex gap-4 mb-4">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload Plan
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    
                    <div className="bg-brand-secondary p-1 rounded border border-brand-accent flex gap-1">
                        <Button size="sm" variant={tool === 'select' ? 'primary' : 'outline'} onClick={() => setTool('select')}>
                            <MousePointer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant={tool === 'pen' ? 'primary' : 'outline'} onClick={() => setTool('pen')}>
                            <PenTool className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button variant="destructive" size="sm" onClick={clearCanvas} disabled={!image}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear Annotations
                    </Button>
                </div>

                <div className="bg-gray-100 rounded-lg overflow-hidden border border-brand-accent relative min-h-[400px] flex items-center justify-center">
                    {!image && (
                        <div className="text-center text-gray-500">
                            <p>No plot plan loaded.</p>
                            <p className="text-sm">Upload an image to start designing.</p>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className={`max-w-full ${image ? 'cursor-crosshair' : ''}`}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
            </Card.Content>
        </Card>
    );
};

export default PlotPlanEditor;