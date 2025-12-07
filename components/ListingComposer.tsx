
import React, { useRef, useState, DragEvent, useEffect } from 'react';
import { Listing, CustomField } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Home, Camera, UploadCloud, Trash2, Plus, Sparkles, X, RefreshCw, MapPin, Database, CheckCircle, Search } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

interface ListingComposerProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const ListingComposer: React.FC<ListingComposerProps> = ({ listing, onListingUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [draftSaved, setDraftSaved] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [showLocationConfirm, setShowLocationConfirm] = useState(false);
    
    // AI State
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onListingUpdate({
            ...listing,
            [e.target.name]: e.target.value,
        });
        setDraftSaved(false);
    };

    const handleSaveDraft = () => {
        localStorage.setItem('listingDraft', JSON.stringify(listing));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 3000);
    };

    // --- Smart Auto-Fill Logic ---
    const initiateAutoFill = () => {
        if (!listing.address) {
            alert("Please enter an address first.");
            return;
        }
        setIsAutoFilling(true);
        // Simulate "Locating"
        setTimeout(() => {
            setShowLocationConfirm(true);
            setIsAutoFilling(false);
        }, 1000);
    };

    const confirmAutoFill = () => {
        // Apply "Online Data"
        const simulatedData = {
            bedrooms: 4,
            bathrooms: 3,
            squareFootage: 2650,
            yearBuilt: 1988,
            lotSize: '0.35 Acres',
            price: 825000, // Estimate
            description: `Stunning 4-bedroom property located at ${listing.address}. Featuring 3 bathrooms and over 2,600 sq ft of living space. Built in 1988, this home sits on a generous 0.35-acre lot. Perfect for families.`
        };

        onListingUpdate({
            ...listing,
            ...simulatedData,
            customFields: [
                ...listing.customFields,
                { id: `cf-auto-1`, key: 'Zoning', value: 'Residential' },
            ]
        });
        setShowLocationConfirm(false);
        setDraftSaved(false);
    };

    // --- AI Enhance Logic ---
    const handleEnhanceDescription = async () => {
        if (!ai || !listing.address) {
            alert("AI service not initialized or address missing.");
            return;
        }
        setIsEnhancing(true);

        const prompt = `Acting as a luxury real estate copywriter, rewrite and expand the following property description for ${listing.address}.
        
        Current Draft: "${listing.description}"
        
        Mandatory Requirements:
        1. Emphasize the mid-century modern architectural style.
        2. Highlight the recent kitchen renovation details.
        3. Detail the spacious backyard's suitability for entertaining.
        4. Mention the quiet neighborhood and top-rated schools.
        
        Keep the tone sophisticated and engaging.`;

        try {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            
            if (result.text) {
                onListingUpdate({
                    ...listing,
                    description: result.text
                });
                setDraftSaved(false);
            }
        } catch (error) {
            console.error("AI Enhance Error:", error);
            alert("Failed to enhance description. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    };

    // --- Custom Fields Logic ---
    const handleAddField = () => {
        const newField: CustomField = {
            id: `cf-${Date.now()}`,
            key: '',
            value: ''
        };
        onListingUpdate({ ...listing, customFields: [...listing.customFields, newField] });
    };

    const handleFieldChange = (id: string, field: 'key' | 'value', value: string) => {
        const updatedFields = listing.customFields.map(f => 
            f.id === id ? { ...f, [field]: value } : f
        );
        onListingUpdate({ ...listing, customFields: updatedFields });
        setDraftSaved(false);
    };

    const handleRemoveField = (id: string) => {
        const updatedFields = listing.customFields.filter(f => f.id !== id);
        onListingUpdate({ ...listing, customFields: updatedFields });
    };

    // --- Image Logic ---
    const processFiles = (files: FileList) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        let processedCount = 0;
        const newPhotos: string[] = [];

        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPhotos.push(reader.result as string);
                processedCount++;
                if (processedCount === imageFiles.length) {
                    onListingUpdate({ ...listing, photos: [...listing.photos, ...newPhotos] });
                    setDraftSaved(false);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
        event.target.value = '';
    };

    const handleReplaceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (replaceIndex !== null && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedPhotos = [...listing.photos];
                updatedPhotos[replaceIndex] = reader.result as string;
                onListingUpdate({ ...listing, photos: updatedPhotos });
                setReplaceIndex(null);
                setDraftSaved(false);
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemovePhoto = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening preview
        const updatedPhotos = listing.photos.filter((_, i) => i !== index);
        onListingUpdate({ ...listing, photos: updatedPhotos });
    };

    const triggerReplace = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setReplaceIndex(index);
        replaceInputRef.current?.click();
    };

    return (
        <Card className="animate-fade-in relative">
            {/* Location Confirmation Modal */}
            {showLocationConfirm && (
                <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-6 rounded-lg">
                    <div className="bg-brand-secondary p-6 rounded-lg border border-brand-blue shadow-2xl max-w-md w-full animate-fade-in">
                        <h3 className="text-xl font-bold text-brand-highlight mb-2 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-brand-blue" /> Confirm Location
                        </h3>
                        <div className="aspect-video bg-gray-700 rounded mb-4 flex items-center justify-center border border-brand-accent">
                            <span className="text-brand-light text-sm">Simulated Map View of {listing.address}</span>
                        </div>
                        <p className="text-brand-light mb-4 text-sm">
                            We found property records for this address. 
                            <br/><br/>
                            <strong>Data Found:</strong> 4 Beds, 3 Baths, 2,650 SqFt, Built 1988.
                            <br/><br/>
                            Would you like to auto-populate the listing details?
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => setShowLocationConfirm(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={confirmAutoFill}>Yes, Apply Data</Button>
                        </div>
                    </div>
                </div>
            )}

            <Card.Header>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Home className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Listing Composer</Card.Title>
                            <Card.Description>Ceremonial Overlay: "Listing Ignited"</Card.Description>
                        </div>
                    </div>
                    <Button 
                        onClick={handleSaveDraft} 
                        variant={draftSaved ? 'secondary' : 'outline'}
                        className={`transition-all duration-500 ${draftSaved ? 'bg-brand-green/20 text-brand-green border-brand-green/50' : ''}`}
                    >
                        {draftSaved ? 'Draft Saved' : 'Save Draft'}
                    </Button>
                </div>
            </Card.Header>
            <Card.Content className="space-y-6">
                
                {/* Property Identification Section */}
                <div className="bg-brand-secondary/30 p-4 rounded-lg border border-brand-accent">
                    <h3 className="text-sm font-bold text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Step 1: Property Identification
                    </h3>
                    <div className="flex items-end gap-2">
                        <Input 
                            label="Property Address" 
                            name="address" 
                            value={listing.address} 
                            onChange={handleInputChange} 
                            className="flex-grow" 
                            placeholder="Enter street address to locate..."
                        />
                        <Button 
                            onClick={initiateAutoFill} 
                            disabled={isAutoFilling || !listing.address}
                            className="mb-[2px] whitespace-nowrap bg-brand-blue min-w-[140px]"
                            title="Locate and Auto-populate details"
                        >
                            {isAutoFilling ? (
                                <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Locating...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Database className="w-4 h-4" /> Locate & Fill</span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Property Details Grid */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-brand-light border-b border-brand-accent pb-2">Property Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <Input label="Listing Price" name="price" type="number" value={listing.price} onChange={handleInputChange} />
                        <Input label="Bedrooms" name="bedrooms" type="number" value={listing.bedrooms || ''} onChange={handleInputChange} placeholder="#" />
                        <Input label="Bathrooms" name="bathrooms" type="number" step="0.5" value={listing.bathrooms || ''} onChange={handleInputChange} placeholder="#" />
                        <Input label="Sq. Footage" name="squareFootage" type="number" value={listing.squareFootage || ''} onChange={handleInputChange} placeholder="ft²" />
                        <Input label="Year Built" name="yearBuilt" type="number" value={listing.yearBuilt || ''} onChange={handleInputChange} placeholder="YYYY" />
                        <Input label="Lot Size" name="lotSize" value={listing.lotSize || ''} onChange={handleInputChange} placeholder="Acres/SqFt" />
                        <div className="col-span-2">
                             <label className="block text-sm font-medium text-brand-light mb-1">Status</label>
                             <div className="p-2 bg-brand-primary border border-brand-accent rounded-md text-brand-light opacity-70">
                                 {listing.status}
                             </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-brand-light">Property Description</label>
                            <Button 
                                size="sm" 
                                onClick={handleEnhanceDescription} 
                                disabled={isEnhancing || !ai || !listing.description.trim()}
                                className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white border border-brand-blue/50"
                            >
                                {isEnhancing ? (
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></div> Writing...</span>
                                ) : (
                                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Magic Enhance</span>
                                )}
                            </Button>
                        </div>
                        <textarea name="description" value={listing.description} onChange={handleInputChange} rows={6} className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue" />
                    </div>
                </div>

                {/* Custom Fields */}
                <div>
                     <div className="flex justify-between items-center mb-3 border-b border-brand-accent pb-2">
                        <h3 className="text-lg font-semibold text-brand-light">Additional Fields</h3>
                        <Button size="sm" variant="outline" onClick={handleAddField}>
                            <Plus className="w-3 h-3 mr-1" /> Add Field
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {listing.customFields.map((field) => (
                            <div key={field.id} className="flex gap-2 items-center">
                                <Input 
                                    placeholder="Field Name (e.g., HOA Fee)" 
                                    value={field.key} 
                                    onChange={(e) => handleFieldChange(field.id, 'key', e.target.value)}
                                    className="flex-1"
                                />
                                <Input 
                                    placeholder="Value" 
                                    value={field.value} 
                                    onChange={(e) => handleFieldChange(field.id, 'value', e.target.value)}
                                    className="flex-1"
                                />
                                <Button size="icon" variant="destructive" onClick={() => handleRemoveField(field.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                         {listing.customFields.length === 0 && (
                            <p className="text-sm text-brand-light italic">No custom fields added.</p>
                        )}
                    </div>
                </div>

                {/* Media Gallery */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-brand-light border-b border-brand-accent pb-2">Media Gallery</h3>
                    <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <input type="file" accept="image/*" ref={replaceInputRef} onChange={handleReplaceFileChange} className="hidden" />
                    
                    <div
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full min-h-[150px] border-2 border-dashed rounded-lg p-6 text-center text-brand-light flex flex-col items-center justify-center gap-2 transition-colors duration-300 cursor-pointer ${isDragging ? 'border-brand-blue bg-brand-blue/10' : 'border-brand-accent hover:border-brand-light'}`}
                    >
                        <UploadCloud className="w-10 h-10 text-brand-accent" />
                        <p className="font-semibold">Drop images or click to upload</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {listing.photos.map((photo, index) => (
                            <div 
                                key={index} 
                                className="relative group cursor-pointer"
                                onClick={() => setPreviewImage(photo)}
                            >
                                <img src={photo} alt={`Listing photo ${index + 1}`} className="w-full h-32 rounded-lg object-cover border border-brand-accent hover:border-brand-blue transition-colors" />
                                
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                    <Button size="icon" variant="secondary" onClick={(e) => triggerReplace(index, e)} title="Replace Image">
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={(e) => handleRemovePhoto(index, e)} title="Delete Image">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card.Content>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-screen">
                        <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" />
                        <button 
                            className="absolute -top-10 right-0 text-white hover:text-brand-blue"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ListingComposer;
