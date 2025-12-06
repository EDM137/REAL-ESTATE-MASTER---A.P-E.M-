
import React, { useState, useMemo } from 'react';
import { Listing, Offer } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Gavel, Check, X, MessageSquare, Trophy, Calculator, TrendingUp, History, DollarSign, Clock, Banknote, Sparkles } from './ui/Icons';

interface OfferEngineProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const OfferEngine: React.FC<OfferEngineProps> = ({ listing, onListingUpdate }) => {
    const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
    const [counterMode, setCounterMode] = useState<string | null>(null); // Offer ID being countered
    const [counterForm, setCounterForm] = useState({ amount: 0, terms: '' });
    const [sortBy, setSortBy] = useState<'Price' | 'BestInterest'>('BestInterest');
    
    // Calculation Helper (Memoized for use in sorting and rendering)
    const calculateMetrics = (offer: Offer) => {
        const commissionRate = 0.05; // 5%
        const titleFees = 2000;
        const transferTaxRate = 0.0011;
        const mortgagePayoff = 350000;
        
        const commission = offer.amount * commissionRate;
        const transferTax = offer.amount * transferTaxRate;
        const totalDeductions = commission + titleFees + transferTax + mortgagePayoff;
        const netProceeds = offer.amount - totalDeductions;

        // Best Interest Score Algorithm
        // Base: Net Proceeds
        // Cash Bonus: +5% of Value (Perceived security)
        // Speed Bonus: (45 - closingDays) * $500/day (Time is money)
        // Contingency Penalty: - $2000 per contingency
        
        let score = netProceeds;
        if (offer.financingType === 'Cash') score += (offer.amount * 0.05);
        if (offer.closingDays < 30) score += (30 - offer.closingDays) * 1000; // Stronger speed bonus
        score -= (offer.contingencies.length * 5000); // Penalty for contingencies

        return {
            commission,
            titleFees,
            transferTax,
            mortgagePayoff,
            netProceeds,
            score
        };
    };

    const processedOffers = useMemo(() => {
        return listing.offers.map(offer => ({
            ...offer,
            metrics: calculateMetrics(offer)
        }));
    }, [listing.offers]);

    // Find extremes for badges
    const maxNet = Math.max(...processedOffers.map(o => o.metrics.netProceeds));
    const minDays = Math.min(...processedOffers.map(o => o.closingDays));

    const sortedOffers = [...processedOffers].sort((a, b) => {
        if (sortBy === 'Price') {
            return b.amount - a.amount;
        } else {
            // Sort by Best Interest Score
            return b.metrics.score - a.metrics.score;
        }
    });

    const handleOfferStatusChange = (offerId: string, status: Offer['status']) => {
        const updatedOffers = listing.offers.map(offer => 
            offer.id === offerId ? { 
                ...offer, 
                status,
                history: [...(offer.history || []), { action: status, amount: offer.amount, date: new Date().toISOString() }]
            } : offer
        );
        onListingUpdate({ ...listing, offers: updatedOffers });
    };

    const initiateCounter = (offer: Offer) => {
        setCounterMode(offer.id);
        setCounterForm({ amount: offer.amount, terms: offer.terms || '' });
    };

    const submitCounter = () => {
        if (!counterMode) return;
        const updatedOffers = listing.offers.map(offer => 
            offer.id === counterMode ? { 
                ...offer, 
                status: 'Countered' as const,
                counterAmount: counterForm.amount,
                counterTerms: counterForm.terms,
                history: [...(offer.history || []), { action: 'Counter Sent', amount: counterForm.amount, date: new Date().toISOString() }]
            } : offer
        );
        onListingUpdate({ ...listing, offers: updatedOffers });
        setCounterMode(null);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Bid Management Console</Card.Title>
                            <Card.Description>{sortedOffers.length} Active Offers • Ranked by {sortBy === 'BestInterest' ? 'Best Seller Interest' : 'Gross Price'}</Card.Description>
                        </div>
                    </div>
                     <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                         <button 
                            onClick={() => setSortBy('BestInterest')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${sortBy === 'BestInterest' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                         >
                             Smart Rank
                         </button>
                         <button 
                            onClick={() => setSortBy('Price')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${sortBy === 'Price' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                         >
                             Price
                         </button>
                     </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="space-y-6">
                    {sortedOffers.length === 0 ? (
                        <p className="text-center text-brand-light py-10 border-2 border-dashed border-brand-accent rounded-lg">
                            No active bids. Waiting for offers to arrive...
                        </p>
                    ) : (
                        sortedOffers.map((offer, index) => {
                            const isFirst = index === 0;
                            const isHighestNet = offer.metrics.netProceeds === maxNet;
                            const isFastest = offer.closingDays === minDays;
                            const isCash = offer.financingType === 'Cash';

                            return (
                                <div key={offer.id} className={`bg-brand-secondary rounded-lg border transition-all relative overflow-hidden ${isFirst ? 'border-brand-blue shadow-lg ring-1 ring-brand-blue/50' : 'border-brand-accent hover:border-brand-blue'}`}>
                                    {/* Recommendation Banner */}
                                    {isFirst && sortBy === 'BestInterest' && (
                                        <div className="bg-brand-blue text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-2">
                                            <Sparkles className="w-3 h-3" /> SOVEREIGN RECOMMENDED: BEST OVERALL OFFER
                                        </div>
                                    )}

                                    {/* Offer Header Card */}
                                    <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center justify-start pt-1 min-w-[60px]">
                                                {isFirst ? <Trophy className={`w-8 h-8 ${sortBy === 'BestInterest' ? 'text-brand-blue' : 'text-brand-yellow'} mb-1`} /> :
                                                 <span className="text-xl font-bold text-brand-light/50">#{index + 1}</span>}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                                    <h3 className="text-2xl font-bold text-brand-highlight">{formatCurrency(offer.amount)}</h3>
                                                    <div className="flex gap-1">
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                                                            offer.financingType === 'Cash' ? 'bg-brand-green/20 text-brand-green border-brand-green' : 'bg-brand-primary text-brand-light border-brand-accent'
                                                        }`}>
                                                            {offer.financingType.toUpperCase()}
                                                        </span>
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-primary text-brand-light border border-brand-accent flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {offer.closingDays} Days
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Smart Badges */}
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {isHighestNet && (
                                                        <span className="text-[10px] bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <Banknote className="w-3 h-3" /> Highest Net
                                                        </span>
                                                    )}
                                                    {isFastest && (
                                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" /> Fastest Close
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-brand-light">{offer.buyerName} via {offer.agentName}</p>
                                                {offer.contingencies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {offer.contingencies.map(c => <span key={c} className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0.5 rounded">{c}</span>)}
                                                    </div>
                                                ) : (
                                                    <div className="mt-2 text-[10px] text-brand-green bg-brand-green/10 border border-brand-green/30 px-1.5 py-0.5 rounded inline-block">No Contingencies</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 justify-center items-end min-w-[140px]">
                                             <Button 
                                                size="sm" 
                                                variant={expandedOfferId === offer.id ? 'primary' : 'outline'}
                                                onClick={() => setExpandedOfferId(expandedOfferId === offer.id ? null : offer.id)}
                                                className="w-full"
                                            >
                                                <Calculator className="w-3 h-3 mr-2" />
                                                Net Sheet
                                            </Button>
                                            
                                            {offer.status === 'Pending' && (
                                                <div className="flex gap-1 w-full">
                                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => initiateCounter(offer)}>Counter</Button>
                                                    <Button size="sm" className="flex-1 text-xs bg-brand-green hover:bg-brand-green/90" onClick={() => handleOfferStatusChange(offer.id, 'Accepted')}><Check className="w-3 h-3" /></Button>
                                                    <Button size="sm" className="flex-1 text-xs bg-red-600 hover:bg-red-700" onClick={() => handleOfferStatusChange(offer.id, 'Rejected')}><X className="w-3 h-3" /></Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Counter Offer Mode */}
                                    {counterMode === offer.id && (
                                        <div className="p-4 border-t-2 border-brand-blue bg-brand-blue/5 animate-fade-in rounded-b-lg">
                                            <h4 className="font-bold text-brand-blue mb-3 flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5" /> Draft Counter Offer
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4 mb-4">
                                                <div>
                                                    <Input 
                                                        label="Counter Price ($)" 
                                                        type="number" 
                                                        value={counterForm.amount} 
                                                        onChange={e => setCounterForm({ ...counterForm, amount: parseFloat(e.target.value) })}
                                                        className="font-bold text-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-brand-light mb-1">Counter Terms & Conditions</label>
                                                    <textarea 
                                                        value={counterForm.terms} 
                                                        onChange={e => setCounterForm({ ...counterForm, terms: e.target.value })} 
                                                        placeholder="e.g. Price reflects AS-IS condition. Inspection contingency removed."
                                                        rows={3}
                                                        className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-shadow"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <Button size="sm" variant="outline" onClick={() => setCounterMode(null)}>Discard Draft</Button>
                                                <Button size="sm" onClick={submitCounter}>Submit Counter Offer</Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Net Sheet / Closing Costs Calculator */}
                                    {expandedOfferId === offer.id && (
                                        <div className="p-4 border-t border-brand-accent bg-brand-primary/30 animate-fade-in">
                                            <h4 className="font-semibold text-brand-highlight mb-3 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-brand-green" />
                                                Seller Estimated Net Sheet
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between font-medium">
                                                        <span>Gross Sales Price</span>
                                                        <span>{formatCurrency(offer.amount)}</span>
                                                    </div>
                                                    <hr className="border-brand-accent" />
                                                    <div className="flex justify-between text-red-400">
                                                        <span>Est. Commissions (5%)</span>
                                                        <span>- {formatCurrency(offer.metrics.commission)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-red-400">
                                                        <span>Transfer Taxes</span>
                                                        <span>- {formatCurrency(offer.metrics.transferTax)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-red-400">
                                                        <span>Title & Escrow Fees</span>
                                                        <span>- {formatCurrency(offer.metrics.titleFees)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-red-400">
                                                        <span>Mortgage Payoff (Est.)</span>
                                                        <span>- {formatCurrency(offer.metrics.mortgagePayoff)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-center bg-brand-primary p-4 rounded border border-brand-accent">
                                                    <span className="text-brand-light mb-1">Estimated Net Proceeds</span>
                                                    <span className="text-3xl font-bold text-brand-green">{formatCurrency(offer.metrics.netProceeds)}</span>
                                                    <p className="text-[10px] text-brand-light mt-2 text-center max-w-[200px]">
                                                        *Estimates only. Does not include prorated property taxes or HOA fees.
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Offer History */}
                                            {offer.history && offer.history.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-brand-accent">
                                                    <h5 className="text-xs font-bold text-brand-light mb-2 flex items-center gap-1">
                                                        <History className="w-3 h-3" /> Offer History
                                                    </h5>
                                                    <ul className="text-xs space-y-1">
                                                        {offer.history.map((h, i) => (
                                                            <li key={i} className="text-brand-light flex justify-between w-full max-w-md">
                                                                <span>{h.action}</span>
                                                                <span className="text-brand-highlight">{formatCurrency(h.amount)}</span>
                                                                <span className="opacity-50">{new Date(h.date).toLocaleDateString()}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Card.Content>
        </Card>
    );
};

export default OfferEngine;
