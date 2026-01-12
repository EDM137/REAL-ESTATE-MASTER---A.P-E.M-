
import React from 'react';
import { Listing, MaintenanceJob } from '../types';
import { Button } from './ui/Button';
import { Plus, Trash2, TrendingUp, DollarSign } from './ui/Icons';

interface JobCostingProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const JobCosting: React.FC<JobCostingProps> = ({ listing, onListingUpdate }) => {
    const jobs = listing.maintenanceJobs || [];
    const totalSpent = jobs.reduce((acc, job) => acc + job.actualAmount, 0);
    const totalEstimated = jobs.reduce((acc, job) => acc + job.estimateAmount, 0);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-primary p-4 rounded-lg border border-brand-accent text-center">
                    <p className="text-xs text-brand-light uppercase tracking-wider mb-1">Total Jobs</p>
                    <p className="text-2xl font-bold text-brand-highlight">{jobs.length}</p>
                </div>
                <div className="bg-brand-primary p-4 rounded-lg border border-brand-accent text-center">
                    <p className="text-xs text-brand-light uppercase tracking-wider mb-1">Total Estimated</p>
                    <p className="text-2xl font-bold text-brand-yellow">{formatCurrency(totalEstimated)}</p>
                </div>
                <div className="bg-brand-primary p-4 rounded-lg border border-brand-accent text-center">
                    <p className="text-xs text-brand-light uppercase tracking-wider mb-1">Total Actual Spent</p>
                    <p className="text-2xl font-bold text-brand-green">{formatCurrency(totalSpent)}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-brand-highlight flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-blue" /> Active Job Ledger
                    </h3>
                    <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> New Job
                    </Button>
                </div>

                <div className="bg-brand-secondary rounded-lg border border-brand-accent overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-brand-primary text-brand-light text-xs uppercase">
                            <tr>
                                <th className="p-3">Job Title</th>
                                <th className="p-3">Contractor</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Estimate</th>
                                <th className="p-3 text-right">Actual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-accent">
                            {jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-brand-light italic">No jobs in ledger.</td>
                                </tr>
                            ) : (
                                jobs.map(job => (
                                    <tr key={job.id} className="hover:bg-brand-primary/50 transition-colors group">
                                        <td className="p-3 font-semibold text-brand-highlight">{job.title}</td>
                                        <td className="p-3 text-brand-light">{job.contractor}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                job.status === 'Completed' ? 'bg-brand-green/20 text-brand-green' :
                                                job.status === 'Active' ? 'bg-brand-blue/20 text-brand-blue' :
                                                'bg-brand-yellow/20 text-brand-yellow'
                                            }`}>
                                                {job.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-mono">{formatCurrency(job.estimateAmount)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-brand-green">{formatCurrency(job.actualAmount)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default JobCosting;
