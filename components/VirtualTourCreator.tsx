
import React, { useState, useRef, useEffect } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Film, Video, Plus, Trash2, Play, Pause, CheckCircle } from './ui/Icons';

interface VirtualTourCreatorProps {
    listing: Listing;
}

interface VideoClip {
    id: string;
    roomName: string;
    duration: number; // in seconds
    thumbnail: string; // placeholder color or image data
}

const VirtualTourCreator: React.FC<VirtualTourCreatorProps> = ({ listing }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string>(listing.roomSpecs[0]?.roomName || 'General');
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            // Stop Recording Logic
            const newClip: VideoClip = {
                id: `clip-${Date.now()}`,
                roomName: selectedRoom,
                duration: recordingTime,
                thumbnail: 'bg-brand-blue' // In a real app, capture a frame
            };
            setClips([...clips, newClip]);
            setRecordingTime(0);
        }
        setIsRecording(!isRecording);
    };

    const deleteClip = (id: string) => {
        setClips(clips.filter(c => c.id !== id));
    };

    return (
        <Card className="animate-fade-in h-full flex flex-col">
            <Card.Header>
                <div className="flex items-center gap-3">
                    <Film className="w-6 h-6 text-brand-blue" />
                    <div>
                        <Card.Title>Virtual Tour Creator</Card.Title>
                        <Card.Description>Record, Assemble, and Publish Immersive Tours</Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content className="flex-grow flex flex-col lg:flex-row gap-6">
                {/* Recorder View */}
                <div className="flex-grow flex flex-col gap-4">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-2 border-brand-accent shadow-lg group">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        
                        {/* Overlay UI */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="bg-black/50 px-3 py-1 rounded text-white text-xs flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    {isRecording ? 'REC' : 'STANDBY'} {isRecording && <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>}
                                </div>
                                <select 
                                    className="bg-black/50 text-white text-xs border border-white/20 rounded p-1"
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                >
                                    {listing.roomSpecs.map(room => (
                                        <option key={room.id} value={room.roomName}>{room.roomName}</option>
                                    ))}
                                    <option value="Exterior">Exterior</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            
                            <div className="flex justify-center">
                                <button 
                                    onClick={toggleRecording}
                                    className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                                        isRecording ? 'bg-red-500 scale-90' : 'bg-transparent hover:bg-white/20'
                                    }`}
                                >
                                    {isRecording ? <div className="w-6 h-6 bg-white rounded-sm"></div> : <div className="w-12 h-12 bg-red-500 rounded-full"></div>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline / Clips */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent flex-grow flex flex-col">
                        <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                            <Video className="w-5 h-5 text-brand-light" /> Clip Timeline
                        </h3>
                        
                        <div className="flex-grow overflow-y-auto space-y-3">
                            {clips.length === 0 ? (
                                <div className="text-center text-brand-light text-sm py-8 opacity-50">
                                    No clips recorded. Start recording to build your tour.
                                </div>
                            ) : (
                                clips.map((clip, index) => (
                                    <div key={clip.id} className="bg-brand-primary p-2 rounded border border-brand-accent flex gap-3 items-center group">
                                        <div className="w-16 h-12 bg-brand-blue/20 rounded flex items-center justify-center text-xs font-bold text-brand-blue">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-brand-highlight">{clip.roomName}</p>
                                            <p className="text-xs text-brand-light">{clip.duration}s</p>
                                        </div>
                                        <button onClick={() => deleteClip(clip.id)} className="text-brand-light hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-brand-accent space-y-2">
                            <div className="flex justify-between text-sm font-semibold text-brand-highlight">
                                <span>Total Duration:</span>
                                <span>{clips.reduce((acc, curr) => acc + curr.duration, 0)}s</span>
                            </div>
                            <Button className="w-full" disabled={clips.length === 0}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Compile & Publish Tour
                            </Button>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
};

export default VirtualTourCreator;
