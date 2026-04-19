
/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-04-19T08:57:27-07:00
 * IP PROTECTION ENABLED
 */

import React, { useState } from 'react';
import { Listing, PropertyComplex, Unit, Tenant, Transaction, MaintenanceJob } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Building, Users, Wrench, CreditCard, MessageSquare, Shield, Plus, Trash2, CheckCircle, Clock, DollarSign, Globe } from './ui/Icons';
import TranslatableText from './TranslatableText';

interface PropertyManagementProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
    appLanguage: string;
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({ listing, onListingUpdate, appLanguage }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'units' | 'tenants' | 'maintenance' | 'payments' | 'comms'>('dashboard');

    // Initialize property complex if it doesn't exist
    const complex: PropertyComplex = listing.propertyComplex || {
        id: 'complex-1',
        name: 'Sovereign Heights Apartments',
        address: listing.address,
        units: [
            { id: 'u1', unitNumber: '101', type: '1BR', status: 'Occupied', rentAmount: 1500, tenantId: 't1' },
            { id: 'u2', unitNumber: '102', type: '2BR', status: 'Vacant', rentAmount: 2200 },
            { id: 'u3', unitNumber: '201', type: 'Studio', status: 'Occupied', rentAmount: 1200, tenantId: 't2' },
            { id: 'u4', unitNumber: '202', type: 'Penthouse', status: 'Maintenance', rentAmount: 4500 },
        ],
        tenants: [
            { 
                id: 't1', 
                name: 'John Smith', 
                email: 'john@example.com', 
                phone: '555-0101', 
                unitNumber: '101', 
                leaseStart: '2024-01-01', 
                leaseEnd: '2024-12-31', 
                rentAmount: 1500, 
                depositAmount: 1500, 
                paymentStatus: 'Paid',
                documents: []
            },
            { 
                id: 't2', 
                name: 'Sarah Johnson', 
                email: 'sarah@example.com', 
                phone: '555-0202', 
                unitNumber: '201', 
                leaseStart: '2024-03-01', 
                leaseEnd: '2025-02-28', 
                rentAmount: 1200, 
                depositAmount: 1200, 
                paymentStatus: 'Late',
                documents: []
            },
        ],
        maintenanceJobs: [],
        totalRevenue: 45000,
        occupancyRate: 75
    };

    const transactions: Transaction[] = listing.transactions || [
        { id: 'tx1', amount: 1500, type: 'Rent', status: 'Completed', timestamp: '2024-08-01', from: 'John Smith', to: 'SovereignRE', description: 'August Rent - Unit 101' },
        { id: 'tx2', amount: 1200, type: 'Rent', status: 'Pending', timestamp: '2024-08-05', from: 'Sarah Johnson', to: 'SovereignRE', description: 'August Rent - Unit 201' },
    ];

    const updateComplex = (updatedComplex: PropertyComplex) => {
        onListingUpdate({ ...listing, propertyComplex: updatedComplex });
    };

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Content className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/20 rounded-full">
                        <Building className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-light uppercase font-bold tracking-widest">
                            <TranslatableText targetLanguage={appLanguage}>Total Units</TranslatableText>
                        </p>
                        <h3 className="text-2xl font-bold text-brand-highlight">{complex.units.length}</h3>
                    </div>
                </Card.Content>
            </Card>
            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Content className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-brand-green/20 rounded-full">
                        <Users className="w-6 h-6 text-brand-green" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-light uppercase font-bold tracking-widest">
                            <TranslatableText targetLanguage={appLanguage}>Occupancy</TranslatableText>
                        </p>
                        <h3 className="text-2xl font-bold text-brand-highlight">{complex.occupancyRate}%</h3>
                    </div>
                </Card.Content>
            </Card>
            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Content className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-brand-yellow/20 rounded-full">
                        <DollarSign className="w-6 h-6 text-brand-yellow" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-light uppercase font-bold tracking-widest">
                            <TranslatableText targetLanguage={appLanguage}>Revenue (MTD)</TranslatableText>
                        </p>
                        <h3 className="text-2xl font-bold text-brand-highlight">${complex.totalRevenue.toLocaleString()}</h3>
                    </div>
                </Card.Content>
            </Card>
            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Content className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                        <Wrench className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-brand-light uppercase font-bold tracking-widest">
                            <TranslatableText targetLanguage={appLanguage}>Open Tickets</TranslatableText>
                        </p>
                        <h3 className="text-2xl font-bold text-brand-highlight">{complex.maintenanceJobs.filter(j => j.status !== 'Completed').length}</h3>
                    </div>
                </Card.Content>
            </Card>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Card className="bg-brand-secondary border-brand-accent h-full">
                    <Card.Header>
                        <Card.Title>
                            <TranslatableText targetLanguage={appLanguage}>Recent Activity</TranslatableText>
                        </Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex justify-between items-center p-3 bg-brand-primary rounded border border-brand-accent">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.status === 'Completed' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-yellow/20 text-brand-yellow'}`}>
                                            {tx.status === 'Completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-brand-highlight">{tx.description}</p>
                                            <p className="text-xs text-brand-light">{tx.timestamp} • {tx.from}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${tx.type === 'Rent' ? 'text-brand-green' : 'text-red-500'}`}>
                                        {tx.type === 'Rent' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card.Content>
                </Card>
            </div>

            <div className="col-span-1 lg:col-span-1">
                <Card className="bg-brand-secondary border-brand-accent h-full">
                    <Card.Header>
                        <Card.Title>
                            <TranslatableText targetLanguage={appLanguage}>Quick Actions</TranslatableText>
                        </Card.Title>
                    </Card.Header>
                    <Card.Content className="space-y-2">
                        <Button className="w-full justify-start" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            <TranslatableText targetLanguage={appLanguage}>Add New Unit</TranslatableText>
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            <TranslatableText targetLanguage={appLanguage}>Onboard Tenant</TranslatableText>
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <Wrench className="w-4 h-4 mr-2" />
                            <TranslatableText targetLanguage={appLanguage}>Create Work Order</TranslatableText>
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <CreditCard className="w-4 h-4 mr-2" />
                            <TranslatableText targetLanguage={appLanguage}>Process Payment</TranslatableText>
                        </Button>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );

    const renderUnits = () => (
        <Card className="bg-brand-secondary border-brand-accent animate-fade-in">
            <Card.Header className="flex justify-between items-center">
                <Card.Title>
                    <TranslatableText targetLanguage={appLanguage}>Unit Inventory</TranslatableText>
                </Card.Title>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    <TranslatableText targetLanguage={appLanguage}>Add Unit</TranslatableText>
                </Button>
            </Card.Header>
            <Card.Content>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-brand-accent text-brand-light text-xs uppercase tracking-widest">
                                <th className="pb-3 font-bold">Unit</th>
                                <th className="pb-3 font-bold">Type</th>
                                <th className="pb-3 font-bold">Status</th>
                                <th className="pb-3 font-bold">Rent</th>
                                <th className="pb-3 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-accent">
                            {complex.units.map(unit => (
                                <tr key={unit.id} className="text-sm">
                                    <td className="py-4 font-bold text-brand-highlight">{unit.unitNumber}</td>
                                    <td className="py-4 text-brand-light">{unit.type}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            unit.status === 'Occupied' ? 'bg-brand-green/20 text-brand-green' :
                                            unit.status === 'Vacant' ? 'bg-brand-blue/20 text-brand-blue' :
                                            'bg-brand-yellow/20 text-brand-yellow'
                                        }`}>
                                            {unit.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-brand-highlight font-mono">${unit.rentAmount.toLocaleString()}</td>
                                    <td className="py-4">
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline" className="h-8 w-8"><MessageSquare className="w-3 h-3" /></Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8"><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card.Content>
        </Card>
    );

    const renderTenants = () => (
        <Card className="bg-brand-secondary border-brand-accent animate-fade-in">
            <Card.Header className="flex justify-between items-center">
                <Card.Title>
                    <TranslatableText targetLanguage={appLanguage}>Tenant Directory</TranslatableText>
                </Card.Title>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    <TranslatableText targetLanguage={appLanguage}>New Tenant</TranslatableText>
                </Button>
            </Card.Header>
            <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complex.tenants.map(tenant => (
                        <div key={tenant.id} className="p-4 bg-brand-primary rounded-lg border border-brand-accent flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-bold">
                                    {tenant.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-highlight">{tenant.name}</h4>
                                    <p className="text-xs text-brand-light">Unit {tenant.unitNumber} • {tenant.phone}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tenant.paymentStatus === 'Paid' ? 'bg-brand-green/20 text-brand-green' : 'bg-red-500/20 text-red-500'}`}>
                                            {tenant.paymentStatus}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-accent text-brand-light">
                                            Lease: {tenant.leaseEnd}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" variant="outline">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    <TranslatableText targetLanguage={appLanguage}>Message</TranslatableText>
                                </Button>
                                <Button size="sm" variant="outline">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    <TranslatableText targetLanguage={appLanguage}>Ledger</TranslatableText>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card.Content>
        </Card>
    );

    const renderPayments = () => (
        <div className="space-y-6 animate-fade-in">
            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Header>
                    <Card.Title className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-green" />
                        <TranslatableText targetLanguage={appLanguage}>Secure Payment Processing</TranslatableText>
                    </Card.Title>
                    <Card.Description>
                        <TranslatableText targetLanguage={appLanguage}>Encrypted, PCI-compliant gateway for rent, deposits, and contractor disbursements.</TranslatableText>
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-brand-primary rounded-xl border border-brand-accent text-center">
                            <DollarSign className="w-10 h-10 text-brand-green mx-auto mb-4" />
                            <h4 className="font-bold text-brand-highlight mb-2">
                                <TranslatableText targetLanguage={appLanguage}>Collect Rent</TranslatableText>
                            </h4>
                            <p className="text-xs text-brand-light mb-4">
                                <TranslatableText targetLanguage={appLanguage}>Automated monthly invoicing and collection from tenants.</TranslatableText>
                            </p>
                            <Button className="w-full">
                                <TranslatableText targetLanguage={appLanguage}>Setup Auto-Pay</TranslatableText>
                            </Button>
                        </div>
                        <div className="p-6 bg-brand-primary rounded-xl border border-brand-accent text-center">
                            <Wrench className="w-10 h-10 text-brand-blue mx-auto mb-4" />
                            <h4 className="font-bold text-brand-highlight mb-2">
                                <TranslatableText targetLanguage={appLanguage}>Pay Contractors</TranslatableText>
                            </h4>
                            <p className="text-xs text-brand-light mb-4">
                                <TranslatableText targetLanguage={appLanguage}>Securely disburse funds to verified maintenance professionals.</TranslatableText>
                            </p>
                            <Button className="w-full" variant="outline">
                                <TranslatableText targetLanguage={appLanguage}>Disburse Funds</TranslatableText>
                            </Button>
                        </div>
                        <div className="p-6 bg-brand-primary rounded-xl border border-brand-accent text-center">
                            <Shield className="w-10 h-10 text-brand-yellow mx-auto mb-4" />
                            <h4 className="font-bold text-brand-highlight mb-2">
                                <TranslatableText targetLanguage={appLanguage}>Security Deposits</TranslatableText>
                            </h4>
                            <p className="text-xs text-brand-light mb-4">
                                <TranslatableText targetLanguage={appLanguage}>Escrow-protected holding for tenant security deposits.</TranslatableText>
                            </p>
                            <Button className="w-full" variant="outline">
                                <TranslatableText targetLanguage={appLanguage}>Manage Escrow</TranslatableText>
                            </Button>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Header>
                    <Card.Title>
                        <TranslatableText targetLanguage={appLanguage}>Transaction History</TranslatableText>
                    </Card.Title>
                </Card.Header>
                <Card.Content>
                    <div className="space-y-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className="p-3 bg-brand-primary rounded border border-brand-accent flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <div className="text-xs font-mono text-brand-light">{tx.timestamp}</div>
                                    <div>
                                        <p className="text-sm font-bold text-brand-highlight">{tx.description}</p>
                                        <p className="text-[10px] text-brand-light">ID: {tx.id} • From: {tx.from}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.status === 'Completed' ? 'text-brand-green' : 'text-brand-yellow'}`}>
                                        ${tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold tracking-tighter">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card.Content>
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 relative">
            {/* IP WATERMARK */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none select-none text-[10px] font-mono text-brand-light z-50">
                PROPERTY OF ERIC DANIEL MALLEY • RADEST PUBLISHING CO • {new Date().toISOString()}
            </div>

            <Card className="bg-brand-secondary border-brand-accent">
                <Card.Header>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Building className="w-8 h-8 text-brand-blue" />
                            <div>
                                <Card.Title>
                                    <TranslatableText targetLanguage={appLanguage}>Sovereign Property Management</TranslatableText>
                                </Card.Title>
                                <Card.Description>
                                    <TranslatableText targetLanguage={appLanguage}>Enterprise-grade management for Multifamily & Apartment Complexes.</TranslatableText>
                                </Card.Description>
                            </div>
                        </div>
                        <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'dashboard' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-brand-highlight'}`}>
                                <TranslatableText targetLanguage={appLanguage}>Dashboard</TranslatableText>
                            </button>
                            <button onClick={() => setActiveTab('units')} className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'units' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-brand-highlight'}`}>
                                <TranslatableText targetLanguage={appLanguage}>Units</TranslatableText>
                            </button>
                            <button onClick={() => setActiveTab('tenants')} className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'tenants' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-brand-highlight'}`}>
                                <TranslatableText targetLanguage={appLanguage}>Tenants</TranslatableText>
                            </button>
                            <button onClick={() => setActiveTab('payments')} className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${activeTab === 'payments' ? 'bg-brand-blue text-white' : 'text-brand-light hover:text-brand-highlight'}`}>
                                <TranslatableText targetLanguage={appLanguage}>Payments</TranslatableText>
                            </button>
                        </div>
                    </div>
                </Card.Header>
            </Card>

            <div className="mt-6">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'units' && renderUnits()}
                {activeTab === 'tenants' && renderTenants()}
                {activeTab === 'payments' && renderPayments()}
            </div>

            {/* DUAL LANGUAGE FOOTER FOR COMPONENT */}
            <div className="mt-8 pt-4 border-t border-brand-accent flex justify-between items-center text-[10px] text-brand-light italic">
                <div>
                    English: All data encrypted and secured via SovereignRE Protocol.
                </div>
                {appLanguage !== 'English' && (
                    <div>
                        <TranslatableText targetLanguage={appLanguage}>All data encrypted and secured via SovereignRE Protocol.</TranslatableText>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyManagement;
