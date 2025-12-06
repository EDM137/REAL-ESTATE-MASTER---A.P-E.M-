
import React, { useState, useRef, useEffect } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, Shield, Camera, Mic, CheckCircle, FileText, User, Pause, Play } from './ui/Icons';
import AdBanner from './AdBanner';

interface SecureChatProps {
    listing: Listing;
    onListingUpdate?: (listing: Listing) => void;
    onClose: () => void;
}

const SecureChat: React.FC<SecureChatProps> = ({ listing, onListingUpdate, onClose }) => {
    const [isVideoMode, setIsVideoMode] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [isOnHold, setIsOnHold] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Mock participants for the demo
    const participants = [
        { name: 'Buyer (John)', role: 'Buyer', color: 'bg-blue-600' },
        { name: 'Seller Agent (Alice)', role: 'Realtor', color: 'bg-purple-600' },
        { name: 'Buyer Agent (Bob)', role: 'Realtor', color: 'bg-indigo-600' },
        { name: 'Mediator/Contractor', role: '3rd Party', color: 'bg-orange-600' },
    ];

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isVideoMode && !isOnHold) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = s;
                    }
                })
                .catch(err => console.error("Video access denied:", err));
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoMode, isOnHold]);

    const toggleChecklistItem = (itemId: string) => {
        if (!onListingUpdate) return;
        const updatedChecklist = listing.closingChecklist.map(item => {
            if (item.id === itemId) {
                const isApproved = !item.completed;
                return { 
                    ...item, 
                    completed: isApproved, 
                    approvedBy: isApproved ? [...item.approvedBy, 'Seller'] : item.approvedBy.filter(u => u !== 'Seller')
                };
            }
            return item;
        });
        onListingUpdate({ ...listing, closingChecklist: updatedChecklist });
    };

    const VideoPlaceholder: React.FC<{ name: string; role: string; color: string }> = ({ name, role, color }) => (
        <div className={`relative w-full h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col items-center justify-center`}>
            <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-xl font-bold text-white mb-2`}>
                {name.charAt(0)}
            </div>
            <div className="text-white font-semibold text-sm">{name}</div>
            <div className="text-gray-400 text-xs">{role}</div>
            <div className="absolute top-2 right-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
             <div className="absolute bottom-2 left-2 flex gap-1">
                 <Mic className="w-3 h-3 text-white" />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in p-4">
            <Card className="w-full max-w-7xl flex flex-col h-[90vh] relative overflow-hidden">
                <Card.Header className="flex justify-between items-center py-3 z-20 bg-brand-secondary/90 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-brand-green" />
                        <div>
                             <Card.Title>Secure Closing War Room</Card.Title>
                             <Card.Description>MLS ID: {listing.id} | Multi-Party Encrypted Channel</Card.Description>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isVideoMode && (
                            <>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className={isOnHold ? "bg-brand-yellow text-brand-primary border-brand-yellow" : ""}
                                    onClick={() => setIsOnHold(!isOnHold)}
                                >
                                    {isOnHold ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                                    {isOnHold ? "Resume Call" : "Hold Call"}
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={showChecklist ? 'primary' : 'outline'} 
                                    onClick={() => setShowChecklist(!showChecklist)}
                                    disabled={isOnHold}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Checklist
                                </Button>
                            </>
                        )}
                         <Button 
                            size="sm" 
                            variant={isVideoMode ? 'destructive' : 'primary'} 
                            onClick={() => { setIsVideoMode(!isVideoMode); setIsOnHold(false); }}
                         >
                            <Camera className="w-4 h-4 mr-2" />
                            {isVideoMode ? 'End Conference' : 'Start Video Conference'}
                         </Button>
                        <Button size="icon" variant="outline" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </Card.Header>
                
                <Card.Content className="flex-grow overflow-hidden flex gap-4 p-4 relative">
                    {isVideoMode ? (
                        isOnHold ? (
                            <div className="absolute inset-0 z-10">
                                <AdBanner variant="fullscreen" />
                            </div>
                        ) : (
                            <div className="flex flex-1 gap-4 h-full overflow-hidden">
                                {/* Video Grid */}
                                <div className={`grid gap-4 w-full h-full transition-all duration-300 ${showChecklist ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                                    {/* Local User (Seller) */}
                                    <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-brand-blue shadow-lg ${showChecklist ? 'col-span-2 md:col-span-1' : ''}`}>
                                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                                            You (Seller)
                                        </div>
                                    </div>
                                    
                                    {/* Remote Participants */}
                                    {participants.map((p, i) => (
                                        <VideoPlaceholder key={i} name={p.name} role={p.role} color={p.color} />
                                    ))}
                                </div>

                                {/* Checklist Sidebar */}
                                {showChecklist && (
                                    <div className="w-80 flex-shrink-0 bg-brand-secondary rounded-lg border border-brand-accent p-4 overflow-y-auto animate-fade-in flex flex-col">
                                        <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-brand-blue" />
                                            Final Validations
                                        </h3>
                                        <div className="space-y-3 flex-grow">
                                            {listing.closingChecklist.map((item) => (
                                                <div key={item.id} className="p-3 bg-brand-primary rounded border border-brand-accent">
                                                    <div className="flex items-start gap-3">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={item.completed} 
                                                            onChange={() => toggleChecklistItem(item.id)}
                                                            className="mt-1 w-4 h-4 text-brand-blue rounded focus:ring-brand-blue bg-brand-secondary border-brand-light"
                                                        />
                                                        <div>
                                                            <p className={`text-sm font-medium ${item.completed ? 'text-brand-green line-through' : 'text-brand-highlight'}`}>
                                                                {item.label}
                                                            </p>
                                                            {item.completed && (
                                                                <p className="text-[10px] text-brand-green mt-1">Approved by: {item.approvedBy.join(', ')}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        // Chat View
                        <div className="flex-grow flex flex-col h-full w-full">
                            <div className="flex-grow overflow-y-auto space-y-4 mb-4">
                                {listing.communications.map((msg, index) => (
                                    <div key={index} className={`flex items-end gap-2 ${msg.agentType === "Buyer's Agent" ? 'justify-end' : 'justify-start'}`}>
                                        {msg.agentType === 'Listing Agent' && <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-sm font-bold flex-shrink-0">LA</div>}
                                        <div className={`max-w-[70%] p-3 rounded-lg ${
                                            msg.agentType === "Buyer's Agent"
                                                ? 'bg-brand-blue text-white rounded-br-none' 
                                                : 'bg-brand-accent text-brand-highlight rounded-bl-none'
                                        }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-xs mt-1 opacity-70 ${msg.agentType === "Buyer's Agent" ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
                                        </div>
                                        {msg.agentType === "Buyer's Agent" && <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-sm font-bold flex-shrink-0">BA</div>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Message the group..."
                                    disabled
                                    className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow disabled:opacity-50"
                                />
                                <Button disabled>Send</Button>
                            </div>
                        </div>
                    )}
                </Card.Content>
            </Card>
        </div>
    );
};

export default SecureChat;
