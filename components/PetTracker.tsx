
import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { PetSensorData } from '../types';
import { Dog, Activity, Wifi, Bluetooth, Signal, MapPin, Lock, Zap } from './ui/Icons';

const PetTracker: React.FC = () => {
    const [status, setStatus] = useState<PetSensorData['status']>('Idle');
    const [connection, setConnection] = useState<PetSensorData['connectionType']>('WiFi');
    const [battery, setBattery] = useState(85);
    const [sensorData, setSensorData] = useState<PetSensorData>({
        timestamp: Date.now(),
        gps: { lat: 34.0522, lng: -118.2437, speed: 0 },
        accelerometer: { x: 0, y: 0, z: 0, tilt: 0 },
        battery: 85,
        connectionType: 'WiFi',
        status: 'Idle'
    });
    
    // Prismatic Refraction State
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [packets, setPackets] = useState<string[]>([]);
    
    // Event Log
    const [events, setEvents] = useState<{time: string, event: string}[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate Sensor Readings
            const speed = Math.random() * 5; // 0-5 mph
            const tilt = Math.random() * 90; // 0-90 degrees
            
            // Logic for "Squat" Detection: Stopped (Speed < 0.5) + Tilt > 45 degrees
            let newStatus: PetSensorData['status'] = 'Moving';
            if (speed < 0.5) {
                newStatus = tilt > 45 ? 'Digestion_Event' : 'Stopped';
            } else {
                newStatus = 'Moving';
            }

            // Connection Auto-Switching logic
            const signalStrength = Math.random();
            let conn: PetSensorData['connectionType'] = 'Cellular';
            if (signalStrength > 0.8) conn = 'BLE';
            else if (signalStrength > 0.4) conn = 'WiFi';

            const newData = {
                timestamp: Date.now(),
                gps: { lat: 34.0522 + (Math.random() - 0.5) * 0.001, lng: -118.2437 + (Math.random() - 0.5) * 0.001, speed },
                accelerometer: { x: Math.random(), y: Math.random(), z: Math.random(), tilt },
                battery: Math.max(0, battery - 0.01),
                connectionType: conn,
                status: newStatus
            };

            setSensorData(newData);
            setStatus(newStatus);
            setConnection(conn);
            setBattery(newData.battery);

            if (newStatus === 'Digestion_Event' && status !== 'Digestion_Event') {
                setEvents(prev => [{ time: new Date().toLocaleTimeString(), event: 'Digestion Event Detected (Accuracy: 94%)' }, ...prev]);
            }

            // Prismatic Data Stream Simulation
            if (isTransmitting) {
                const hex = Math.random().toString(16).substr(2, 6).toUpperCase();
                setPackets(prev => [hex, ...prev].slice(0, 8));
            }

        }, 2000);

        return () => clearInterval(interval);
    }, [status, battery, isTransmitting]);

    const toggleTransmission = () => setIsTransmitting(!isTransmitting);

    return (
        <Card className="animate-fade-in h-full">
            <Card.Header>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Dog className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Pet & IoT Monitor</Card.Title>
                            <Card.Description>Biometric Tracking & Prismatic Data Transmission</Card.Description>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            connection === 'BLE' ? 'bg-blue-500/20 text-blue-400' :
                            connection === 'WiFi' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {connection === 'BLE' && <Bluetooth className="w-3 h-3 inline mr-1" />}
                            {connection === 'WiFi' && <Wifi className="w-3 h-3 inline mr-1" />}
                            {connection === 'Cellular' && <Signal className="w-3 h-3 inline mr-1" />}
                            {connection}
                        </span>
                        <div className="flex items-center gap-1 bg-brand-primary px-2 py-1 rounded border border-brand-accent">
                            <div className={`w-2 h-2 rounded-full ${battery > 20 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-mono">{Math.floor(battery)}%</span>
                        </div>
                    </div>
                </div>
            </Card.Header>
            <Card.Content className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Panel: Sensor Fusion & Map */}
                <div className="space-y-4">
                    <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent relative overflow-hidden h-64 group">
                        {/* Fake Map Background */}
                        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=34.0522,-118.2437&zoom=15&size=600x300&style=feature:all|element:all|saturation:-100&sensor=false')] bg-cover opacity-50"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-4 h-4 bg-brand-blue rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-brand-primary text-xs px-2 py-1 rounded border border-brand-accent whitespace-nowrap">
                                    {status === 'Moving' ? `${sensorData.gps.speed.toFixed(1)} mph` : status}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-brand-primary p-3 rounded border border-brand-accent">
                            <p className="text-xs text-brand-light">Tilt / Orientation</p>
                            <p className="text-lg font-bold text-brand-highlight">{sensorData.accelerometer.tilt.toFixed(1)}°</p>
                            <div className="w-full bg-brand-secondary h-1 mt-1 rounded-full overflow-hidden">
                                <div className="bg-brand-yellow h-full transition-all duration-500" style={{width: `${(sensorData.accelerometer.tilt / 90) * 100}%`}}></div>
                            </div>
                        </div>
                        <div className="bg-brand-primary p-3 rounded border border-brand-accent">
                             <p className="text-xs text-brand-light">Activity State</p>
                             <p className={`text-lg font-bold ${
                                 status === 'Digestion_Event' ? 'text-red-500 animate-pulse' : 
                                 status === 'Moving' ? 'text-brand-green' : 'text-brand-light'
                             }`}>
                                 {status.replace('_', ' ')}
                             </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Prismatic Visualizer */}
                <div className="bg-brand-primary rounded-lg border border-brand-accent p-6 flex flex-col relative overflow-hidden">
                     <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2 z-10">
                        <Zap className="w-5 h-5 text-brand-yellow" /> Data Refraction Engine
                    </h3>
                    
                    {/* Visualizer Animation */}
                    <div className="flex-grow flex items-center justify-center relative min-h-[200px]">
                        {/* The "Prism" */}
                        <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-purple-500/30 backdrop-blur-md border border-white/20 transform rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                            <Lock className="w-6 h-6 text-white -rotate-45" />
                        </div>

                        {/* Incoming Beam */}
                        <div className={`absolute left-0 top-1/2 h-1 bg-white shadow-[0_0_10px_white] transition-all duration-300 origin-left ${isTransmitting ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}></div>

                        {/* Refracted Beams (Splitting Data) */}
                        {isTransmitting && (
                            <>
                                <div className="absolute right-10 top-1/4 w-1/3 h-[2px] bg-red-500 shadow-[0_0_8px_red] animate-pulse origin-left transform -rotate-12"></div>
                                <div className="absolute right-10 top-1/2 w-1/3 h-[2px] bg-green-500 shadow-[0_0_8px_green] animate-pulse origin-left"></div>
                                <div className="absolute right-10 bottom-1/4 w-1/3 h-[2px] bg-blue-500 shadow-[0_0_8px_blue] animate-pulse origin-left transform rotate-12"></div>
                            </>
                        )}
                    </div>

                    {/* Data Packets View */}
                    <div className="mt-4 bg-black/50 p-2 rounded font-mono text-xs text-brand-green h-24 overflow-hidden border border-brand-accent/50">
                        <p className="text-brand-light border-b border-brand-light/20 pb-1 mb-1">Encrypted Transmission Log:</p>
                        {packets.map((pkt, i) => (
                            <div key={i} className="flex justify-between animate-fade-in">
                                <span>PKT-{pkt}</span>
                                <span className="text-brand-blue">REFRACTED >> {['CELL','WIFI','BLE'][i%3]}</span>
                            </div>
                        ))}
                        {!isTransmitting && <span className="text-gray-500 italic">Transmission Idle...</span>}
                    </div>

                    <div className="mt-4 flex justify-between items-center z-10">
                         <div className="text-xs text-brand-light">
                             Efficiency: <span className="text-brand-green font-bold">99.9%</span>
                         </div>
                         <Button onClick={toggleTransmission} size="sm" variant={isTransmitting ? 'destructive' : 'primary'}>
                             {isTransmitting ? 'Halt Transmission' : 'Initiate Data Stream'}
                         </Button>
                    </div>
                </div>

            </Card.Content>
            <Card.Footer>
                <div className="w-full">
                    <h4 className="text-xs font-bold text-brand-light mb-2 uppercase">Recent Alerts</h4>
                    <div className="space-y-1">
                        {events.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No significant events recorded.</p>
                        ) : (
                            events.slice(0, 3).map((evt, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-brand-highlight bg-brand-secondary p-1 rounded">
                                    <Activity className="w-3 h-3 text-brand-yellow" />
                                    <span className="text-gray-400">{evt.time}</span>
                                    <span>{evt.event}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default PetTracker;
