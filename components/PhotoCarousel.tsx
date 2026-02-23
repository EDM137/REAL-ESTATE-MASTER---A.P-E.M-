
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from './ui/Icons';

interface PhotoCarouselProps {
    photos: string[];
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (photos.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
    };

    return (
        <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden group shadow-2xl border border-brand-accent">
            <div 
                className="w-full h-full flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {photos.map((photo, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                        <img 
                            src={photo} 
                            alt={`Listing photo ${index + 1}`} 
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-blue"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-blue"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-brand-blue w-4' : 'bg-white/50'}`}
                    />
                ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm">
                {currentIndex + 1} / {photos.length}
            </div>
        </div>
    );
};

export default PhotoCarousel;
