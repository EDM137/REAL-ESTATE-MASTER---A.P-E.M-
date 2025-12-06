
import React from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Banknote, Check, Clock } from './ui/Icons';

interface EscrowDashboardProps {
    listing: Listing;
}

const milestonesConfig = [
    { name: 'Earnest Money Deposit (10%)', percentage: 0.10, status: 'Secured' },
    { name: 'Inspection & Appraisal (40%)', percentage: 0.40, status: 'Pending' },
    { name: 'Closing Funds (40%)', percentage: 0.40, status: 'Pending' },
    { name: 'Final Release (10%)', percentage: 0.10, status: 'Pending' },
];

const EscrowDashboard: React.FC<EscrowDashboardProps> = ({ listing }) => {
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                <Card.Title>Escrow Gateway</Card.Title>
                <Card.Description>Blockchain-Certified with 10/40/40/10 Clause Logic</Card.Description>
            </Card.Header>
            <Card.Content>
                <div className="space-y-4">
                    {milestonesConfig.map((milestone, index) => {
                        const amount = listing.price * milestone.percentage;
                        const statusIcon = milestone.status === 'Secured' ? <Check className="w-5 h-5 text-brand-green" /> :
                                           milestone.status === 'Released' ? <Banknote className="w-5 h-5 text-brand-blue" /> :
                                           <Clock className="w-5 h-5 text-brand-light" />;
                        
                        return (
                            <div key={index} className="flex items-center justify-between p-4 bg-brand-secondary rounded-lg">
                                <div className="flex items-center gap-4">
                                    {statusIcon}
                                    <div>
                                        <p className="font-semibold text-brand-highlight">{milestone.name}</p>
                                        <p className={`text-sm font-bold ${
                                            milestone.status === 'Secured' ? 'text-brand-green' :
                                            milestone.status === 'Released' ? 'text-brand-blue' : 'text-brand-light'
                                        }`}>{milestone.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-brand-highlight">{formatCurrency(amount)}</p>
                                    <p className="text-sm text-brand-light">{milestone.percentage * 100}% of Total</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card.Content>
            <Card.Footer className="flex justify-between items-center">
                 <p className="text-sm text-brand-light">Total Property Value:</p>
                 <p className="text-xl font-bold text-brand-blue">{formatCurrency(listing.price)}</p>
            </Card.Footer>
        </Card>
    );
};

export default EscrowDashboard;
