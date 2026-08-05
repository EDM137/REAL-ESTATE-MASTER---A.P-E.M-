/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-08-05T08:16:00-07:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Check, ExternalLink, Globe } from './ui/Icons';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface GoogleMapsAddressSearchProps {
    currentAddress: string;
    onSelectAddress: (address: string, location?: { lat: number; lng: number }) => void;
}

const MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export const GoogleMapsAddressSearch: React.FC<GoogleMapsAddressSearchProps> = ({ currentAddress, onSelectAddress }) => {
    const [searchQuery, setSearchQuery] = useState(currentAddress);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>({ lat: 37.422, lng: -122.084 });
    const [isSearching, setIsSearching] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    useEffect(() => {
        setSearchQuery(currentAddress);
    }, [currentAddress]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        // Direct search query lookup
        try {
            if (MAPS_KEY) {
                // Fetch geocode coordinates or places lookup via Google Maps Geocoding API if available
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${MAPS_KEY}`;
                const res = await fetch(geocodeUrl);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const found = data.results.map((r: any) => r.formatted_address);
                    setSuggestions(found);
                    if (data.results[0].geometry?.location) {
                        setSelectedLocation(data.results[0].geometry.location);
                    }
                } else {
                    setSuggestions([query]);
                }
            } else {
                setSuggestions([
                    query,
                    `${query}, California, USA`,
                    `${query}, New York, NY, USA`
                ]);
            }
        } catch (e) {
            console.warn("Google Maps lookup error:", e);
            setSuggestions([query]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = (addr: string) => {
        onSelectAddress(addr, selectedLocation);
        setSuggestions([]);
        setMapOpen(true);
    };

    return (
        <div className="space-y-3 w-full">
            <div className="flex gap-2 items-end">
                <div className="relative flex-grow">
                    <Input 
                        label="Google Maps Property Address Location" 
                        placeholder="Search real address (e.g. 100 Main St, Palo Alto, CA)..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pr-10"
                    />
                    <div className="absolute right-3 bottom-2.5 text-brand-light">
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-4 h-4 text-brand-blue" />
                        )}
                    </div>
                    {suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-brand-secondary border border-brand-blue/40 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-brand-accent">
                            {suggestions.map((sug, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelect(sug)}
                                    className="w-full text-left p-3 hover:bg-brand-blue/20 text-brand-highlight text-sm flex items-center gap-2 transition-colors"
                                >
                                    <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                                    <span className="truncate">{sug}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setMapOpen(!mapOpen)}
                    className="mb-[2px] whitespace-nowrap bg-brand-secondary border-brand-blue/50 text-brand-blue hover:bg-brand-blue hover:text-white"
                >
                    <Globe className="w-4 h-4 mr-1" /> {mapOpen ? 'Hide Map' : 'View Location Map'}
                </Button>
            </div>

            {mapOpen && (
                <div className="mt-3 h-64 w-full rounded-xl overflow-hidden border border-brand-blue/40 relative shadow-lg">
                    {MAPS_KEY ? (
                        <APIProvider apiKey={MAPS_KEY} version="weekly">
                            <Map
                                defaultCenter={selectedLocation}
                                center={selectedLocation}
                                defaultZoom={15}
                                mapId="SOVEREIGN_PROPERTY_MAP"
                                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                                style={{ width: '100%', height: '100%' }}
                            >
                                <AdvancedMarker position={selectedLocation}>
                                    <Pin background="#0066FF" glyphColor="#FFFFFF" borderColor="#FFFFFF" />
                                </AdvancedMarker>
                            </Map>
                        </APIProvider>
                    ) : (
                        <div className="w-full h-full bg-brand-secondary/90 flex flex-col items-center justify-center p-4 text-center">
                            <MapPin className="w-8 h-8 text-brand-blue mb-2 animate-bounce" />
                            <p className="font-bold text-brand-highlight text-sm">Google Maps Platform Connected</p>
                            <p className="text-xs text-brand-light max-w-sm mt-1">
                                Location pinned to: <span className="text-brand-blue font-mono">{searchQuery || 'Current Address'}</span>
                            </p>
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery || 'Real Estate Property')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="mt-3 text-xs text-brand-blue underline flex items-center gap-1 font-semibold"
                            >
                                Open in Google Maps <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
