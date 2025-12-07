
import React, { useState, useRef } from 'react';
import { Listing, RoomSpec } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ChevronLeft, ChevronRight, Plus, Trash2, Building, Camera, UploadCloud, X, Map } from './ui/Icons';
import { fileToDataUrl } from '../utils/file';

interface RoomSlideshowProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const RoomSlideshow: React.FC<RoomSlideshowProps> = ({ listing, onListingUpdate }) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const floorPlanInputRef = useRef<HTMLInputElement>(null);

    const activeSlide = listing.roomSpecs[activeSlideIndex];

    const handleSlideChange = (index: number) => {
        if (index >= 0 && index < listing.roomSpecs.length) {
            setActiveSlideIndex(index);
        }
    };

    const handleAddSlide = () => {
        const newSlide: RoomSpec = {
            id: `room${Date.now()}`,
            roomName: `New Room ${listing.roomSpecs.length + 1}`,
            ceilingHeight: 9,
            windowCount: 1,
            sunlightExposure: 'Medium',
            orientation: 'North',
            materials: '',
            notes: '',
            photos: [],
            floorPlanImage: ''
        };
        const updatedRoomSpecs = [...listing.roomSpecs, newSlide];
        onListingUpdate({ ...listing, roomSpecs: updatedRoomSpecs });
        setActiveSlideIndex(updatedRoomSpecs.length - 1);
    };

    const handleRemoveSlide = (id: string) => {
        const updatedRoomSpecs = listing.roomSpecs.filter(slide => slide.id !== id);
        onListingUpdate({ ...listing, roomSpecs: updatedRoomSpecs });
        setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedSlides = listing.roomSpecs.map((slide, index) =>
            index === activeSlideIndex ? { ...slide, [name]: value } : slide
        );
        onListingUpdate({ ...listing, roomSpecs: updatedSlides });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToDataUrl(file);
                const updatedSpecs = listing.roomSpecs.map((spec, index) => {
                    if (index === activeSlideIndex) {
                        return { ...spec, photos: [...(spec.photos || []), base64] };
                    }
                    return spec;
                });
                onListingUpdate({ ...listing, roomSpecs: updatedSpecs });
            } catch (error) {
                console.error("Error uploading room photo", error);
            }
        }
        e.target.value = '';
    };

    const handleRemoveRoomPhoto = (photoIndex: number) => {
        const updatedSpecs = listing.roomSpecs.map((spec, index) => {
            if (index === activeSlideIndex) {
                const newPhotos = [...(spec.photos || [])];
                newPhotos.splice(photoIndex, 1);
                return { ...spec, photos: newPhotos };
            }
            return spec;
        });
        onListingUpdate({ ...listing, roomSpecs: updatedSpecs });
    };

    const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToDataUrl(file);
                const updatedSpecs = listing.roomSpecs.map((spec, index) => {
                    if (index === activeSlideIndex) {
                        return { ...spec, floorPlanImage: base64 };
                    }
                    return spec;
                });
                onListingUpdate({ ...listing, roomSpecs: updatedSpecs });
            } catch (error) {
                console.error("Error uploading floor plan", error);
            }
        }
        e.target.value = '';
    };

    const handleRemoveFloorPlan = () => {
         const updatedSpecs = listing.roomSpecs.map((spec, index) => {
            if (index === activeSlideIndex) {
                return { ...spec, floorPlanImage: '' };
            }
            return spec;
        });
        onListingUpdate({ ...listing, roomSpecs: updatedSpecs });
    };

    return (
        <Card className="animate-fade-in">
            <Card.Header>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Room Specification Slideshow</Card.Title>
                            <Card.Description>Enter detailed specs and photos for each room.</Card.Description>
                        </div>
                    </div>
                    <Button onClick={handleAddSlide} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add Room
                    </Button>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="bg-brand-secondary p-4 rounded-lg min-h-[400px]">
                    {activeSlide ? (
                        <div className="space-y-6">
                            {/* Header Row */}
                            <div className="flex justify-between items-center border-b border-brand-accent pb-4">
                                <Input label="Room Name" name="roomName" value={activeSlide.roomName} onChange={handleInputChange} className="text-xl font-bold" />
                                <Button onClick={() => handleRemoveSlide(activeSlide.id)} size="icon" variant="destructive" disabled={listing.roomSpecs.length <= 1}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Specs */}
                                <div className="space-y-6">
                                    {/* Dimensions & Lighting Section */}
                                    <div>
                                        <h4 className="text-xs font-bold text-brand-light uppercase tracking-wider mb-3">Dimensions & Lighting</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="Ceiling Height (ft)" name="ceilingHeight" type="number" value={activeSlide.ceilingHeight} onChange={handleInputChange} />
                                            <Input label="Window Count" name="windowCount" type="number" value={activeSlide.windowCount} onChange={handleInputChange} />
                                            <Input label="Orientation" name="orientation" value={activeSlide.orientation} onChange={handleInputChange} />
                                            <Input label="Sunlight Exposure" name="sunlightExposure" value={activeSlide.sunlightExposure} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    
                                    {/* Design & Staging Section */}
                                    <div>
                                        <h4 className="text-xs font-bold text-brand-light uppercase tracking-wider mb-3">Design & Staging Specs</h4>
                                        <div className="space-y-4">
                                            <Input 
                                                label="Materials & Finishes" 
                                                name="materials" 
                                                value={activeSlide.materials} 
                                                onChange={handleInputChange} 
                                                placeholder="Flooring, wall finishes, countertops, etc." 
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-brand-light mb-1">Staging Notes & Function</label>
                                                <textarea 
                                                    name="notes" 
                                                    value={activeSlide.notes} 
                                                    onChange={handleInputChange} 
                                                    rows={3} 
                                                    placeholder="Specific staging ideas, functional descriptions, etc." 
                                                    className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue transition-shadow" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Visuals & Floor Plan */}
                                <div className="space-y-6">
                                     {/* Floor Plan Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-brand-light uppercase tracking-wider">Room Floor Plan</h4>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                ref={floorPlanInputRef} 
                                                onChange={handleFloorPlanUpload} 
                                                className="hidden" 
                                            />
                                            {!activeSlide.floorPlanImage && (
                                                <Button size="sm" variant="outline" onClick={() => floorPlanInputRef.current?.click()}>
                                                    <UploadCloud className="w-4 h-4 mr-2" /> Upload Plan
                                                </Button>
                                            )}
                                        </div>

                                        {activeSlide.floorPlanImage ? (
                                            <div className="relative group w-full h-48 bg-black/20 rounded-lg overflow-hidden border border-brand-accent">
                                                <img 
                                                    src={activeSlide.floorPlanImage} 
                                                    alt={`${activeSlide.roomName} floor plan`} 
                                                    className="w-full h-full object-contain" 
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="secondary" onClick={() => floorPlanInputRef.current?.click()}>
                                                        Change
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={handleRemoveFloorPlan}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => floorPlanInputRef.current?.click()}
                                                className="border-2 border-dashed border-brand-accent rounded-lg h-48 flex flex-col items-center justify-center text-center text-brand-light cursor-pointer hover:border-brand-blue hover:text-brand-blue transition-colors gap-2"
                                            >
                                                <Map className="w-8 h-8 opacity-50" />
                                                <span className="text-sm">Upload layout/floor plan</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Photos Section - Full Width */}
                            <div>
                                <div className="flex justify-between items-center mb-3 pt-4 border-t border-brand-accent">
                                    <h4 className="text-xs font-bold text-brand-light uppercase tracking-wider">Room Photos</h4>
                                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="w-4 h-4 mr-2" /> Add Photo
                                    </Button>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        className="hidden" 
                                    />
                                </div>
                                
                                {activeSlide.photos && activeSlide.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {activeSlide.photos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img 
                                                    src={photo} 
                                                    alt={`${activeSlide.roomName} photo ${index + 1}`} 
                                                    className="w-full h-32 object-cover rounded-md border border-brand-accent" 
                                                />
                                                <button 
                                                    onClick={() => handleRemoveRoomPhoto(index)}
                                                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-brand-accent rounded-lg p-6 text-center text-brand-light cursor-pointer hover:border-brand-blue hover:text-brand-blue transition-colors"
                                    >
                                        <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Upload room specific photos</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-brand-light">
                            <p>No rooms defined. Please add a room to begin.</p>
                        </div>
                    )}
                </div>
            </Card.Content>
            <Card.Footer className="flex justify-between items-center">
                <Button onClick={() => handleSlideChange(activeSlideIndex - 1)} disabled={activeSlideIndex === 0} variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <span className="text-sm font-medium text-brand-light">
                    Room {activeSlideIndex + 1} of {listing.roomSpecs.length}
                </span>
                <Button onClick={() => handleSlideChange(activeSlideIndex + 1)} disabled={activeSlideIndex === listing.roomSpecs.length - 1} variant="outline">
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default RoomSlideshow;
