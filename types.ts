
export enum RealEstateStatus {
    LISTING = 'Listing Composer',
    ROOM_SPECS = 'Room Specs',
    VIRTUAL_TOUR = 'Virtual Tour Creator',
    SCHEDULE = 'Schedule & Maps',
    SYNDICATION = 'Syndication Bridge',
    OFFERS = 'Offer & Contract',
    BANKER = 'Sovereign Banker',
    ESCROW = 'Escrow Gateway',
    DOCUMENTS = 'Document Vault',
    LIFECYCLE = 'Service Lifecycle',
    CLOSED = 'Closed',
}

export interface RoomSpec {
    id: string;
    roomName: string;
    ceilingHeight: number;
    windowCount: number;
    sunlightExposure: string;
    orientation: string;
    materials: string;
    notes: string;
    photos?: string[];
}

export interface Offer {
    id: string;
    buyerName: string;
    agentName: string;
    amount: number;
    contingencies: string[];
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Countered' | 'Withdrawn';
    receivedAt: string;
    terms?: string;
    counterAmount?: number;
    counterTerms?: string;
    history?: { action: string; amount: number; date: string }[];
    // New Ranking Fields
    financingType: 'Cash' | 'Conventional' | 'FHA' | 'VA' | 'Seller Financing';
    closingDays: number;
    downPayment: number;
}

export interface EscrowMilestone {
    name: string;
    percentage: number;
    status: 'Pending' | 'Secured' | 'Released';
    amount: number;
}

export interface Signature {
    signerName: string;
    signatureData: string; // base64 image of signature
    timestamp: string;
}

export interface RealEstateDocument {
    id: string;
    name: string;
    type: 'Purchase Agreement' | 'Disclosure' | 'Inspection Report' | 'Appraisal' | 'Valuation' | 'Comps' | 'Demographics' | 'Tax Form' | 'Lease' | 'Contractor Estimate' | 'Other' | 'Live Contract';
    data?: string; // base64 data url for uploads
    content?: string; // text content for editable contracts
    uploadedAt: string;
    status: 'Draft' | 'Under Review' | 'Pending Signature' | 'Signed';
    certified?: boolean; // If true, document is locked for editing
    signatures?: Signature[];
    requestedSigners?: string[];
}

export interface Communication {
    agentType: "Buyer's Agent" | "Listing Agent" | "System";
    message: string;
    timestamp: string;
}

export interface CustomField {
    id: string;
    key: string;
    value: string;
}

export interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'Showing' | 'Inspection' | 'Appraisal' | 'Maintenance' | 'Closing';
    attendees: string[];
    reminderSet: boolean;
    location?: string;
}

export interface ClosingChecklistItem {
    id: string;
    label: string;
    completed: boolean;
    approvedBy: string[]; // e.g. ['Buyer', 'Seller', 'Mediator']
}

// New Lead Interface for Banker/Broker
export interface Lead {
    id: string;
    fullName: string;
    address: string;
    email: string;
    phone: string;
    status: 'New' | 'Contacted' | 'Converted' | 'Archived';
    estimatedValue?: number;
    notes?: string;
}

export interface Listing {
    id: string;
    address: string;
    price: number;
    status: RealEstateStatus;
    sellerName: string;
    sellerEmail: string;
    sellerPhone: string;
    description: string;
    photos: string[]; // array of base64 data urls
    customFields: CustomField[];
    roomSpecs: RoomSpec[];
    offers: Offer[];
    escrowMilestones: EscrowMilestone[];
    documents: RealEstateDocument[];
    communications: Communication[];
    appointments: Appointment[];
    closingChecklist: ClosingChecklistItem[];
    leads?: Lead[]; // Optional lead list for the banker view
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}