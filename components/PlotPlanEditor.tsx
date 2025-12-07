
import React, { useRef, useEffect, useState } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Map, Plus, Trash2, Download } from './ui/Icons';

interface PlotPlanEditorProps {
    listing: Listing;
}

const PlotPlanEditor: React.FC<PlotPlanEditorProps> = ({ listing }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [structures, setStructures] = useState<{id: string, x: number, y: number, w: number, h: number, label: string}[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and draw grid
        ctx.fillStyle = '#1e293b'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for(let x=0; x<=canvas.width; x+=20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for(let y=0; y<=canvas.height; y+=20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw Structures
        structures.forEach(s => {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(s.x, s.y, s.w, s.h);
            ctx.strokeStyle = '#60a5fa';
            ctx.strokeRect(s.x, s.y, s.w, s.h);
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px sans-serif';
            ctx.fillText(s.label, s.x + 5, s.y + 15);
        });

    }, [structures]);

    const addStructure = () => {
        setStructures([...structures, {
            id: `s-${Date.now()}`,
            x: 50 + Math.random() * 100,
            y: 50 + Math.random() * 100,
            w: 100,
            h: 80,
            label: 'Main House'
        }]);
    };

    const clearCanvas = () => setStructures([]);

    return (
        <Card className="animate-fade-in h-full flex flex-col">
            <Card.Header>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Map className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Plot Plan Editor</Card.Title>
                            <Card.Description>Site Layout for {listing.address}</Card.Description>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={clearCanvas}>
                            <Trash2 className="w-4 h-4 mr-2" /> Clear
                        </Button>
                        <Button size="sm" onClick={addStructure}>
                            <Plus className="w-4 h-4 mr-2" /> Add Structure
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Content className="flex-grow p-0 relative min-h-[500px] bg-brand-secondary">
                 <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={500} 
                    className="w-full h-full object-contain cursor-crosshair"
                />
                {structures.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-brand-light">Canvas Ready. Add structures to begin.</p>
                    </div>
                )}
            </Card.Content>
             <Card.Footer className="flex justify-between items-center">
                <p className="text-xs text-brand-light">Drag functionality coming in v2.0</p>
                <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" /> Export Plan
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default PlotPlanEditor;
