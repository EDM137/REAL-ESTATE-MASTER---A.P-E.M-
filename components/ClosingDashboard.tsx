
import React from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle, Download, Home, TrendingUp, Star, Shield, Gift } from './ui/Icons';

interface ClosingDashboardProps {
    listing: Listing;
}

const ClosingDashboard: React.FC<ClosingDashboardProps> = ({ listing }) => {
    // Mock comparative data
    const areaAvgPrice = listing.price * 0.95; // Simulating we sold above average
    const closingTime = 28; // days
    const areaAvgTime = 35; // days

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

    return (
        <Card className="animate-fade-in relative overflow-hidden">
             {/* Confetti Background Effect (CSS only simulation) */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{backgroundImage: 'radial-gradient(circle, #3B82F6 2px, transparent 2.5px)', backgroundSize: '30px 30px'}}>
            </div>

            <Card.Header className="text-center pb-2">
                <div className="inline-flex items-center justify-center p-3 bg-brand-green/20 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-brand-green" />
                </div>
                <Card.Title className="text-3xl text-brand-green">TRANSACTION CLOSED</Card.Title>
                <Card.Description className="text-lg">Congratulations! The property has successfully changed hands.</Card.Description>
            </Card.Header>

            <Card.Content className="space-y-8">
                {/* Deal Summary */}
                <div className="bg-brand-secondary p-6 rounded-lg border border-brand-accent shadow-lg">
                    <h3 className="text-xl font-bold text-brand-highlight mb-4 border-b border-brand-accent pb-2">Final Deal Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-brand-light text-sm uppercase tracking-wider">Final Sale Price</p>
                            <p className="text-3xl font-bold text-brand-highlight">{formatCurrency(listing.price)}</p>
                        </div>
                        <div>
                            <p className="text-brand-light text-sm uppercase tracking-wider">Closing Date</p>
                            <p className="text-2xl font-bold text-brand-highlight">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-brand-light text-sm uppercase tracking-wider">New Owner</p>
                            <p className="text-2xl font-bold text-brand-highlight">{listing.offers.find(o => o.status === 'Accepted')?.buyerName || 'Private Buyer'}</p>
                        </div>
                    </div>
                </div>

                {/* Market Performance Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-brand-primary p-5 rounded-lg border border-brand-accent">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-6 h-6 text-brand-blue" />
                            <h3 className="font-bold text-brand-highlight">Market Performance</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-brand-light">Sale vs Area Avg:</span>
                                <span className="font-bold text-brand-green">+{((listing.price - areaAvgPrice) / areaAvgPrice * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-brand-secondary rounded-full h-2">
                                <div className="bg-brand-green h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-brand-light">Days on Market:</span>
                                <span className="font-bold text-brand-blue">{closingTime} Days <span className="text-xs text-brand-light font-normal">(Avg: {areaAvgTime})</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-primary p-5 rounded-lg border border-brand-accent">
                         <div className="flex items-center gap-3 mb-3">
                            <Star className="w-6 h-6 text-brand-yellow" />
                            <h3 className="font-bold text-brand-highlight">Client Satisfaction</h3>
                        </div>
                        <div className="text-center py-2">
                            <div className="flex justify-center gap-1 mb-2">
                                {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-brand-yellow fill-current" />)}
                            </div>
                            <p className="text-sm text-brand-light italic">"The process was seamless and transparent. Using SovereignRE made all the difference!"</p>
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <Shield className="w-6 h-6 text-brand-blue" />
                        <span>Download Final Digital Deed (FortiFile™)</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <Gift className="w-6 h-6 text-brand-blue" />
                        <span>Send "Welcome Home" Gift Package</span>
                    </Button>
                </div>
            </Card.Content>

            <Card.Footer className="text-center bg-brand-secondary/50">
                 <p className="text-sm text-brand-light">Transaction ID: {listing.id}-CLOSED-{Date.now()}</p>
                 <p className="text-xs text-brand-light mt-1">Archived in Sovereign Vault. Immutable Record Sealed.</p>
            </Card.Footer>
        </Card>
    );
};

export default ClosingDashboard;
