
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TermsModalProps {
    onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4">
            <Card className="w-full max-w-2xl">
                <Card.Header>
                    <Card.Title>Terms, Conditions, and Licensing</Card.Title>
                    <Card.Description>Sovereign Real Estate Command Center Legal Compliance</Card.Description>
                </Card.Header>
                <Card.Content className="max-h-[60vh] overflow-y-auto text-sm space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-brand-highlight">1. Application Access & Device Permissions</h3>
                        <p className="text-brand-light">By using this application, you explicitly consent to provide access to your device's <strong>Camera, Microphone, and Geolocation services</strong>. This access is essential for:
                        <ul className="list-disc ml-5 mt-1">
                            <li>Documenting job sites and creating Virtual Tours.</li>
                            <li>Enabling secure video conferencing and "on hold" interactions.</li>
                            <li>Verifying property location for maps and scheduling.</li>
                        </ul>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-brand-highlight">2. Secure Communication & Privacy Policy</h3>
                        <p className="text-brand-light">All communications, including chat logs, video conference metadata, and uploaded documents, are logged securely. Virtual Tour data and room captures are stored locally or in the sovereign vault. We comply with standard data protection regulations. We do not sell your personal PII data to unauthorized third parties.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-brand-highlight">3. Proprietary Global License</h3>
                        <p className="text-brand-light font-semibold">This application and all its components, code, and processes are subject to a non-open source proprietary Global license, exclusively owned by Eric Daniel Malley and Radest Publishing Co. Unauthorized reproduction, distribution, reverse engineering, or modification is strictly prohibited.</p>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold text-brand-highlight">4. Ad-Supported Services & Syndication</h3>
                        <p className="text-brand-light">
                            <strong>Advertising:</strong> You acknowledge that this application is supported by advertising. Advertisements may appear throughout the interface, including but not limited to: sidebars, dashboard panels, and full-screen video overlays during "On Hold" status in conference calls.
                            <br/><br/>
                            <strong>Syndication:</strong> The "Syndication Bridge" transmits listing data to external platforms (MLS, Zillow, etc.). You grant permission for this distribution.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-brand-highlight">5. Compliance & Liability</h3>
                        <p className="text-brand-light">Users are responsible for ensuring that all uploaded documents, photos, and descriptions comply with Fair Housing laws. SovereignRE is not liable for user-generated content inaccuracies.</p>
                    </div>
                </Card.Content>
                <Card.Footer>
                    <Button onClick={onAccept} className="w-full">
                        I Have Read, Understand, and Accept These Terms
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default TermsModal;
