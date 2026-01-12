
import React, { useState } from 'react';
import { Listing, MaintenanceJob } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Wrench, Plus, Calculator, FileText, Banknote, Sparkles } from './ui/Icons';
import JobCosting from './JobCosting';
import EstimateComposer from './EstimateComposer';
import PaymentDashboard from './PaymentDashboard';
import JobShowcase from './JobShowcase';

interface MaintenancePortalProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const MaintenancePortal: React.FC<MaintenancePortalProps> = ({ listing, onListingUpdate }) => {
    const [activeView, setActiveView] = useState<'costing' | 'estimate' | 'payments' | 'showcase'>('costing');

    const renderView = () => {
        switch (activeView) {
            case 'costing': return <JobCosting listing={listing} onListingUpdate={onListingUpdate} />;
            case 'estimate': return <EstimateComposer listing={listing} />;
            case 'payments': return <PaymentDashboard listing={listing} />;
            case 'showcase': return <JobShowcase listing={listing} />;
        }
    };

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-blue/10 rounded-lg">
                            <Wrench className="w-6 h-6 text-brand-blue" />
                        </div>
                        <div>
                            <Card.Title>Maintenance & Upgrade Portal</Card.Title>
                            <Card.Description>Orchestrate contractors, job costing, and "Before & After" visuals.</Card.Description>
                        </div>
                    </div>
                    <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                        <button 
                            onClick={() => setActiveView('costing')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors ${activeView === 'costing' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                        >
                            <Calculator className="w-3 h-3" /> Costing
                        </button>
                        <button 
                            onClick={() => setActiveView('estimate')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors ${activeView === 'estimate' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                        >
                            <FileText className="w-3 h-3" /> Estimates
                        </button>
                        <button 
                            onClick={() => setActiveView('payments')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors ${activeView === 'payments' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                        >
                            <Banknote className="w-3 h-3" /> Payments
                        </button>
                        <button 
                            onClick={() => setActiveView('showcase')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2 transition-colors ${activeView === 'showcase' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-white'}`}
                        >
                            <Sparkles className="w-3 h-3" /> Showcase
                        </button>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                {renderView()}
            </Card.Content>
        </Card>
    );
};

export default MaintenancePortal;
