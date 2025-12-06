
import React, { useState } from 'react';
import { Listing } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Handshake, Send, Package, Printer, Download, Star, Home, FileText } from './ui/Icons';

interface LifecycleManagerProps {
    listing: Listing;
}

const LifecycleManager: React.FC<LifecycleManagerProps> = ({ listing }) => {
    const [generatedPackage, setGeneratedPackage] = useState<string | null>(null);

    const handleGeneratePackage = (type: 'Buyer' | 'Seller' | 'Zip') => {
        setGeneratedPackage(type);
    };

    const BrochurePreview = () => (
        <div className="bg-white text-black p-6 rounded shadow-lg max-w-2xl mx-auto aspect-[8.5/11] flex flex-col transform scale-90 origin-top">
            <div className="border-b-4 border-brand-primary pb-4 mb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary tracking-tight">SOVEREIGN<span className="font-light">RE</span></h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Luxury Portfolio</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-brand-blue">${listing.price.toLocaleString()}</p>
                    <p className="text-sm font-semibold">{listing.address}</p>
                </div>
            </div>
            
            <div className="flex-grow space-y-4">
                {listing.photos.length > 0 ? (
                    <img src={listing.photos[0]} alt="Property" className="w-full h-64 object-cover rounded shadow-sm" />
                ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">No Photo Available</div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="font-bold text-brand-primary mb-1">Specs</p>
                        <p>3 Bedrooms</p>
                        <p>2 Bathrooms</p>
                        <p>{listing.customFields.find(f => f.key === 'Year Built')?.value || '1965'} Built</p>
                    </div>
                     <div className="bg-gray-50 p-3 rounded">
                        <p className="font-bold text-brand-primary mb-1">Highlights</p>
                        <p>Hardwood Floors</p>
                        <p>City Views</p>
                        <p>Renovated Kitchen</p>
                    </div>
                </div>

                <div>
                    <p className="font-bold text-brand-primary mb-1">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">{listing.description}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                    <p>Listed by SovereignRE</p>
                    <p>Agent: Eric Daniel Malley</p>
                </div>
                <div className="w-16 h-16 bg-brand-primary text-white flex items-center justify-center text-xs text-center p-1 font-mono">
                    QR CODE
                </div>
            </div>
        </div>
    );

    return (
        <Card className="animate-fade-in space-y-6">
            <Card.Header>
                 <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-brand-blue" />
                    <div>
                        <Card.Title>Lifecycle & Package Factory</Card.Title>
                        <Card.Description>Project Management Showcase, Brochures & Closing Kits</Card.Description>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Generators */}
                    <div className="space-y-6">
                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent">
                            <h3 className="font-semibold text-brand-highlight mb-2 flex items-center gap-2">
                                <Printer className="w-5 h-5 text-brand-blue" />
                                Project Management Portfolio
                            </h3>
                            <p className="text-sm text-brand-light mb-4">
                                Generate the complete in-house showcase brochure for printers. Includes all photos, specs, and history.
                            </p>
                             <Button className="w-full" onClick={() => handleGeneratePackage('Zip')}>
                                <Download className="w-4 h-4 mr-2" /> Download Master ZIP Package
                            </Button>
                        </div>

                         <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent">
                            <h3 className="font-semibold text-brand-highlight mb-2 flex items-center gap-2">
                                <Home className="w-5 h-5 text-brand-green" />
                                Welcome Home Package (Buyer)
                            </h3>
                            <p className="text-sm text-brand-light mb-4">
                                A curated guide with keys, codes, utility contacts, and neighborhood favorites.
                            </p>
                             <Button variant="outline" className="w-full" onClick={() => handleGeneratePackage('Buyer')}>
                                <FileText className="w-4 h-4 mr-2" /> Generate Buyer Kit
                            </Button>
                        </div>

                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent">
                            <h3 className="font-semibold text-brand-highlight mb-2 flex items-center gap-2">
                                <Star className="w-5 h-5 text-brand-yellow" />
                                Seller's Memory Book
                            </h3>
                            <p className="text-sm text-brand-light mb-4">
                                A commemorative book featuring "Before & After" photos and closing documents.
                            </p>
                             <Button variant="outline" className="w-full" onClick={() => handleGeneratePackage('Seller')}>
                                <FileText className="w-4 h-4 mr-2" /> Generate Seller Book
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-gray-100 rounded-lg p-4 border border-brand-accent overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">
                        <div className="absolute top-0 left-0 w-full bg-brand-primary p-2 text-center text-xs font-bold text-white z-10">
                             LIVE PREVIEW MODE
                        </div>
                        
                        {generatedPackage === 'Zip' && (
                            <div className="text-center animate-fade-in">
                                <Package className="w-24 h-24 text-brand-blue mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800">Master Project ZIP Ready</h3>
                                <p className="text-gray-600 mb-6">Contents: Brochure.pdf, Contracts.pdf, Photo_Gallery.zip</p>
                                <Button className="mx-auto">Start Download (45 MB)</Button>
                            </div>
                        )}

                        {generatedPackage === 'Buyer' && (
                            <div className="text-center animate-fade-in w-full h-full p-4 overflow-y-auto">
                                <div className="bg-white p-8 shadow-xl text-left max-w-sm mx-auto">
                                    <h2 className="text-2xl font-serif text-brand-primary mb-4">Welcome Home</h2>
                                    <p className="text-gray-600 italic mb-4">"May your new home be a foundation for many happy memories."</p>
                                    <hr className="my-4"/>
                                    <ul className="text-sm space-y-2 text-gray-700">
                                        <li>✓ Digital Keys Access</li>
                                        <li>✓ Utility Concierge List</li>
                                        <li>✓ Neighborhood Guide</li>
                                        <li>✓ Smart Home Manuals</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {generatedPackage === 'Seller' && (
                            <div className="text-center animate-fade-in w-full h-full p-4 overflow-y-auto">
                                <div className="bg-white p-8 shadow-xl text-left max-w-sm mx-auto border-4 border-double border-brand-primary">
                                    <h2 className="text-2xl font-serif text-brand-primary mb-2 text-center">The Next Chapter</h2>
                                    <p className="text-center text-xs uppercase tracking-widest text-gray-500 mb-6">Prepared for {listing.sellerName}</p>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-gray-200 h-20 flex items-center justify-center text-xs text-gray-500">Memory 1</div>
                                        <div className="bg-gray-200 h-20 flex items-center justify-center text-xs text-gray-500">Memory 2</div>
                                    </div>
                                    <p className="text-sm text-gray-700 text-center">Thank you for trusting SovereignRE with your journey.</p>
                                </div>
                            </div>
                        )}

                        {!generatedPackage && (
                             <BrochurePreview />
                        )}
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
};

export default LifecycleManager;
