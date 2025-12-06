
import React, { useState, useRef, useEffect } from 'react';
import { Listing, RealEstateDocument, Signature } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UploadCloud, FileSignature, Download, Trash2, FileText, CheckCircle, Plus, Shield, Send, User, Camera, Crop, EyeOff, Maximize, Lock, RefreshCw, X, Share2 } from './ui/Icons';
import { fileToDataUrl } from '../utils/file';

interface DocumentVaultProps {
    listing: Listing;
    onListingUpdate: (listing: Listing) => void;
}

const DOCUMENT_TEMPLATES: Record<string, string> = {
    'Purchase Agreement': `REAL ESTATE PURCHASE AGREEMENT\n\nDate: [Date]\n\n1. PARTIES:\nSeller: [Seller Name]\nBuyer: [Buyer Name]\n\n2. PROPERTY:\nAddress: [Address]\n\n3. PURCHASE PRICE:\n$[Price]\n\n4. TERMS:\n[Enter terms here...]`,
    'Appraisal Report': `UNIFORM RESIDENTIAL APPRAISAL REPORT\n\nProperty: [Address]\nDate of Appraisal: [Date]\n\n1. SUBJECT:\n[Describe property]\n\n2. CONTRACT:\n[Analyze contract]\n\n3. NEIGHBORHOOD:\n[Describe neighborhood market conditions]\n\n4. VALUATION:\nIndicated Value by Sales Comparison Approach: $[Value]`,
    'Inspection Report': `HOME INSPECTION REPORT\n\nProperty: [Address]\nInspector: [Inspector Name]\nDate: [Date]\n\nSUMMARY OF FINDINGS:\n\n1. ROOFING:\n[Condition]\n\n2. EXTERIOR:\n[Condition]\n\n3. HVAC:\n[Condition]\n\n4. PLUMBING:\n[Condition]\n\n5. ELECTRICAL:\n[Condition]\n\nRecommendation: [Enter recommendations]`,
    'Valuation': `COMPARATIVE MARKET ANALYSIS (CMA)\n\nProperty: [Address]\n\nComparable 1:\n[Address] - Sold for $[Price]\n\nComparable 2:\n[Address] - Sold for $[Price]\n\nComparable 3:\n[Address] - Sold for $[Price]\n\nRecommended List Price: $[Price]`,
    'Demographics': `NEIGHBORHOOD DEMOGRAPHICS & MARKET REPORT\n\nZip Code: [Zip]\n\nPopulation Density: [Value]\nMedian Age: [Value]\nMedian Household Income: $[Value]\n\nMarket Trends:\n[Enter trends...]`,
    'Comps': `COMPARABLE SALES REPORT\n\n[List details of recent sales in the zip code...]`,
    'Contractor Estimate': `CONTRACTOR JOB ESTIMATE\n\nContractor: [Name]\nLicense #: [License]\nProject Address: [Address]\n\nSCOPE OF WORK:\n1. [Item 1] - $[Cost]\n2. [Item 2] - $[Cost]\n3. [Item 3] - $[Cost]\n\nTOTAL ESTIMATE: $[Total]\n\nTerms: 50% Deposit, 50% upon completion.`,
    'Title Commitment': `TITLE COMMITMENT SCHEDULE A\n\nEffective Date: [Date]\n\n1. Policy Amount: $[Price]\n2. Proposed Insured: [Buyer Name]\n3. Estate or Interest: Fee Simple\n\nRequirements:\n- Pay purchase price\n- Pay taxes`,
    'HOA Addendum': `HOMEOWNERS ASSOCIATION ADDENDUM\n\nProperty: [Address]\n\nThe property is subject to a Homeowners Association (HOA).\nMonthly Dues: $_____\nTransfer Fee: $_____\n\nSeller agrees to provide current HOA documents within 3 days.`,
    'Lead-Based Paint': `LEAD-BASED PAINT DISCLOSURE\n\nFor homes built before 1978.\n\nSeller has no knowledge of lead-based paint.\nSeller has provided the buyer with all available records.`
};

// --- Secure Scanner Interface ---
const ScannerInterface: React.FC<{ onSave: (doc: RealEstateDocument) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [step, setStep] = useState<'permission' | 'capture' | 'edit' | 'finalize'>('permission');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [redactions, setRedactions] = useState<{ x: number, y: number }[]>([]);
    const [isEnhanced, setIsEnhanced] = useState(false);
    const [docName, setDocName] = useState('Scanned Document');
    const [docType, setDocType] = useState<string>('Other');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (step === 'capture') {
            startCamera();
        }
        return () => stopCamera();
    }, [step]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setCapturedImage(canvas.toDataURL('image/jpeg'));
                setStep('edit');
            }
        }
    };

    const handleAddRedaction = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setRedactions([...redactions, { x, y }]);
    };

    const handleUndoRedaction = () => {
        setRedactions(redactions.slice(0, -1));
    };

    const handleSave = () => {
        if (!capturedImage) return;
        
        const newDoc: RealEstateDocument = {
            id: `scan-${Date.now()}`,
            name: docName,
            type: docType as any,
            data: capturedImage,
            uploadedAt: new Date().toISOString(),
            status: 'Signed', // Scanned docs treated as finalized
            certified: true, // Auto-certify scanned docs
        };
        onSave(newDoc);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-fade-in text-white">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-brand-green" />
                    <span className="font-bold tracking-wider">FortiFile™ Scanner</span>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-grow flex items-center justify-center p-4 overflow-hidden relative">
                
                {step === 'permission' && (
                    <div className="text-center max-w-md space-y-6">
                        <Shield className="w-20 h-20 text-brand-blue mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Secure Capture Consent</h2>
                        <p className="text-gray-400">
                            Sovereign Compliance requires visual verification. You are about to access the secure camera module. 
                            Images are processed locally, encrypted, and anchored to the Vault.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={onCancel}>Deny</Button>
                            <Button onClick={() => setStep('capture')}>Allow Access</Button>
                        </div>
                    </div>
                )}

                {step === 'capture' && (
                    <div className="relative w-full h-full max-w-lg bg-black flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Guidance Frame */}
                        <div className="absolute inset-8 border-2 border-brand-blue/50 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                            <div className="flex justify-between">
                                <Maximize className="w-6 h-6 text-brand-blue rotate-180" />
                                <Maximize className="w-6 h-6 text-brand-blue -rotate-90" />
                            </div>
                            <div className="text-center text-xs text-brand-blue bg-black/50 py-1 px-2 rounded-full self-center">
                                Align Document Edges
                            </div>
                            <div className="flex justify-between">
                                <Maximize className="w-6 h-6 text-brand-blue rotate-90" />
                                <Maximize className="w-6 h-6 text-brand-blue" />
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <button 
                                onClick={handleCapture}
                                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-95 transition-transform"
                            ></button>
                        </div>
                    </div>
                )}

                {step === 'edit' && capturedImage && (
                    <div className="relative w-full max-w-lg">
                        <div 
                            className="relative overflow-hidden rounded-lg border border-gray-700 cursor-crosshair"
                            onClick={handleAddRedaction}
                        >
                            <img 
                                src={capturedImage} 
                                alt="Captured" 
                                className={`w-full transition-all duration-300 ${isEnhanced ? 'grayscale contrast-125 brightness-110' : ''}`} 
                            />
                            {/* Redaction Layers */}
                            {redactions.map((r, i) => (
                                <div 
                                    key={i}
                                    className="absolute bg-black"
                                    style={{ 
                                        left: `${r.x}%`, 
                                        top: `${r.y}%`, 
                                        width: '15%', 
                                        height: '5%', 
                                        transform: 'translate(-50%, -50%)' 
                                    }}
                                ></div>
                            ))}
                            <div className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-1 rounded text-white pointer-events-none">
                                Tap to Redact
                            </div>
                        </div>

                        <div className="flex justify-around mt-6">
                            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setIsEnhanced(!isEnhanced)}>
                                <div className={`p-3 rounded-full ${isEnhanced ? 'bg-brand-blue text-white' : 'bg-gray-800 text-gray-400'}`}>
                                    <Crop className="w-5 h-5" />
                                </div>
                                <span className="text-xs">Enhance</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={handleUndoRedaction}>
                                <div className="p-3 rounded-full bg-gray-800 text-gray-400">
                                    <EyeOff className="w-5 h-5" />
                                </div>
                                <span className="text-xs">Undo Redact</span>
                            </div>
                             <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep('capture')}>
                                <div className="p-3 rounded-full bg-gray-800 text-gray-400">
                                    <RefreshCw className="w-5 h-5" />
                                </div>
                                <span className="text-xs">Retake</span>
                            </div>
                        </div>
                        <div className="mt-6">
                             <Button className="w-full" onClick={() => setStep('finalize')}>Next: Finalize</Button>
                        </div>
                    </div>
                )}

                {step === 'finalize' && capturedImage && (
                    <div className="max-w-md w-full space-y-6">
                        <div className="text-center">
                            <Lock className="w-16 h-16 text-brand-green mx-auto mb-4" />
                            <h2 className="text-xl font-bold">Encrypting & Anchoring</h2>
                            <p className="text-gray-400 text-sm mt-2">Preparing for FortiFile™ Vault Storage</p>
                        </div>
                        
                        <div className="space-y-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Document Name</label>
                                <input 
                                    value={docName} 
                                    onChange={(e) => setDocName(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-brand-blue outline-none"
                                />
                            </div>
                             <div>
                                <label className="block text-sm text-gray-400 mb-1">Document Type</label>
                                <select 
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:border-brand-blue outline-none"
                                >
                                    <option value="Other">Uncategorized</option>
                                    <option value="Tax Form">Tax Document (W-2/1099)</option>
                                    <option value="ID">Identification (DL/Passport)</option>
                                    <option value="Bank Statement">Bank Statement</option>
                                    <option value="Contract">Contract/Agreement</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-green pt-2 border-t border-gray-800">
                                <CheckCircle className="w-3 h-3" />
                                <span>Watermark Hash Generated</span>
                            </div>
                             <div className="flex items-center gap-2 text-xs text-brand-green">
                                <CheckCircle className="w-3 h-3" />
                                <span>Redaction Map Saved</span>
                            </div>
                        </div>

                        <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white" onClick={handleSave}>
                            Save to Vault
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- End Scanner Interface ---

const SignaturePad: React.FC<{ onSave: (data: string) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
             const ctx = canvas.getContext('2d');
             ctx?.beginPath(); // reset path
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL());
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-brand-accent">
            <p className="text-black mb-2 font-semibold">Sign Below:</p>
            <canvas
                ref={canvasRef}
                className="border border-gray-300 w-full h-40 bg-gray-50 touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleClear} className="text-black border-gray-300 hover:bg-gray-100">Clear</Button>
                <Button size="sm" variant="outline" onClick={onCancel} className="text-black border-gray-300 hover:bg-gray-100">Cancel</Button>
                <Button size="sm" onClick={handleSave}>Adopt & Sign</Button>
            </div>
        </div>
    );
};

const DocumentVault: React.FC<DocumentVaultProps> = ({ listing, onListingUpdate }) => {
    const [view, setView] = useState<'list' | 'editor' | 'create'>('list');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [signingMode, setSigningMode] = useState(false);
    const [templateType, setTemplateType] = useState<string>('Purchase Agreement');
    
    // Scanner State
    const [isScanning, setIsScanning] = useState(false);

    // Request Signatures State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestableSigners, setRequestableSigners] = useState<string[]>([]);
    
    // Editor State
    const [editorContent, setEditorContent] = useState('');
    const [editorTitle, setEditorTitle] = useState('');
    const [activeUser, setActiveUser] = useState<'Seller' | 'Buyer' | 'Realtor' | 'Inspector' | 'Contractor'>('Seller');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeDoc = listing.documents.find(d => d.id === selectedDocId);

    const handleCreateContract = () => {
        const templateContent = DOCUMENT_TEMPLATES[templateType] || DOCUMENT_TEMPLATES['Purchase Agreement'];
        // Simple interpolation
        const content = templateContent
            .replace('[Date]', new Date().toLocaleDateString())
            .replace('[Address]', listing.address)
            .replace('[Price]', listing.price.toLocaleString())
            .replace('[Seller Name]', listing.sellerName);

        const newDoc: RealEstateDocument = {
            id: `doc-${Date.now()}`,
            name: `${templateType} - ${listing.address}`,
            type: templateType as any,
            content: content,
            uploadedAt: new Date().toISOString(),
            status: 'Draft',
            signatures: [],
            certified: false,
        };
        const updatedDocs = [...listing.documents, newDoc];
        onListingUpdate({ ...listing, documents: updatedDocs });
        setSelectedDocId(newDoc.id);
        setEditorContent(newDoc.content || '');
        setEditorTitle(newDoc.name);
        setView('editor');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const data = await fileToDataUrl(file);
            const newDoc: RealEstateDocument = {
                id: `doc-${Date.now()}`,
                name: file.name,
                type: 'Other',
                data,
                uploadedAt: new Date().toISOString(),
                status: 'Signed', // Uploads usually static
                certified: true
            };
            onListingUpdate({ ...listing, documents: [...listing.documents, newDoc] });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleScanSave = (newDoc: RealEstateDocument) => {
        onListingUpdate({ ...listing, documents: [...listing.documents, newDoc] });
        setIsScanning(false);
    };

    const saveDocument = () => {
        if (!activeDoc) return;
        const updatedDocs = listing.documents.map(d => 
            d.id === activeDoc.id 
            ? { ...d, content: editorContent, name: editorTitle } 
            : d
        );
        onListingUpdate({ ...listing, documents: updatedDocs });
    };

    const handleCertify = () => {
        if (!activeDoc) return;
        if (confirm("Are you sure you want to certify this document? It will be locked for editing.")) {
             const updatedDocs = listing.documents.map(d => 
                d.id === activeDoc.id 
                ? { ...d, content: editorContent, name: editorTitle, certified: true } 
                : d
            );
            onListingUpdate({ ...listing, documents: updatedDocs });
        }
    };

    const handleShareForReview = () => {
        if (!activeDoc) return;
        // Allows collaboration without locking
        const updatedDocs = listing.documents.map(d =>
            d.id === activeDoc.id
                ? { ...d, status: 'Under Review' as const }
                : d
        );
        onListingUpdate({ ...listing, documents: updatedDocs });
        alert("Document shared for review. Participants can now view and suggest edits.");
    };

    const handleSign = (signatureData: string) => {
        if (!activeDoc) return;
        const newSignature: Signature = {
            signerName: activeUser,
            signatureData,
            timestamp: new Date().toLocaleString()
        };
        
        const updatedRequestedSigners = activeDoc.requestedSigners?.filter(s => s !== activeUser) || [];
        const newStatus: 'Pending Signature' | 'Signed' | 'Under Review' = updatedRequestedSigners.length > 0 ? 'Pending Signature' : 'Signed';

        const updatedDocs = listing.documents.map(d => 
            d.id === activeDoc.id 
            ? { 
                ...d, 
                signatures: [...(d.signatures || []), newSignature],
                status: newStatus as any,
                requestedSigners: updatedRequestedSigners
              } 
            : d
        );
        onListingUpdate({ ...listing, documents: updatedDocs });
        setSigningMode(false);
    };
    
    // -- Signature Request Logic --
    const handleOpenRequestModal = () => {
        setRequestableSigners([]);
        setShowRequestModal(true);
    };

    const toggleRequestSigner = (role: string) => {
        if (requestableSigners.includes(role)) {
            setRequestableSigners(requestableSigners.filter(r => r !== role));
        } else {
            setRequestableSigners([...requestableSigners, role]);
        }
    };

    const sendRequests = () => {
        if (!activeDoc) return;
        if (requestableSigners.length === 0) {
            alert("Please select at least one signer.");
            return;
        }

        const updatedDocs = listing.documents.map(d =>
            d.id === activeDoc.id
            ? {
                ...d,
                status: 'Pending Signature' as const,
                requestedSigners: requestableSigners,
                certified: true // Auto-certify when requesting signatures
              }
            : d
        );
        onListingUpdate({ ...listing, documents: updatedDocs });
        setShowRequestModal(false);
        alert(`Signature requests sent securely to: ${requestableSigners.join(', ')}`);
    };
    // ---------------------------

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedDocs = listing.documents.filter(d => d.id !== id);
        onListingUpdate({ ...listing, documents: updatedDocs });
        if (selectedDocId === id) {
            setView('list');
            setSelectedDocId(null);
        }
    };

    if (view === 'create') {
         return (
             <Card className="animate-fade-in min-h-[300px]">
                 <Card.Header>
                     <Card.Title>Select Document Type</Card.Title>
                     <Card.Description>Choose a certified template to start.</Card.Description>
                 </Card.Header>
                 <Card.Content>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                         {Object.keys(DOCUMENT_TEMPLATES).map(type => (
                             <button
                                key={type}
                                onClick={() => setTemplateType(type)}
                                className={`p-4 rounded-lg border text-left transition-colors ${templateType === type ? 'border-brand-blue bg-brand-blue/10' : 'border-brand-accent hover:border-brand-light'}`}
                             >
                                 <div className="font-semibold text-brand-highlight">{type}</div>
                             </button>
                         ))}
                     </div>
                 </Card.Content>
                 <Card.Footer className="flex justify-end gap-2">
                     <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
                     <Button onClick={handleCreateContract}>Create Document</Button>
                 </Card.Footer>
             </Card>
         )
    }

    if (view === 'editor' && activeDoc) {
        return (
            <Card className="animate-fade-in h-[calc(100vh-150px)] flex flex-col relative">
                <div className="bg-brand-secondary p-4 border-b border-brand-accent flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => { saveDocument(); setView('list'); }}>Back</Button>
                        <input 
                            value={editorTitle}
                            onChange={(e) => setEditorTitle(e.target.value)}
                            className="bg-transparent text-brand-highlight font-bold border-b border-transparent focus:border-brand-blue outline-none"
                            disabled={activeDoc.certified}
                        />
                         <span className={`px-2 py-0.5 text-xs rounded-full border ${
                            activeDoc.certified ? 'border-brand-green text-brand-green' : 
                            activeDoc.status === 'Under Review' ? 'border-brand-blue text-brand-blue' : 
                            'border-brand-yellow text-brand-yellow'
                        }`}>
                            {activeDoc.certified ? 'Certified' : activeDoc.status === 'Under Review' ? 'Under Review' : 'Draft'}
                        </span>
                        {activeDoc.status === 'Pending Signature' && (
                             <span className="text-xs text-brand-blue animate-pulse">
                                Pending: {activeDoc.requestedSigners?.join(', ')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Simulation Controls */}
                         <div className="text-xs text-brand-light flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Simulate As:
                        </div>
                        <select 
                            className="bg-brand-primary border border-brand-accent rounded text-xs p-1"
                            value={activeUser}
                            onChange={(e) => setActiveUser(e.target.value as any)}
                        >
                            <option value="Seller">Seller (You)</option>
                            <option value="Buyer">Buyer</option>
                            <option value="Realtor">Realtor</option>
                            <option value="Inspector">Inspector</option>
                            <option value="Contractor">Contractor</option>
                        </select>

                        {!activeDoc.certified && <Button onClick={saveDocument} variant="secondary" size="sm">Save</Button>}
                        
                        {!activeDoc.certified && (
                            <Button onClick={handleShareForReview} size="sm" variant="outline" title="Share for Collaborative Editing">
                                <Share2 className="w-4 h-4 mr-2" /> Share Review
                            </Button>
                        )}

                        {!activeDoc.certified && (
                            <Button onClick={handleCertify} size="sm" variant="outline" title="Lock and Certify">
                                <Shield className="w-4 h-4 mr-2" /> Certify
                            </Button>
                        )}
                         
                         {/* Request Signatures Button */}
                         <Button onClick={handleOpenRequestModal} size="sm" variant="outline" title="Request Signatures">
                             <Send className="w-4 h-4 mr-2" /> Request Sigs
                         </Button>

                        <Button onClick={() => setSigningMode(true)} size="sm">
                            <FileSignature className="w-4 h-4 mr-2" /> E-Sign
                        </Button>
                    </div>
                </div>
                
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                    {/* Editor Area */}
                    <div className="flex-grow p-8 overflow-y-auto bg-white text-black font-serif relative">
                         {signingMode && (
                            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center p-4">
                                <SignaturePad onSave={handleSign} onCancel={() => setSigningMode(false)} />
                            </div>
                        )}
                        
                        {activeDoc.certified ? (
                             <div className="whitespace-pre-wrap">
                                {activeDoc.data ? (
                                    <div className="text-center">
                                        <img src={activeDoc.data} alt="Document Content" className="max-w-full h-auto mx-auto border border-gray-300 shadow-sm" />
                                    </div>
                                ) : (
                                    editorContent
                                )}
                             </div>
                        ) : (
                             <textarea 
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                className="w-full h-full resize-none outline-none bg-transparent p-2 border border-dashed border-gray-300 hover:border-blue-300 rounded"
                                placeholder="Start writing the contract here..."
                            />
                        )}
                       
                        
                        {/* Render Signatures at bottom */}
                        <div className="mt-8 pt-8 border-t-2 border-black grid grid-cols-2 gap-8">
                            {activeDoc.signatures?.map((sig, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                    <img src={sig.signatureData} alt="Signature" className="h-16 object-contain border-b border-black self-start" />
                                    <p className="text-sm font-bold uppercase">{sig.signerName}</p>
                                    <p className="text-xs text-gray-500">Digitally signed: {sig.timestamp}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">ID: {btoa(sig.timestamp).substring(0, 10)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Request Signatures Modal */}
                {showRequestModal && (
                    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-md bg-brand-secondary border-brand-accent">
                            <Card.Header>
                                <Card.Title>Request E-Signatures</Card.Title>
                                <Card.Description>Select parties required to sign this document.</Card.Description>
                            </Card.Header>
                            <Card.Content className="space-y-2">
                                {['Seller', 'Buyer', 'Realtor', 'Inspector', 'Contractor'].map(role => (
                                    <label key={role} className="flex items-center gap-3 p-3 bg-brand-primary rounded border border-brand-accent hover:border-brand-blue cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={requestableSigners.includes(role)}
                                            onChange={() => toggleRequestSigner(role)}
                                            className="w-5 h-5 text-brand-blue rounded focus:ring-brand-blue bg-brand-secondary border-brand-light"
                                        />
                                        <span className="text-brand-highlight flex items-center gap-2">
                                            <User className="w-4 h-4" /> {role}
                                        </span>
                                    </label>
                                ))}
                            </Card.Content>
                            <Card.Footer className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
                                <Button onClick={sendRequests}>Send Requests</Button>
                            </Card.Footer>
                        </Card>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <Card className="animate-fade-in min-h-[500px]">
            {isScanning && (
                <ScannerInterface 
                    onSave={handleScanSave} 
                    onCancel={() => setIsScanning(false)} 
                />
            )}
            
            <Card.Header>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FileSignature className="w-6 h-6 text-brand-blue" />
                        <div>
                            <Card.Title>Document Vault & Collaboration</Card.Title>
                            <Card.Description>Create, Edit, Share, and Sign Certified Documents.</Card.Description>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                         
                         <Button variant="outline" size="sm" onClick={() => setIsScanning(true)}>
                             <Camera className="w-4 h-4 mr-2" /> Scan Doc
                         </Button>

                         <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            <UploadCloud className="w-4 h-4 mr-2" /> Upload PDF
                        </Button>
                        <Button size="sm" onClick={() => setView('create')}>
                            <Plus className="w-4 h-4 mr-2" /> New Document
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="space-y-3">
                    {listing.documents.length === 0 ? (
                        <div className="text-center py-10 text-brand-light border-2 border-dashed border-brand-accent rounded-lg">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No documents yet. Create a contract, scan a page, or upload a file.</p>
                        </div>
                    ) : (
                        listing.documents.map(doc => (
                            <div 
                                key={doc.id} 
                                onClick={() => { 
                                    // Open editor/viewer for all types. For images/scans it will show the image.
                                    setSelectedDocId(doc.id); 
                                    setEditorContent(doc.content || '');
                                    setEditorTitle(doc.name);
                                    setView('editor');
                                }}
                                className={`flex items-center justify-between p-4 bg-brand-secondary rounded-lg border border-transparent hover:border-brand-blue transition-colors cursor-pointer group`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${
                                        doc.certified ? 'bg-brand-green/20 text-brand-green' : 
                                        doc.status === 'Under Review' ? 'bg-brand-blue/20 text-brand-blue' :
                                        'bg-brand-yellow/20 text-brand-yellow'
                                    }`}>
                                        {doc.certified ? <Shield className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-brand-highlight">{doc.name}</p>
                                        <div className="flex gap-2 text-xs text-brand-light mt-1">
                                            <span className="bg-brand-primary px-1 rounded">{doc.type}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            {doc.signatures && doc.signatures.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-brand-blue">{doc.signatures.length} Signature(s)</span>
                                                </>
                                            )}
                                        </div>
                                         {doc.status === 'Pending Signature' && doc.requestedSigners && (
                                            <div className="text-xs text-brand-yellow mt-1 font-semibold flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-brand-yellow rounded-full animate-pulse"></div>
                                                Waiting for: {doc.requestedSigners.join(', ')}
                                            </div>
                                        )}
                                        {doc.status === 'Under Review' && (
                                             <div className="text-xs text-brand-blue mt-1 font-semibold flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-brand-blue rounded-full"></div>
                                                Shared for Collaborative Review
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {doc.data && (
                                         <a href={doc.data} download={doc.name} onClick={(e) => e.stopPropagation()}>
                                            <Button size="icon" variant="outline" title="Download">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                    <Button size="icon" variant="destructive" onClick={(e) => handleDelete(doc.id, e)} title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card.Content>
        </Card>
    );
};

export default DocumentVault;
