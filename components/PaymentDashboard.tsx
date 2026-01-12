
import React from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Banknote, CheckCircle, Clock, Shield } from './ui/Icons';

interface PaymentDashboardProps {
    listing: Listing;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ listing }) => {
    const jobs = listing.maintenanceJobs || [];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="space-y-6">
            <div className="bg-brand-blue/10 border border-brand-blue/30 p-4 rounded-lg flex items-center gap-4">
                <Shield className="w-8 h-8 text-brand-blue" />
                <div>
                    <h4 className="font-bold text-brand-highlight">Smart Payout Protocol</h4>
                    <p className="text-xs text-brand-light">Payments are only released upon multi-party signature and verified completion photos.</p>
                </div>
            </div>

            <div className="space-y-4">
                {jobs.map(job => (
                    <div key={job.id} className="bg-brand-secondary p-4 rounded-lg border border-brand-accent flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${job.status === 'Paid' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-yellow/20 text-brand-yellow'}`}>
                                <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-brand-highlight">{job.title}</p>
                                <p className="text-xs text-brand-light">Contractor: {job.contractor}</p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div>
                                <p className="text-lg font-bold text-brand-highlight">{formatCurrency(job.actualAmount)}</p>
                                <p className="text-[10px] text-brand-light uppercase tracking-widest">{job.status === 'Paid' ? 'Funded' : 'Pending Review'}</p>
                            </div>
                            {job.status === 'Paid' ? (
                                <CheckCircle className="w-6 h-6 text-brand-green" />
                            ) : (
                                <button className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded hover:bg-brand-blue/90 transition-all">
                                    Release Funds
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {jobs.length === 0 && (
                     <div className="text-center py-10 text-brand-light border-2 border-dashed border-brand-accent rounded-lg">
                        No payments found in ledger.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDashboard;
