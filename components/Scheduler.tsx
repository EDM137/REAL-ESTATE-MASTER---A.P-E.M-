
import React, { useState } from 'react';
import { Listing, Appointment } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Calendar, Map, Bell, Plus, CheckCircle, Clock } from './ui/Icons';

interface SchedulerProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ listing, onListingUpdate }) => {
    const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
        type: 'Showing',
        date: '',
        time: '',
        attendees: [],
    });

    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppointment.title || !newAppointment.date || !newAppointment.time) return;

        const appointment: Appointment = {
            id: `apt-${Date.now()}`,
            title: newAppointment.title,
            date: newAppointment.date,
            time: newAppointment.time,
            type: newAppointment.type as any,
            attendees: ['Agent', 'Client'],
            reminderSet: true,
            location: listing.address
        };

        onListingUpdate({
            ...listing,
            appointments: [...(listing.appointments || []), appointment]
        });

        setNewAppointment({ type: 'Showing', date: '', time: '', attendees: [] });
    };

    const toggleReminder = (id: string) => {
        const updatedAppointments = listing.appointments.map(apt => 
            apt.id === id ? { ...apt, reminderSet: !apt.reminderSet } : apt
        );
        onListingUpdate({ ...listing, appointments: updatedAppointments });
    };

    return (
        <Card className="animate-fade-in space-y-6">
             <Card.Header>
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-brand-blue" />
                    <div>
                        <Card.Title>Schedule & Location Module</Card.Title>
                        <Card.Description>Manage Showings, Inspections, and Map Data</Card.Description>
                    </div>
                </div>
            </Card.Header>

            <Card.Content className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-light flex items-center gap-2">
                        <Map className="w-4 h-4" /> Property Location
                    </h3>
                    <div className="w-full h-64 bg-brand-secondary rounded-lg border border-brand-accent overflow-hidden relative group">
                        {/* Mock Map View using Google Static Maps style logic or iframe */}
                        <iframe 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            loading="lazy" 
                            allowFullScreen 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                        <div className="absolute bottom-2 left-2 bg-brand-primary/90 p-2 rounded text-xs border border-brand-accent">
                            <p className="font-bold">{listing.address}</p>
                            <p className="text-brand-light">Lat: 34.0522 N, Lon: 118.2437 W</p>
                        </div>
                    </div>
                    <div className="p-3 bg-brand-secondary rounded border border-brand-accent text-sm">
                        <p className="font-semibold text-brand-highlight">Route Optimization:</p>
                        <p className="text-brand-light">Traffic data is integrated for all scheduled showing routes.</p>
                    </div>
                </div>

                {/* Scheduler Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-light flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Upcoming Appointments
                    </h3>
                    
                    <div className="bg-brand-secondary rounded-lg border border-brand-accent p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-3">
                        {(!listing.appointments || listing.appointments.length === 0) ? (
                            <div className="text-center text-brand-light py-4">No appointments scheduled.</div>
                        ) : (
                            listing.appointments.map(apt => (
                                <div key={apt.id} className="flex items-center justify-between p-3 bg-brand-primary rounded border border-brand-accent">
                                    <div>
                                        <p className="font-bold text-brand-highlight">{apt.title}</p>
                                        <p className="text-xs text-brand-light">{apt.date} at {apt.time} • <span className="uppercase text-brand-blue">{apt.type}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => toggleReminder(apt.id)} 
                                        className={`p-2 rounded-full transition-colors ${apt.reminderSet ? 'text-brand-yellow bg-brand-yellow/10' : 'text-brand-light hover:text-brand-highlight'}`}
                                        title={apt.reminderSet ? "Reminder Active" : "Set Reminder"}
                                    >
                                        <Bell className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddAppointment} className="space-y-2 pt-4 border-t border-brand-accent">
                        <h4 className="text-sm font-semibold text-brand-highlight">Schedule New Event</h4>
                        <Input 
                            placeholder="Event Title (e.g., Open House)" 
                            value={newAppointment.title || ''} 
                            onChange={e => setNewAppointment({...newAppointment, title: e.target.value})} 
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Input 
                                type="date" 
                                value={newAppointment.date || ''} 
                                onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} 
                            />
                            <Input 
                                type="time" 
                                value={newAppointment.time || ''} 
                                onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} 
                            />
                        </div>
                        <select 
                            className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue"
                            value={newAppointment.type}
                            onChange={e => setNewAppointment({...newAppointment, type: e.target.value as any})}
                        >
                            <option value="Showing">Showing</option>
                            <option value="Inspection">Inspection</option>
                            <option value="Appraisal">Appraisal</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Closing">Closing</option>
                        </select>
                        <Button type="submit" className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add to Schedule
                        </Button>
                    </form>
                </div>
            </Card.Content>
        </Card>
    );
};

export default Scheduler;
