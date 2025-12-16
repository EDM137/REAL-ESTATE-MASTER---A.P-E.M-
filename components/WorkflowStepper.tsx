
import React from 'react';
import { RealEstateStatus } from '../types';
import { Card } from './ui/Card';
import { CheckCircle, Circle, Home, Building, Gavel, Banknote, FileSignature, Handshake, Check, Calendar, Globe, Briefcase, Film, PenTool, Dog } from './ui/Icons';
import AdBanner from './AdBanner';

interface WorkflowStepperProps {
    activeStep: RealEstateStatus;
    setActiveStep: (step: RealEstateStatus) => void;
}

const steps = [
    { name: RealEstateStatus.LISTING, icon: <Home className="w-5 h-5" /> },
    { name: RealEstateStatus.ROOM_SPECS, icon: <Building className="w-5 h-5" /> },
    { name: RealEstateStatus.VIRTUAL_TOUR, icon: <Film className="w-5 h-5" /> },
    { name: RealEstateStatus.PLOT_PLAN, icon: <PenTool className="w-5 h-5" /> },
    { name: RealEstateStatus.SCHEDULE, icon: <Calendar className="w-5 h-5" /> },
    { name: RealEstateStatus.SYNDICATION, icon: <Globe className="w-5 h-5" /> },
    { name: RealEstateStatus.OFFERS, icon: <Gavel className="w-5 h-5" /> },
    { name: RealEstateStatus.BANKER, icon: <Briefcase className="w-5 h-5" /> },
    { name: RealEstateStatus.ESCROW, icon: <Banknote className="w-5 h-5" /> },
    { name: RealEstateStatus.DOCUMENTS, icon: <FileSignature className="w-5 h-5" /> },
    { name: RealEstateStatus.LIFECYCLE, icon: <Handshake className="w-5 h-5" /> },
    { name: RealEstateStatus.PET_TRACKER, icon: <Dog className="w-5 h-5" /> },
    { name: RealEstateStatus.CLOSED, icon: <Check className="w-5 h-5" /> },
];

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ activeStep, setActiveStep }) => {
    const activeIndex = steps.findIndex(step => step.name === activeStep);

    return (
        <Card className="flex flex-col h-full">
            <Card.Header>
                <Card.Title>Lifecycle</Card.Title>
            </Card.Header>
            <Card.Content className="flex-grow">
                <nav>
                    <ul className="space-y-2">
                        {steps.map((step, index) => {
                            const isCompleted = index < activeIndex;
                            const isActive = index === activeIndex;

                            return (
                                <li key={step.name}>
                                    <button
                                        onClick={() => setActiveStep(step.name)}
                                        className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
                                            isActive ? 'bg-brand-blue text-white' : 'hover:bg-brand-accent'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-brand-green" />
                                        ) : isActive ? (
                                            <div className="w-5 h-5 animate-pulse">{step.icon}</div>
                                        ) : (
                                            <Circle className="w-5 h-5 text-brand-light" />
                                        )}
                                        <span className={`font-medium ${isActive ? 'text-white' : 'text-brand-highlight'}`}>
                                            {step.name}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </Card.Content>
            <div className="p-4 mt-auto">
                 <AdBanner />
            </div>
        </Card>
    );
};

export default WorkflowStepper;
