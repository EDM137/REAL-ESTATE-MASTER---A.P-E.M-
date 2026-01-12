
import React from 'react';
import { Listing } from '../types';
import { Sparkles, Camera } from './ui/Icons';

interface JobShowcaseProps {
    listing: Listing;
}

const JobShowcase: React.FC<JobShowcaseProps> = ({ listing }) => {
    const jobs = listing.maintenanceJobs || [];

    return (
        <div className="space-y-8">
            {jobs.map(job => (
                <div key={job.id} className="bg-brand-secondary p-6 rounded-lg border border-brand-accent shadow-inner">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-brand-highlight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-yellow" /> {job.title}
                            </h3>
                            <p className="text-sm text-brand-light">{job.description}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-brand-light bg-brand-primary px-2 py-1 rounded">Certified Completed: {job.endDate || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                                {job.photosBefore.length > 0 ? (
                                    <img src={job.photosBefore[0]} className="w-full h-full object-cover" alt="Before" />
                                ) : (
                                    <div className="text-center opacity-30">
                                        <Camera className="w-10 h-10 mx-auto mb-2" />
                                        <p className="text-xs uppercase">Before Photo Missing</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white uppercase tracking-widest font-bold">Initial State</div>
                        </div>

                        <div className="relative group">
                            <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center border border-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.2)] overflow-hidden">
                                {job.photosAfter.length > 0 ? (
                                    <img src={job.photosAfter[0]} className="w-full h-full object-cover" alt="After" />
                                ) : (
                                    <div className="text-center opacity-30">
                                        <Camera className="w-10 h-10 mx-auto mb-2" />
                                        <p className="text-xs uppercase">After Photo Missing</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-2 left-2 bg-brand-blue/80 px-2 py-1 rounded text-[10px] text-white uppercase tracking-widest font-bold">Upgrade Complete</div>
                        </div>
                    </div>
                </div>
            ))}

            {jobs.length === 0 && (
                <div className="text-center py-20 text-brand-light border-2 border-dashed border-brand-accent rounded-lg">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-semibold">No finished projects to showcase yet.</p>
                    <p className="text-sm opacity-50">Upload "Before & After" photos to see the transformation.</p>
                </div>
            )}
        </div>
    );
};

export default JobShowcase;
