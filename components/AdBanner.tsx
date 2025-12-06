
import React from 'react';
import { Button } from './ui/Button';

interface AdBannerProps {
    variant?: 'sidebar' | 'fullscreen';
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = 'sidebar' }) => {
    if (variant === 'fullscreen') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-brand-secondary p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="z-10 max-w-2xl bg-brand-primary/90 p-8 rounded-2xl border-2 border-brand-yellow shadow-2xl">
                    <h4 className="font-bold text-2xl text-brand-yellow mb-2 tracking-widest">SPONSORED ADVERTISEMENT</h4>
                    <div className="w-full h-64 bg-black rounded-lg mb-6 flex items-center justify-center border border-gray-700">
                        {/* Placeholder for Video Ad */}
                        <div className="text-brand-light animate-pulse">Playing Video Ad...</div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Premium Contractors Available Now</h2>
                    <p className="text-brand-light mb-8 text-lg">
                        Need renovations before closing? Get exclusive rates from our certified partners.
                    </p>
                    <Button size="lg" className="bg-brand-yellow text-brand-primary hover:bg-brand-yellow/90 font-bold px-8 py-4">
                        View Offers
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 bg-brand-primary/50 border-2 border-dashed border-brand-accent rounded-lg text-center">
            <h4 className="font-bold text-sm text-brand-yellow">ADVERTISEMENT</h4>
            <p className="text-xs text-brand-light mt-1 mb-3">
                Promote your services to contractors and customers on SovereignOPS.
            </p>
            <Button size="sm" variant="outline" className="w-full text-brand-yellow border-brand-yellow/50 hover:bg-brand-yellow hover:text-brand-primary">
                Place Your Ad Here
            </Button>
        </div>
    );
};

export default AdBanner;
