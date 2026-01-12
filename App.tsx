
import React, { useState, useEffect } from 'react';
import { Listing, RealEstateStatus } from './types';
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
import { Home, Shield, Sun, FileText, Wrench } from './components/ui/Icons';

const mockListing: Listing = {
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
    const [activeStep, setActiveStep] = useState<RealEstateStatus>(RealEstateStatus.LISTING);
    const [showTerms, setShowTerms] = useState(false);
    const [showChat, setShowChat] = useState(false);

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
                return <DocumentVault listing={listing} onListingUpdate={handleListingUpdate} />;
            case RealEstateStatus.MAINTENANCE:
                return <MaintenancePortal listing={listing} onListingUpdate={handleListingUpdate} />;
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

            <header className="bg-brand-secondary/50 backdrop-blur-sm p-4 border-b border-brand-accent flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <Home className="w-8 h-8 text-brand-blue" />
                    <h1 className="text-2xl font-bold text-brand-highlight">Sovereign<span className="font-light text-brand-light">RE</span></h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-brand-light" />
                       <span>MLS ID: {listing.id}</span>
                    </div>
                     <button onClick={() => setShowChat(true)} className="flex items-center gap-2 hover:text-brand-blue transition-colors">
                        <Shield className="w-4 h-4 text-brand-light" />
                        <span>Closing War Room</span>
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-12 gap-6 p-6 flex-grow">
                <aside className="col-span-12 md:col-span-3 lg:col-span-2">
                    <WorkflowStepper activeStep={activeStep} setActiveStep={setActiveStep} />
                </aside>
                <section className="col-span-12 md:col-span-9 lg:col-span-7">
                    {renderActiveStepComponent()}
                </section>
                <aside className="col-span-12 lg:col-span-3">
                    <AiCopilot listing={listing} activeStep={activeStep} />
                </aside>
            </main>
            
            <footer className="text-center p-4 border-t border-brand-accent text-xs text-brand-light">
                &copy; 2024 SovereignRE. Property of Eric Daniel Malley, owner of Radest Publishing Co. All Rights Reserved.
            </footer>
        </div>
    );
};

export default App;
