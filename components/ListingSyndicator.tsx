
import React, { useState } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Globe, CheckCircle, Share2, UploadCloud } from './ui/Icons';

interface ListingSyndicatorProps {
    listing: Listing;
}

const platforms = [
    { name: 'MLS (Multiple Listing Service)', status: 'Pending', color: 'bg-blue-600' },
    { name: 'Zillow', status: 'Pending', color: 'bg-blue-500' },
    { name: 'Realtor.com', status: 'Pending', color: 'bg-red-500' },
    { name: 'Redfin', status: 'Pending', color: 'bg-red-600' },
    { name: 'Facebook Marketplace', status: 'Pending', color: 'bg-blue-700' },
    { name: 'Instagram', status: 'Pending', color: 'bg-pink-600' },
    { name: 'TikTok', status: 'Pending', color: 'bg-black' },
];

const ListingSyndicator: React.FC<ListingSyndicatorProps> = ({ listing }) => {
    const [syndicationStatus, setSyndicationStatus] = useState(platforms);
    const [isPublishing, setIsPublishing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePublish = () => {
        setIsPublishing(true);
        let currentProgress = 0;
        
        const interval = setInterval(() => {
            currentProgress += 15;
            setProgress(currentProgress);
            
            setSyndicationStatus(prev => prev.map(p => ({
                ...p,
                status: Math.random() > 0.3 ? 'Live' : 'Processing...' // Randomly update status for effect
            })));

            if (currentProgress >= 100) {
                clearInterval(interval);
                setIsPublishing(false);
                setSyndicationStatus(prev => prev.map(p => ({ ...p, status: 'Live' })));
            }
        }, 500);
    };

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                 <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-brand-blue" />
                    <div>
                        <Card.Title>Syndication Bridge</Card.Title>
                        <Card.Description>Universal Listing Deployment & Application Bridge</Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content className="space-y-6">
                <div className="bg-brand-secondary p-6 rounded-lg border border-brand-accent text-center">
                    <h3 className="text-xl font-bold text-brand-highlight mb-2">Ready to Launch?</h3>
                    <p className="text-brand-light mb-6">
                        Blast this listing to {platforms.length} major platforms simultaneously using our secure Application Bridge.
                    </p>
                    
                    {isPublishing ? (
                        <div className="w-full max-w-md mx-auto">
                            <div className="w-full bg-brand-primary rounded-full h-4 overflow-hidden mb-2">
                                <div 
                                    className="bg-brand-green h-full transition-all duration-300 ease-out"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-brand-light">Bridging connections... {progress}%</p>
                        </div>
                    ) : (
                        <Button size="lg" onClick={handlePublish} disabled={syndicationStatus.every(p => p.status === 'Live')}>
                            <Share2 className="w-5 h-5 mr-2" />
                            {syndicationStatus.every(p => p.status === 'Live') ? 'Syndication Complete' : 'Execute Global Launch'}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {syndicationStatus.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-brand-primary border border-brand-accent rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                                <span className="font-semibold text-brand-highlight">{platform.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {platform.status === 'Live' ? (
                                    <span className="text-brand-green text-xs font-bold flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> LIVE
                                    </span>
                                ) : (
                                    <span className="text-brand-light text-xs italic">{platform.status}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Content>
        </Card>
    );
};

export default ListingSyndicator;
