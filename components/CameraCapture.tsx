
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Camera, RefreshCw, X, CheckCircle } from './ui/Icons';

interface CameraCaptureProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
    title?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, title = "Capture Photo" }) => {
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        stopCamera();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: facingMode },
                audio: false 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (!capturedImage) {
            startCamera();
        }
        return () => stopCamera();
    }, [facingMode, capturedImage]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setCapturedImage(canvas.toDataURL('image/jpeg'));
                stopCamera();
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-fade-in text-white">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-brand-blue">
                    <Camera className="w-5 h-5" />
                    <span className="font-bold tracking-wider uppercase text-sm">{title}</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center p-4 overflow-hidden relative">
                {!capturedImage ? (
                    <div className="relative w-full h-full max-w-lg bg-black flex items-center justify-center rounded-xl overflow-hidden border border-brand-accent shadow-2xl">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="absolute top-4 right-4 z-10">
                            <Button 
                                size="icon" 
                                variant="secondary" 
                                className="bg-black/50 border-none h-10 w-10 backdrop-blur-md"
                                onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                                title="Switch Camera"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <button 
                                onClick={handleCapture}
                                className="w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-all active:scale-90 flex items-center justify-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-white shadow-inner"></div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full max-w-lg bg-black flex flex-col items-center justify-center rounded-xl overflow-hidden border border-brand-accent shadow-2xl">
                        <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />
                        
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-4">
                            <Button 
                                variant="outline" 
                                className="flex-1 bg-black/50 border-white/20 text-white hover:bg-white/10"
                                onClick={() => setCapturedImage(null)}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Retake
                            </Button>
                            <Button 
                                className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white"
                                onClick={handleConfirm}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Use Photo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-6 bg-brand-primary/50 text-center">
                <p className="text-xs text-brand-light font-medium tracking-wide opacity-60">
                    Sovereign Secure Capture • High Resolution Verification
                </p>
            </div>
        </div>
    );
};

export default CameraCapture;
