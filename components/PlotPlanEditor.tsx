
import React, { useRef, useState, useEffect } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadCloud, Save, Trash2, PenTool, Square } from './ui/Icons';
import { fileToDataUrl } from '../utils/file';

interface PlotPlanEditorProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const PlotPlanEditor: React.FC<PlotPlanEditorProps> = ({ listing, onListingUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'rect'>('pen');
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize from listing prop
    useEffect(() => {
        if (listing.plotPlan) {
            const img = new Image();
            img.src = listing.plotPlan;
            img.onload = () => {
                setImage(img);
                initCanvas(img);
            };
        }
    }, [listing.plotPlan]);

    const initCanvas = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Use parent width to determine scaling
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            // Calculate height based on image aspect ratio
            const scale = canvas.width / img.width;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
            }
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
                    initCanvas(img);
                    // Initial save so state matches visual
                    saveCanvas(); 
                };
            } catch (err) {
                console.error(err);
            }
        }
    };

    const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!image) return; // Only allow drawing if a plan is loaded
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        setStartPos({ x, y });
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
            // Save state for shape preview
            setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !startPos) return;
        const { x, y } = getCoords(e);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        if (tool === 'pen') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'rect') {
            // Restore original state to avoid dragging trails
            if (snapshot) ctx.putImageData(snapshot, 0, 0);
            const width = x - startPos.x;
            const height = y - startPos.y;
            ctx.strokeRect(startPos.x, startPos.y, width, height);
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            setSnapshot(null);
            setStartPos(null);
            saveCanvas();
        }
    };

    const saveCanvas = () => {
        if(canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL();
            // Debounce or direct update depending on performance needs.
            // Direct update for now as onListingUpdate should handle it.
            onListingUpdate({ ...listing, plotPlan: dataUrl });
        }
    };

    const clearCanvas = () => {
        if (image) {
            initCanvas(image);
            saveCanvas();
        }
    };

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg">
                        <PenTool className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <Card.Title>Plot Plan & Design</Card.Title>
                        <Card.Description>Annotate property lines and structure layout securely.</Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="w-4 h-4 mr-2" /> Upload Plan
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="bg-brand-secondary p-1 rounded border border-brand-accent flex gap-1">
                        <Button 
                            size="sm" 
                            variant={tool === 'pen' ? 'primary' : 'outline'} 
                            onClick={() => setTool('pen')}
                            title="Freehand Pen (Property Lines)"
                        >
                            <PenTool className="w-4 h-4 mr-2" /> Lines
                        </Button>
                        <Button 
                            size="sm" 
                            variant={tool === 'rect' ? 'primary' : 'outline'} 
                            onClick={() => setTool('rect')}
                            title="Structure Box Diagram"
                        >
                            <Square className="w-4 h-4 mr-2" /> Structures
                        </Button>
                    </div>

                    <Button variant="destructive" size="sm" onClick={clearCanvas} disabled={!image}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear All
                    </Button>
                </div>

                <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-brand-accent relative min-h-[400px] flex items-center justify-center">
                    {!image && (
                        <div className="text-center text-gray-500 pointer-events-none">
                            <UploadCloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No plot plan loaded.</p>
                            <p className="text-sm">Upload an image to start annotating.</p>
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
                <div className="mt-4 text-xs text-brand-light">
                    <p><strong>Instructions:</strong> Upload a site plan. Use the <strong>Lines</strong> tool for boundaries and the <strong>Structures</strong> tool to box out buildings, garages, or key zones. Changes save automatically.</p>
                </div>
            </Card.Content>
        </Card>
    );
};

export default PlotPlanEditor;
