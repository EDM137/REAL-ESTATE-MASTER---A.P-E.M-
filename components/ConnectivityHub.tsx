
/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-04-19T08:57:27-07:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { 
    Network, 
    Wifi, 
    Smartphone, 
    Bluetooth, 
    Globe, 
    FileCode, 
    AppWindow, 
    Zap, 
    Shield, 
    Signal, 
    RefreshCw,
    ExternalLink,
    FolderOpen,
    Cpu
} from './ui/Icons';
import TranslatableText from './TranslatableText';

interface ConnectivityHubProps {
    appLanguage: string;
}

const ConnectivityHub: React.FC<ConnectivityHubProps> = ({ appLanguage }) => {
    const [connectionStatus, setConnectionStatus] = useState({
        wifi: true,
        cellular: false,
        bluetooth: true,
        hotspot: false
    });

    const [activeBridges, setActiveBridges] = useState({
        web: true,
        file: true,
        app: true
    });

    const [recentActivity, setRecentActivity] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setRecentActivity(prev => [msg, ...prev].slice(0, 10));
    };

    const toggleConnection = (type: keyof typeof connectionStatus) => {
        setConnectionStatus(prev => {
            const newVal = !prev[type];
            const name = String(type);
            addLog(`${name.charAt(0).toUpperCase() + name.slice(1)} ${newVal ? 'Connected' : 'Disconnected'}`);
            return { ...prev, [type]: newVal };
        });
    };

    const toggleBridge = (type: keyof typeof activeBridges) => {
        setActiveBridges(prev => {
            const newVal = !prev[type];
            const name = String(type);
            addLog(`${name.charAt(0).toUpperCase() + name.slice(1)} Bridge ${newVal ? 'Primed' : 'Purged'}`);
            return { ...prev, [type]: newVal };
        });
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-12">
            {/* IP WATERMARK */}
            <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none select-none text-[8px] font-mono text-brand-light uppercase tracking-tighter mix-blend-overlay">
                Sovereign Protocol Connectivity Layer • Eric Daniel Malley • Radest Publishing
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={`bg-brand-secondary border-brand-accent transition-all duration-500 ${connectionStatus.wifi ? 'border-brand-blue/50 ring-1 ring-brand-blue/20' : ''}`}>
                    <Card.Content className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wifi className={`w-8 h-8 ${connectionStatus.wifi ? 'text-brand-blue animate-pulse' : 'text-brand-light'}`} />
                            <div>
                                <h4 className="font-bold text-brand-highlight text-sm">Wi-Fi</h4>
                                <p className="text-[10px] text-brand-light uppercase tracking-wider font-bold">
                                    {connectionStatus.wifi ? 'Broadcasting' : 'Silent'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-16 text-[10px] uppercase font-bold tracking-widest transition-all ${connectionStatus.wifi ? 'bg-brand-blue/10 border-brand-blue' : ''}`}
                            onClick={() => toggleConnection('wifi')}
                        >
                            {connectionStatus.wifi ? 'Cut' : 'Boot'}
                        </Button>
                    </Card.Content>
                </Card>

                <Card className={`bg-brand-secondary border-brand-accent transition-all duration-500 ${connectionStatus.cellular ? 'border-brand-green/50 ring-1 ring-brand-green/20' : ''}`}>
                    <Card.Content className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Signal className={`w-8 h-8 ${connectionStatus.cellular ? 'text-brand-green animate-pulse' : 'text-brand-light'}`} />
                            <div>
                                <h4 className="font-bold text-brand-highlight text-sm">Cellular</h4>
                                <p className="text-[10px] text-brand-light uppercase tracking-wider font-bold">
                                    {connectionStatus.cellular ? 'Hub Active' : 'Standby'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-16 text-[10px] uppercase font-bold tracking-widest transition-all ${connectionStatus.cellular ? 'bg-brand-green/10 border-brand-green' : ''}`}
                            onClick={() => toggleConnection('cellular')}
                        >
                            {connectionStatus.cellular ? 'Cut' : 'Boot'}
                        </Button>
                    </Card.Content>
                </Card>

                <Card className={`bg-brand-secondary border-brand-accent transition-all duration-500 ${connectionStatus.bluetooth ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : ''}`}>
                    <Card.Content className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bluetooth className={`w-8 h-8 ${connectionStatus.bluetooth ? 'text-cyan-500 animate-pulse' : 'text-brand-light'}`} />
                            <div>
                                <h4 className="font-bold text-brand-highlight text-sm">Bluetooth</h4>
                                <p className="text-[10px] text-brand-light uppercase tracking-wider font-bold">
                                    {connectionStatus.bluetooth ? 'Paired' : 'Scanning'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-16 text-[10px] uppercase font-bold tracking-widest transition-all ${connectionStatus.bluetooth ? 'bg-cyan-500/10 border-cyan-500' : ''}`}
                            onClick={() => toggleConnection('bluetooth')}
                        >
                            {connectionStatus.bluetooth ? 'Cut' : 'Boot'}
                        </Button>
                    </Card.Content>
                </Card>

                <Card className={`bg-brand-secondary border-brand-accent transition-all duration-500 ${connectionStatus.hotspot ? 'border-brand-yellow/50 ring-1 ring-brand-yellow/20' : ''}`}>
                    <Card.Content className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className={`w-8 h-8 ${connectionStatus.hotspot ? 'text-brand-yellow animate-pulse' : 'text-brand-light'}`} />
                            <div>
                                <h4 className="font-bold text-brand-highlight text-sm">Hotspot</h4>
                                <p className="text-[10px] text-brand-light uppercase tracking-wider font-bold">
                                    {connectionStatus.hotspot ? 'Sovereign Hub' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-8 w-16 text-[10px] uppercase font-bold tracking-widest transition-all ${connectionStatus.hotspot ? 'bg-brand-yellow/10 border-brand-yellow' : ''}`}
                            onClick={() => toggleConnection('hotspot')}
                        >
                            {connectionStatus.hotspot ? 'Cut' : 'Boot'}
                        </Button>
                    </Card.Content>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-brand-secondary border-brand-accent overflow-hidden">
                        <Card.Header className="border-b border-brand-accent bg-brand-primary/20">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Network className="w-5 h-5 text-brand-blue" />
                                    <Card.Title className="text-sm tracking-tight">
                                        <TranslatableText targetLanguage={appLanguage}>Sovereign Protocol Bridges</TranslatableText>
                                    </Card.Title>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                                    <span className="text-[10px] text-brand-light uppercase font-bold tracking-widest">Enclave Secured</span>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Content className="p-0">
                            <div className="divide-y divide-brand-accent">
                                {/* Web Bridge */}
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${activeBridges.web ? 'bg-brand-blue/20 ring-1 ring-brand-blue/30' : 'bg-brand-accent/20'}`}>
                                            <Globe className={`w-6 h-6 ${activeBridges.web ? 'text-brand-blue' : 'text-brand-light'}`} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-brand-highlight tracking-tight">Web Bridge</h5>
                                            <p className="text-xs text-brand-light">Direct connection to external MLS sites and real estate portals.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
                                            onClick={() => toggleBridge('web')}
                                        >
                                            {activeBridges.web ? <><Shield className="w-3 h-3 text-brand-green" /> Primed</> : 'Purged'}
                                        </Button>
                                        <Button size="icon" variant="outline" className="w-8 h-8">
                                            <ExternalLink className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* File Bridge */}
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${activeBridges.file ? 'bg-brand-green/20 ring-1 ring-brand-green/30' : 'bg-brand-accent/20'}`}>
                                            <FolderOpen className={`w-6 h-6 ${activeBridges.file ? 'text-brand-green' : 'text-brand-light'}`} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-brand-highlight tracking-tight">File Bridge</h5>
                                            <p className="text-xs text-brand-light">Sync with local storage, DropBox, and Enterprise file systems.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
                                            onClick={() => toggleBridge('file')}
                                        >
                                            {activeBridges.file ? <><Shield className="w-3 h-3 text-brand-green" /> Primed</> : 'Purged'}
                                        </Button>
                                        <Button size="icon" variant="outline" className="w-8 h-8">
                                            <FolderOpen className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Application Bridge */}
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${activeBridges.app ? 'bg-brand-yellow/20 ring-1 ring-brand-yellow/30' : 'bg-brand-accent/20'}`}>
                                            <AppWindow className={`w-6 h-6 ${activeBridges.app ? 'text-brand-yellow' : 'text-brand-light'}`} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-brand-highlight tracking-tight">Application Bridge</h5>
                                            <p className="text-xs text-brand-light">Deep integration with Docusign, Zoho, and CRM suites.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
                                            onClick={() => toggleBridge('app')}
                                        >
                                            {activeBridges.app ? <><Shield className="w-3 h-3 text-brand-green" /> Primed</> : 'Purged'}
                                        </Button>
                                        <Button size="icon" variant="outline" className="w-8 h-8">
                                            <AppWindow className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-brand-secondary border-brand-accent h-fit">
                        <Card.Header>
                            <Card.Title className="text-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-brand-blue" />
                                <TranslatableText targetLanguage={appLanguage}>Bridge Heartbeat</TranslatableText>
                            </Card.Title>
                        </Card.Header>
                        <Card.Content className="p-4 space-y-4">
                            <div className="bg-brand-primary p-3 rounded-lg border border-brand-accent h-[300px] overflow-y-auto space-y-2 font-mono text-[10px]">
                                {recentActivity.length === 0 ? (
                                    <p className="text-brand-light opacity-50 italic">Listening for activity...</p>
                                ) : (
                                    recentActivity.map((log, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-brand-blue">[{new Date().toLocaleTimeString()}]</span>
                                            <span className="text-brand-highlight">{log}</span>
                                        </div>
                                    ))
                                ) }
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="bg-brand-secondary border-brand-accent bg-gradient-to-br from-brand-secondary to-brand-blue/5 overflow-hidden">
                        <Card.Content className="p-6 flex flex-col items-center text-center">
                            <Cpu className="w-12 h-12 text-brand-blue mb-4 animate-slow-spin" />
                            <h4 className="font-bold text-brand-highlight mb-2">Cellular Hub Spot</h4>
                            <p className="text-xs text-brand-light mb-4">
                                Orchestrate all device connectivity through a single, secure SovereignRE access point.
                            </p>
                            <Button 
                                className="w-full bg-brand-blue hover:bg-brand-blue/80 font-bold uppercase tracking-widest text-[10px]"
                                onClick={() => {
                                    addLog("Application Bridge: Real-time sync executed");
                                    addLog("File Bridge: Workspace assets synchronized");
                                    addLog("Website Bridge: Live MLS data stream verified");
                                }}
                            >
                                Force Global Sync
                            </Button>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ConnectivityHub;
