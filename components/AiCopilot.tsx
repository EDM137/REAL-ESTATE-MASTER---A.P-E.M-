import React, { useState } from 'react';
import { Listing, RealEstateStatus } from '../types';
import { Card } from './ui/Card';
import { Bot, MessageSquare, Image, UploadCloud, Mic, Globe, Volume2, Languages, Sparkles } from './ui/Icons';
import ContextualAssistant from './ContextualAssistant';
import ChatBot from './ChatBot';
import ImageGenerator from './ImageGenerator';
import ImageAnalyzer from './ImageAnalyzer';
import AudioTranscriber from './AudioTranscriber';
import GroundedSearch from './GroundedSearch';
import TextToSpeech from './TextToSpeech';
import Translator from './Translator';


interface AiCopilotProps {
    listing: Listing;
    activeStep: RealEstateStatus;
}

type ToolName = 'Assistant' | 'Chat' | 'Image Gen' | 'Analyze Image' | 'Transcribe' | 'Search' | 'TTS' | 'Translate';

const tools: { name: ToolName; icon: React.ReactNode }[] = [
    { name: 'Assistant', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Image Gen', icon: <Image className="w-5 h-5" /> },
    { name: 'Analyze Image', icon: <UploadCloud className="w-5 h-5" /> },
    { name: 'Transcribe', icon: <Mic className="w-5 h-5" /> },
    { name: 'Search', icon: <Globe className="w-5 h-5" /> },
    { name: 'TTS', icon: <Volume2 className="w-5 h-5" /> },
    { name: 'Translate', icon: <Languages className="w-5 h-5" /> },
];


const AiCopilot: React.FC<AiCopilotProps> = ({ listing, activeStep }) => {
    const [activeTool, setActiveTool] = useState<ToolName>('Assistant');

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'Assistant':
                return <ContextualAssistant listing={listing} activeStep={activeStep} />;
            case 'Chat':
                return <ChatBot />;
            case 'Image Gen':
                return <ImageGenerator />;
            case 'Analyze Image':
                return <ImageAnalyzer />;
            case 'Transcribe':
                return <AudioTranscriber />;
            case 'Search':
                return <GroundedSearch />;
            case 'TTS':
                return <TextToSpeech />;
            case 'Translate':
                return <Translator />;
            default:
                return null;
        }
    };

    return (
        <Card className="sticky top-24">
            <Card.Header>
                 <div className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-brand-blue" />
                    <Card.Title>AI Copilot</Card.Title>
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                    {tools.map((tool) => (
                        <button
                            key={tool.name}
                            onClick={() => setActiveTool(tool.name)}
                            title={tool.name}
                            className={`flex-grow p-2 rounded-md flex items-center justify-center gap-2 transition-colors text-xs ${
                                activeTool === tool.name
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-brand-accent hover:bg-brand-light/20 text-brand-light'
                            }`}
                        >
                            {tool.icon}
                            <span className="hidden sm:inline">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </Card.Header>
            <div className="p-2 md:p-4 min-h-[300px]">
                {renderActiveTool()}
            </div>
        </Card>
    );
};

export default AiCopilot;