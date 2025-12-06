
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
    roomSpecs: [
        { id: 'room1', roomName: 'Living Room', ceilingHeight: 10, windowCount: 4, sunlightExposure: 'High', orientation: 'South', materials: 'Hardwood floors, plaster walls', notes: 'Features a large fireplace and built-in shelving.', photos: [] },
        { id: 'room2', roomName: 'Kitchen', ceilingHeight: 9, windowCount: 2, sunlightExposure: 'Medium', orientation: 'West', materials: 'Quartz countertops, stainless steel appliances', notes: 'Newly renovated in 2023. Gas range.', photos: [] },
    ],
    offers: [
        { 
            id: 'offer1', 
            buyerName: 'John Smith', 
            agentName: 'Agent Alice', 
            amount: 740000, 
            contingencies: ['Inspection', 'Financing'], 
            status: 'Pending',
            receivedAt: '2024-08-01T10:00:00',
            terms: 'Requesting repairs to roof if needed.',
            history: [{ action: 'Received', amount: 740000, date: '2024-08-01T10:00:00' }],
            financingType: 'Conventional',
            closingDays: 30,
            downPayment: 148000 // 20%
        },
        { 
            id: 'offer2', 
            buyerName: 'Emily White', 
            agentName: 'Agent Bob', 
            amount: 735000, 
            contingencies: ['Inspection'], 
            status: 'Pending',
            receivedAt: '2024-08-02T14:30:00',
            terms: 'Quick close. Proof of funds attached.',
            history: [{ action: 'Received', amount: 735000, date: '2024-08-02T14:30:00' }],
            financingType: 'Cash',
            closingDays: 14,
            downPayment: 735000 // 100%
        },
        { 
            id: 'offer3', 
            buyerName: 'InvestCorp LLC', 
            agentName: 'Agent Charlie', 
            amount: 720000, 
            contingencies: [], 
            status: 'Rejected',
            receivedAt: '2024-07-30T09:15:00',
            terms: 'As-is. No questions asked.',
            history: [{ action: 'Received', amount: 720000, date: '2024-07-30T09:15:00' }, { action: 'Rejected', amount: 720000, date: '2024-07-31T10:00:00' }],
            financingType: 'Cash',
            closingDays: 7,
            downPayment: 720000
        },
        { 
            id: 'offer4', 
            buyerName: 'The Johnson Family', 
            agentName: 'Agent David', 
            amount: 760000, 
            contingencies: ['Inspection', 'Financing', 'Sale of Home'], 
            status: 'Pending',
            receivedAt: '2024-08-03T11:00:00',
            terms: 'We love the house! Contingent on selling our current home.',
            history: [{ action: 'Received', amount: 760000, date: '2024-08-03T11:00:00' }],
            financingType: 'FHA',
            closingDays: 45,
            downPayment: 26600 // 3.5%
        },
    ],
    escrowMilestones: [],
    documents: [],
    communications: [
        { agentType: "Buyer's Agent", message: 'My client is very interested. Is the closing date flexible?', timestamp: '2024-08-01 11:30 AM' },
        { agentType: "Listing Agent", message: 'The seller would prefer the listed date but has some room to negotiate for a strong offer.', timestamp: '2024-08-01 11:35 AM' },
    ],
    appointments: [],
    closingChecklist: [
        { id: 'cl1', label: 'Final Walkthrough Completed & Approved', completed: false, approvedBy: [] },
        { id: 'cl2', label: 'Keys, Remotes & Security Codes Handover', completed: false, approvedBy: [] },
        { id: 'cl3', label: 'All Requested Repairs Verified by Inspector', completed: false, approvedBy: [] },
        { id: 'cl4', label: 'Title Clear & Insurance Bound', completed: false, approvedBy: [] },
        { id: 'cl5', label: 'Final Funds Transferred to Escrow', completed: false, approvedBy: [] },
        { id: 'cl6', label: 'Utility Transfer Scheduled', completed: false, approvedBy: [] },
        { id: 'cl7', label: 'Clean-out & Debris Removal Confirmed', completed: false, approvedBy: [] },
    ],
    leads: []
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
        
        // Load draft if available
        const draft = localStorage.getItem('listingDraft');
        if (draft) {
             try {
                 const parsed = JSON.parse(draft);
                 setListing(parsed);
                 console.log("Draft loaded from local storage.");
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
            case RealEstateStatus.LIFECYCLE:
                return <LifecycleManager listing={listing} />;
            case RealEstateStatus.CLOSED:
                return <ClosingDashboard listing={listing} />;
            default:
                return (
                    <div className="bg-brand-secondary p-8 rounded-lg animate-fade-in flex flex-col items-center justify-center h-full text-center">
                        <div className="p-4 bg-brand-accent rounded-full mb-4">
                            <Wrench className="w-12 h-12 text-brand-highlight" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Module In Development</h2>
                        <p className="text-brand-light">The component for '{activeStep}' is coming soon.</p>
                        <p className="mt-4 text-sm">Please select another step from the workflow menu.</p>
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
                     <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-brand-light" />
                        <span>Light Mode</span>
                    </div>
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
                &copy; 2024 SovereignRE Command Center by Eric Daniel Malley & Radest Publishing Co. All Rights Reserved.
            </footer>
        </div>
    );
};

export default App;
