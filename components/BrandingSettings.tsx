
import React, { useRef } from 'react';
import { BrandingConfig } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Camera, Trash2, Sun, Moon, Palette, Building, User } from './ui/Icons';
import { fileToDataUrl } from '../utils/file';

interface BrandingSettingsProps {
    config: BrandingConfig;
    onUpdate: (config: BrandingConfig) => void;
    onClose: () => void;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({ config, onUpdate, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToDataUrl(file);
                onUpdate({ ...config, logo: base64 });
            } catch (err) {
                console.error("Logo upload failed", err);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...config, [e.target.name]: e.target.value });
    };

    const toggleTheme = () => {
        onUpdate({ ...config, theme: config.theme === 'light' ? 'dark' : 'light' });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <Card className="w-full max-w-md bg-brand-secondary border-brand-accent shadow-2xl">
                <Card.Header>
                    <div className="flex items-center gap-3">
                        <Palette className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Private Label Settings</Card.Title>
                            <Card.Description>Customize the application for your brand.</Card.Description>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content className="space-y-6">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-brand-accent flex items-center justify-center overflow-hidden bg-brand-primary">
                                {config.logo ? (
                                    <img src={config.logo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Building className="w-10 h-10 text-brand-accent opacity-50" />
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-brand-blue p-2 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            {config.logo && (
                                <button 
                                    onClick={() => onUpdate({ ...config, logo: undefined })}
                                    className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                        <p className="text-xs text-brand-light">Upload your company logo (PNG/JPG)</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <Input 
                            label="Company Name" 
                            name="companyName" 
                            value={config.companyName} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Malley Real Estate"
                        />
                        <Input 
                            label="User Name / Agent Name" 
                            name="userName" 
                            value={config.userName} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Eric Malley"
                        />
                        <div className="flex items-center justify-between p-3 bg-brand-primary rounded-lg border border-brand-accent">
                            <div className="flex items-center gap-2">
                                {config.theme === 'dark' ? <Moon className="w-5 h-5 text-brand-blue" /> : <Sun className="w-5 h-5 text-brand-yellow" />}
                                <span className="text-sm font-medium text-brand-highlight">Theme: {config.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`w-12 h-6 rounded-full transition-colors relative ${config.theme === 'dark' ? 'bg-brand-blue' : 'bg-brand-accent'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </Card.Content>
                <Card.Footer className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onClose}>Save & Apply</Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default BrandingSettings;
