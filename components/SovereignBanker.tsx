
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Listing, Lead } from '../types';
import { Briefcase, Activity, Radio, Fingerprint, Shield, Lock, CheckCircle, Users, FileSpreadsheet, UploadCloud, Database, Download, Play, Calculator } from './ui/Icons';
import { runValuation, issueReceipt, CLAUSES } from '../utils/sovereign';

interface SovereignBankerProps {
    listing: Listing;
    onConvertLead?: (lead: Lead) => void;
}

const SovereignBanker: React.FC<SovereignBankerProps> = ({ listing, onConvertLead }) => {
    const [activeTab, setActiveTab] = useState<'banker' | 'leads' | 'calculator'>('banker');

    // Valuation State
    const [valInput, setValInput] = useState({
        comps: [700000, 750000, 800000],
        capRate: 0.055,
        noi: 55000,
        vacancy: 0.06
    });
    const [valuationResult, setValuationResult] = useState<any>(null);

    // Escrow State
    const [escrowResult, setEscrowResult] = useState<any>(null);

    // Broadcast State
    const [broadcastResult, setBroadcastResult] = useState<any>(null);

    // Mortgage Calculator State
    const [calcInput, setCalcInput] = useState({
        principal: listing.price,
        rate: 6.5,
        term: 30,
        tax: 6000,
        insurance: 1200
    });
    const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

    // Lead Management State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadFile, setLeadFile] = useState<File | null>(null);

    const handleRunValuation = async () => {
        const result = await runValuation({
            assetId: listing.id,
            comps: valInput.comps,
            capRate: valInput.capRate,
            netOperatingIncome: valInput.noi,
            vacancyRate: valInput.vacancy
        });
        setValuationResult(result);
    };

    const handleInitEscrow = async () => {
        const payload = {
            buyer: "Investor Alpha",
            seller: listing.sellerName,
            amount: listing.price,
            conditions: ["valuation_receipt_verified", "inspection_passed"]
        };
        const receipt = await issueReceipt({
            id: "escrow:" + listing.id,
            type: "escrow",
            payloadRef: JSON.stringify(payload),
            meta: { amount: String(payload.amount), buyer: payload.buyer }
        });
        setEscrowResult({
            escrowId: "ESCROW-" + Date.now().toString().slice(-4),
            state: "initiated",
            receipt
        });
    };

    const handleBroadcast = async () => {
        const payload = {
            headline: "Flagship Portfolio Ignition",
            tags: ["securitization", "fortifile", "signalbox"],
            artifact: {
                id: "broadcast:" + listing.id,
                type: "broadcast" as const,
                payloadRef: "portfolio:" + listing.id,
                meta: { region: "California", tier: "enterprise" }
            }
        };
        const receipt = await issueReceipt(payload.artifact);
        
        setBroadcastResult({
            dispatch: {
                status: "queued",
                channel: "SignalBox™ Web",
                headline: payload.headline,
                fingerprint: receipt.fingerprint
            },
            receipt
        });
    };

    const calculateMortgage = () => {
        const p = calcInput.principal;
        const r = calcInput.rate / 100 / 12;
        const n = calcInput.term * 12;
        
        // P * (r(1+r)^n) / ((1+r)^n - 1)
        const pi = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const ti = (calcInput.tax + calcInput.insurance) / 12;
        setMonthlyPayment(pi + ti);
    };

    const handleLeadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLeadFile(e.target.files[0]);
        }
    };

    const processLeads = () => {
        // Simulation of CSV parsing
        const mockParsedLeads: Lead[] = [
            { id: 'L001', fullName: 'Michael Scott', address: '1725 Slough Ave, Scranton, PA', email: 'mscott@dunder.com', phone: '555-0199', status: 'New', estimatedValue: 450000 },
            { id: 'L002', fullName: 'Dwight Schrute', address: 'Schrute Farms, Honesdale, PA', email: 'dschrute@farms.com', phone: '555-0123', status: 'Contacted', estimatedValue: 850000 },
            { id: 'L003', fullName: 'Jim Halpert', address: '45 Beeswax Ln, Philadelphia, PA', email: 'jhalpert@athlead.com', phone: '555-0144', status: 'New', estimatedValue: 520000 },
        ];
        
        // In a real app, we'd read the file content
        setLeads([...leads, ...mockParsedLeads]);
        setLeadFile(null);
    };

    const handleExportLeads = () => {
        if(leads.length === 0) return;
        
        // Convert leads to CSV string
        const headers = ["ID", "Full Name", "Address", "Email", "Phone", "Status", "Estimated Value"];
        const rows = leads.map(l => 
            [l.id, l.fullName, l.address, l.email, l.phone, l.status, l.estimatedValue].join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        
        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sovereign_leads_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ReceiptView = ({ receipt }: { receipt: any }) => (
        <div className="bg-black/90 text-brand-green p-3 rounded font-mono text-[10px] mt-2 overflow-x-auto border border-brand-green/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <div className="flex justify-between items-center mb-1 border-b border-brand-green/30 pb-1">
                <span className="font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> FORTIFILE™ RECEIPT</span>
                <span>{new Date(receipt.issuedAt).toLocaleTimeString()}</span>
            </div>
            <p><strong>ID:</strong> {receipt.artifact.id}</p>
            <p><strong>PROOF:</strong> {receipt.proofHash.substring(0, 32)}...</p>
            <p><strong>OWNER:</strong> {receipt.fingerprint.owner}</p>
            <div className="mt-1 text-brand-green/70">
                {receipt.clauses.map((c: string, i: number) => <div key={i}>✓ {c.substring(0, 40)}...</div>)}
            </div>
        </div>
    );

    return (
        <Card className="animate-fade-in space-y-6">
            <Card.Header>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Sovereign Banker Suite</Card.Title>
                            <Card.Description>Gemini Studio One-Pager • Valuation, Escrow & SignalBox™</Card.Description>
                        </div>
                    </div>
                    <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent">
                        <Button 
                            size="sm" 
                            variant={activeTab === 'banker' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('banker')}
                            className="text-xs"
                        >
                            Operations
                        </Button>
                         <Button 
                            size="sm" 
                            variant={activeTab === 'calculator' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('calculator')}
                            className="text-xs"
                        >
                            Calculator
                        </Button>
                        <Button 
                            size="sm" 
                            variant={activeTab === 'leads' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('leads')}
                            className="text-xs"
                        >
                            Lead Command
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                {activeTab === 'banker' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Valuation & Risk */}
                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent flex flex-col">
                            <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-brand-blue" /> Valuation & Risk
                            </h3>
                            <div className="space-y-3 flex-grow">
                                <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        label="NOI ($)" 
                                        type="number" 
                                        value={valInput.noi} 
                                        onChange={e => setValInput({...valInput, noi: Number(e.target.value)})}
                                        className="text-xs"
                                    />
                                    <Input 
                                        label="Cap Rate" 
                                        type="number" 
                                        step="0.001"
                                        value={valInput.capRate} 
                                        onChange={e => setValInput({...valInput, capRate: Number(e.target.value)})}
                                        className="text-xs"
                                    />
                                </div>
                                <Button onClick={handleRunValuation} className="w-full" disabled={!!valuationResult}>
                                    {valuationResult ? 'Computed' : 'Compute & Certify'}
                                </Button>
                                
                                {valuationResult && (
                                    <div className="animate-fade-in">
                                        <div className="flex justify-between items-center bg-brand-primary p-2 rounded border border-brand-accent">
                                            <span className="text-sm text-brand-light">Blended Value</span>
                                            <span className="text-lg font-bold text-brand-highlight">${valuationResult.estimatedValue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-brand-primary p-2 rounded border border-brand-accent mt-2">
                                            <span className="text-sm text-brand-light">Risk Score</span>
                                            <span className={`text-lg font-bold ${valuationResult.riskScore < 50 ? 'text-brand-green' : 'text-red-400'}`}>
                                                {valuationResult.riskScore}/100
                                            </span>
                                        </div>
                                        <ReceiptView receipt={valuationResult.receipt} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Escrow Flow */}
                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent flex flex-col">
                            <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-green" /> Escrow Flow
                            </h3>
                            <div className="space-y-3 flex-grow">
                                <p className="text-xs text-brand-light">
                                    Initiate clause-enforced escrow. Funds are released only upon verified receipt conditions and timestamped confirmations.
                                </p>
                                <div className="bg-brand-primary p-3 rounded border border-brand-accent text-xs">
                                    <p><strong>Buyer:</strong> Investor Alpha</p>
                                    <p><strong>Seller:</strong> {listing.sellerName}</p>
                                    <p><strong>Amount:</strong> ${listing.price.toLocaleString()}</p>
                                </div>
                                <Button onClick={handleInitEscrow} className="w-full bg-brand-green hover:bg-brand-green/90" disabled={!!escrowResult}>
                                    {escrowResult ? 'Protocol Active' : 'Initiate Protocol'}
                                </Button>

                                {escrowResult && (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-2 text-brand-green text-xs font-bold my-2">
                                            <CheckCircle className="w-4 h-4" /> State: {escrowResult.state.toUpperCase()}
                                        </div>
                                        <ReceiptView receipt={escrowResult.receipt} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Ceremonial Broadcast */}
                        <div className="bg-brand-secondary p-4 rounded-lg border border-brand-accent flex flex-col">
                            <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                <Radio className="w-5 h-5 text-brand-yellow" /> Ceremonial Broadcast
                            </h3>
                            <div className="space-y-3 flex-grow">
                                <p className="text-xs text-brand-light">
                                    Ignite SignalBox™ broadcast. Deployments must reference immutable receipt fingerprints to verify broadcast compliance.
                                </p>
                                <div className="bg-brand-primary p-3 rounded border border-brand-accent text-xs">
                                    <p className="text-brand-yellow font-bold">HEADLINE: Flagship Portfolio Ignition</p>
                                    <p className="text-brand-light mt-1">Tags: #securitization #fortifile</p>
                                </div>
                                <Button onClick={handleBroadcast} className="w-full bg-brand-yellow text-brand-primary hover:bg-brand-yellow/90" disabled={!!broadcastResult}>
                                    {broadcastResult ? 'Signal Ignited' : 'Ignite SignalBox™'}
                                </Button>

                                {broadcastResult && (
                                    <div className="animate-fade-in">
                                        <div className="flex items-center gap-2 text-brand-yellow text-xs font-bold my-2">
                                            <Activity className="w-4 h-4" /> Status: {broadcastResult.dispatch.status.toUpperCase()}
                                        </div>
                                        <ReceiptView receipt={broadcastResult.receipt} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'calculator' ? (
                     <div className="bg-brand-secondary p-6 rounded-lg border border-brand-accent animate-fade-in">
                        <h3 className="font-bold text-brand-highlight mb-6 flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-brand-blue" /> Sovereign Mortgage Estimator
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Input 
                                    label="Loan Principal ($)" 
                                    type="number" 
                                    value={calcInput.principal} 
                                    onChange={e => setCalcInput({...calcInput, principal: Number(e.target.value)})} 
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Interest Rate (%)" 
                                        type="number" step="0.1" 
                                        value={calcInput.rate} 
                                        onChange={e => setCalcInput({...calcInput, rate: Number(e.target.value)})} 
                                    />
                                    <Input 
                                        label="Term (Years)" 
                                        type="number" 
                                        value={calcInput.term} 
                                        onChange={e => setCalcInput({...calcInput, term: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        label="Yearly Taxes ($)" 
                                        type="number" 
                                        value={calcInput.tax} 
                                        onChange={e => setCalcInput({...calcInput, tax: Number(e.target.value)})} 
                                    />
                                    <Input 
                                        label="Yearly Insurance ($)" 
                                        type="number" 
                                        value={calcInput.insurance} 
                                        onChange={e => setCalcInput({...calcInput, insurance: Number(e.target.value)})} 
                                    />
                                </div>
                                <Button onClick={calculateMortgage} className="w-full">Calculate Payment</Button>
                            </div>

                            <div className="bg-brand-primary rounded-lg border border-brand-accent p-6 flex flex-col items-center justify-center text-center">
                                {monthlyPayment ? (
                                    <>
                                        <p className="text-brand-light mb-2">Estimated Monthly Payment</p>
                                        <p className="text-4xl font-bold text-brand-green mb-4">
                                            ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </p>
                                        <div className="text-sm text-brand-light space-y-1 w-full max-w-xs">
                                            <div className="flex justify-between">
                                                <span>Principal & Interest:</span>
                                                <span className="font-bold text-brand-highlight">
                                                    ${(monthlyPayment - (calcInput.tax + calcInput.insurance)/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Taxes & Insurance:</span>
                                                <span className="font-bold text-brand-highlight">
                                                     ${((calcInput.tax + calcInput.insurance)/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-brand-light opacity-50 flex flex-col items-center">
                                        <Calculator className="w-16 h-16 mb-4" />
                                        <p>Enter loan details to estimate payments.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Leads Command Center Tab
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            {/* Upload Section */}
                            <div className="w-full md:w-1/3 bg-brand-secondary p-4 rounded-lg border border-brand-accent h-fit">
                                <h3 className="font-bold text-brand-highlight mb-4 flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-brand-green" /> Bulk Lead Ingestion
                                </h3>
                                <div className="border-2 border-dashed border-brand-accent rounded p-6 text-center hover:border-brand-blue transition-colors">
                                    <UploadCloud className="w-10 h-10 text-brand-light mx-auto mb-2" />
                                    <p className="text-sm text-brand-light mb-4">Upload CSV / XLS List</p>
                                    <input type="file" onChange={handleLeadUpload} className="hidden" id="lead-upload" accept=".csv,.xlsx" />
                                    <label htmlFor="lead-upload">
                                        <Button variant="outline" size="sm" as="span" className="cursor-pointer">Select File</Button>
                                    </label>
                                    {leadFile && <p className="text-xs text-brand-green mt-2">{leadFile.name}</p>}
                                </div>
                                <Button className="w-full mt-4" disabled={!leadFile} onClick={processLeads}>
                                    Process & Save to Vault
                                </Button>
                            </div>

                            {/* List View */}
                            <div className="w-full md:w-2/3 bg-brand-secondary p-4 rounded-lg border border-brand-accent">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-brand-highlight flex items-center gap-2">
                                        <Database className="w-5 h-5 text-brand-blue" /> Active Lead Database
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-brand-light bg-brand-primary px-2 py-1 rounded">{leads.length} Records</span>
                                        <Button size="sm" variant="outline" onClick={handleExportLeads} disabled={leads.length === 0} title="Download CSV">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-brand-primary text-brand-light text-xs uppercase">
                                            <tr>
                                                <th className="p-2">Name / Address</th>
                                                <th className="p-2">Status</th>
                                                <th className="p-2 text-right">Est. Value</th>
                                                <th className="p-2 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-accent">
                                            {leads.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-brand-light italic">
                                                        No leads imported. Upload a list to populate.
                                                    </td>
                                                </tr>
                                            ) : (
                                                leads.map(lead => (
                                                    <tr key={lead.id} className="hover:bg-brand-primary/50">
                                                        <td className="p-2">
                                                            <div className="font-medium">{lead.fullName}</div>
                                                            <div className="text-xs text-brand-light truncate max-w-[150px]">{lead.address}</div>
                                                        </td>
                                                        <td className="p-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                                lead.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                                                                lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                'bg-green-500/20 text-green-400'
                                                            }`}>{lead.status}</span>
                                                        </td>
                                                        <td className="p-2 text-right">${(lead.estimatedValue || 0).toLocaleString()}</td>
                                                        <td className="p-2 text-center">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                title="Convert to Portfolio"
                                                                onClick={() => onConvertLead && onConvertLead(lead)}
                                                                className="hover:bg-brand-blue hover:text-white"
                                                            >
                                                                <Play className="w-3 h-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card.Content>
            <Card.Footer>
                <div className="text-center w-full">
                    <p className="text-xs text-brand-light flex justify-center items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        Powered by Office Works Command™ • RADEST Licensing • Ally Licensing
                    </p>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default SovereignBanker;
