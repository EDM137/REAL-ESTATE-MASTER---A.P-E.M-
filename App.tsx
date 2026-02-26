
/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-02-26T00:43:05-08:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useEffect } from 'react';
import { Listing, RealEstateStatus, BrandingConfig } from './types';
import WorkflowStepper from './components/WorkflowStepper';
import AiCopilot from './components/AiCopilot';
import TermsModal from './components/TermsModal';
import SecureChat from './components/SecureChat';
import ListingComposer from './components/ListingComposer';
import RoomSlideshow from './components/RoomSlideshow';
import OfferEngine from './components/OfferEngine';
import EscrowDashboard from './components/EscrowDashboard';
import DocumentVault from './components/DocumentVault';
import LifecycleManager from './components/LifecycleManager';
import Scheduler from './components/Scheduler';
import ListingSyndicator from './components/ListingSyndicator';
import SovereignBanker from './components/SovereignBanker';
import VirtualTourCreator from './components/VirtualTourCreator';
import ClosingDashboard from './components/ClosingDashboard';
import PlotPlanEditor from './components/PlotPlanEditor';
import PetTracker from './components/PetTracker';
import MaintenancePortal from './components/MaintenancePortal';
import BrandingSettings from './components/BrandingSettings';
import Translator from './components/Translator';
import TranslatableText from './components/TranslatableText';
import PropertyManagement from './components/PropertyManagement';
import { Home, Shield, Sun, FileText, Wrench, Settings, User, Languages, Building } from './components/ui/Icons';

const mockListing: Listing = {
// ... existing mockListing ...
    id: 'MLS-20240801',
    address: '456 Sovereign Ave, Real Estate City, 67890',
    price: 750000,
    status: RealEstateStatus.LISTING,
    sellerName: 'Jane Doe',
    sellerEmail: 'jane.doe@email.com',
    sellerPhone: '555-123-4567',
    description: 'Mid-century home with great views. Updated kitchen. Large yard for parties. Quiet area, good schools.',
    photos: [],
    customFields: [
        { id: 'cf1', key: 'Zoning', value: 'R1' },
        { id: 'cf2', key: 'Year Built', value: '1965' }
    ],
    roomSpecs: [],
    offers: [],
    escrowMilestones: [],
    documents: [],
    communications: [],
    appointments: [],
    closingChecklist: [],
    maintenanceJobs: [
        {
            id: 'job-1',
            title: 'Kitchen Backsplash & Counters',
            contractor: 'Elite Designs Co.',
            estimateAmount: 4500,
            actualAmount: 4200,
            status: 'Completed',
            startDate: '2024-05-10',
            endDate: '2024-05-15',
            description: 'Full quartz installation and subway tile backsplash.',
            photosBefore: [],
            photosAfter: []
        }
    ]
};

const App: React.FC = () => {
    const [listing, setListing] = useState<Listing>(mockListing);
    const [activeStep, setActiveStep] = useState<RealEstateStatus>(RealEstateStatus.WELCOME);
    const [appLanguage, setAppLanguage] = useState('English');
    const [showTerms, setShowTerms] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showBranding, setShowBranding] = useState(false);
    const [branding, setBranding] = useState<BrandingConfig>({
        companyName: 'SovereignRE',
        userName: 'Jane Doe',
        theme: 'dark',
        primaryColor: '#3B82F6'
    });

    useEffect(() => {
        const savedBranding = localStorage.getItem('brandingConfig');
        if (savedBranding) {
            try {
                setBranding(JSON.parse(savedBranding));
            } catch (e) {
                console.error("Failed to parse branding:", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('brandingConfig', JSON.stringify(branding));
        
        // Apply Theme
        if (branding.theme === 'light') {
            document.documentElement.style.setProperty('--brand-primary', '#F8FAFC');
            document.documentElement.style.setProperty('--brand-secondary', '#FFFFFF');
            document.documentElement.style.setProperty('--brand-accent', '#E2E8F0');
            document.documentElement.style.setProperty('--brand-light', '#64748B');
            document.documentElement.style.setProperty('--brand-highlight', '#0F172A');
            document.body.classList.remove('bg-brand-primary', 'text-brand-highlight');
            document.body.classList.add('bg-slate-50', 'text-slate-900');
        } else {
            document.documentElement.style.setProperty('--brand-primary', '#0D1B2A');
            document.documentElement.style.setProperty('--brand-secondary', '#1B263B');
            document.documentElement.style.setProperty('--brand-accent', '#415A77');
            document.documentElement.style.setProperty('--brand-light', '#778DA9');
            document.documentElement.style.setProperty('--brand-highlight', '#E0E1DD');
            document.body.classList.remove('bg-slate-50', 'text-slate-900');
            document.body.classList.add('bg-brand-primary', 'text-brand-highlight');
        }
    }, [branding]);

    useEffect(() => {
        const termsAccepted = localStorage.getItem('termsAccepted');
        if (termsAccepted !== 'true') {
            setShowTerms(true);
        }
        
        const draft = localStorage.getItem('listingDraft');
        if (draft) {
             try {
                 const parsed = JSON.parse(draft);
                 setListing(parsed);
             } catch(e) {
                 console.error("Failed to parse draft:", e);
             }
        }
    }, []);

    const handleAcceptTerms = () => {
        localStorage.setItem('termsAccepted', 'true');
        setShowTerms(false);
    };

    const handleListingUpdate = (updatedListing: Listing) => {
        setListing(updatedListing);
    };

    const renderActiveStepComponent = () => {
        switch (activeStep) {
            case RealEstateStatus.WELCOME:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-brand-secondary p-8 rounded-lg border border-brand-accent text-center">
                            <Languages className="w-16 h-16 text-brand-blue mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-brand-highlight mb-4">Welcome to SovereignRE</h2>
                            <p className="text-brand-light mb-6">
                                To provide the most seamless experience, please select your preferred language. 
                                Our AI Assistant will guide you through the entire real estate lifecycle in your native tongue.
                            </p>
                            <div className="max-w-md mx-auto">
                                <Translator 
                                    onLanguageSelect={(lang) => setAppLanguage(lang)} 
                                    onComplete={() => setActiveStep(RealEstateStatus.LISTING)}
                                    isOnboarding={true}
                                />
                            </div>
                        </div>
                    </div>
                );
            case RealEstateStatus.LISTING:
                return <ListingComposer listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.ROOM_SPECS:
                return <RoomSlideshow listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.VIRTUAL_TOUR:
                return <VirtualTourCreator listing={listing} />;
            case RealEstateStatus.SCHEDULE:
                return <Scheduler listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.SYNDICATION:
                return <ListingSyndicator listing={listing} />;
            case RealEstateStatus.OFFERS:
                return <OfferEngine listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.BANKER:
                return <SovereignBanker listing={listing} />;
            case RealEstateStatus.ESCROW:
                 return <EscrowDashboard listing={listing} />;
            case RealEstateStatus.DOCUMENTS:
                return <DocumentVault listing={listing} onListingUpdate={handleListingUpdate} appLanguage={appLanguage} />;
            case RealEstateStatus.MAINTENANCE:
                return <MaintenancePortal listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.PROPERTY_MANAGEMENT:
                return <PropertyManagement listing={listing} onListingUpdate={handleListingUpdate} appLanguage={appLanguage} />;
            case RealEstateStatus.LIFECYCLE:
                return <LifecycleManager listing={listing} />;
            case RealEstateStatus.CLOSED:
                return <ClosingDashboard listing={listing} />;
            case RealEstateStatus.PLOT_PLAN:
                return <PlotPlanEditor listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.PET_TRACKER:
                return <PetTracker />;
            default:
                return (
                    <div className="bg-brand-secondary p-8 rounded-lg animate-fade-in flex flex-col items-center justify-center h-full text-center">
                        <Wrench className="w-12 h-12 text-brand-light mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Module In Development</h2>
                        <p className="text-brand-light">Step '{activeStep}' is being ignited.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-brand-primary font-sans flex flex-col">
            {showTerms && <TermsModal onAccept={handleAcceptTerms} />}
            {showChat && <SecureChat listing={listing} onListingUpdate={handleListingUpdate} onClose={() => setShowChat(false)} />}
            {showBranding && (
                <BrandingSettings 
                    config={branding} 
                    onUpdate={setBranding} 
                    onClose={() => setShowBranding(false)} 
                />
            )}

            <header className="bg-brand-secondary/50 backdrop-blur-sm p-4 border-b border-brand-accent flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {branding.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-10 h-10 object-contain rounded" />
                    ) : (
                        <Home className="w-8 h-8 text-brand-blue" />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-brand-highlight">
                            {branding.companyName.split(' ')[0]}
                            <span className="font-light text-brand-light">{branding.companyName.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-[10px] text-brand-light uppercase tracking-widest font-bold flex items-center gap-1">
                            <User className="w-2 h-2" /> {branding.userName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <button 
                        onClick={() => setShowBranding(true)}
                        className="p-2 hover:bg-brand-accent/20 rounded-full transition-colors group"
                        title="Branding & Settings"
                    >
                        <Settings className="w-5 h-5 text-brand-light group-hover:text-brand-blue group-hover:rotate-90 transition-all duration-300" />
                    </button>
                    <div className="hidden md:flex items-center gap-2">
                       <FileText className="w-4 h-4 text-brand-light" />
                       <span>MLS ID: {listing.id}</span>
                    </div>
                     <button onClick={() => setShowChat(true)} className="flex items-center gap-2 hover:text-brand-blue transition-colors">
                        <Shield className="w-4 h-4 text-brand-light" />
                        <TranslatableText targetLanguage={appLanguage}>Closing War Room</TranslatableText>
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-12 gap-6 p-6 flex-grow">
                <aside className="col-span-12 md:col-span-3 lg:col-span-2">
                    <WorkflowStepper activeStep={activeStep} setActiveStep={setActiveStep} appLanguage={appLanguage} />
                </aside>
                <section className="col-span-12 md:col-span-9 lg:col-span-7">
                    {renderActiveStepComponent()}
                </section>
                <aside className="col-span-12 lg:col-span-3">
                    <AiCopilot listing={listing} activeStep={activeStep} appLanguage={appLanguage} />
                </aside>
            </main>
            
            <footer className="text-center p-4 border-t border-brand-accent text-xs text-brand-light">
                <TranslatableText targetLanguage={appLanguage}>&copy; 2024 SovereignRE. Property of Eric Daniel Malley, Radest Publishing Co. All Rights Reserved.</TranslatableText>
            </footer>
        </div>
    );
};

export default App;
