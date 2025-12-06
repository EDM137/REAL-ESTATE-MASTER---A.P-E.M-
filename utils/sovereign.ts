
// Client-side implementation of Gemini Studio One-pager logic

export const SOVEREIGN = {
  owner: "Eric Daniel Malley",
  suite: "FABUFMPSovereignSuite",
  brand: "Office Works Command™ • RADEST Licensing • Gemini Studio • FortiFile™ • Kindraai • Ally Licensing • SignalBox™",
};

export const CLAUSES = {
  escrowIntegrity: "Funds released only on verified receipt conditions and timestamped confirmations.",
  auditReceipts: "Every artifact generates a FortiFile™ receipt; no unverified payloads permitted.",
  licenseBinding: "Usage rights flow through Ally Licensing signatures and RADEST registry entitlements.",
  broadcastCompliance: "SignalBox™ deployments reference immutable receipt fingerprints.",
};

export type SovereignFingerprint = {
  suite: string;
  owner: string;
  timestamp: string;
  hash: string;
};

export type ReceiptArtifact = {
  id: string;
  type: "contract" | "valuation" | "escrow" | "broadcast" | "blueprint";
  payloadRef: string;
  meta: Record<string, string>;
};

export type FortiFileReceipt = {
  artifact: ReceiptArtifact;
  fingerprint: SovereignFingerprint;
  clauses: string[];
  proofHash: string;
  issuedAt: string;
};

// Client-side SHA-256 using Web Crypto API
export async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function issueReceipt(artifact: ReceiptArtifact): Promise<FortiFileReceipt> {
  const issuedAt = new Date().toISOString();
  const baseString = JSON.stringify(artifact) + issuedAt + SOVEREIGN.owner;
  const proofHash = await sha256(baseString);

  const fingerprint: SovereignFingerprint = {
    suite: SOVEREIGN.suite,
    owner: SOVEREIGN.owner,
    timestamp: issuedAt,
    hash: proofHash,
  };

  return {
    artifact,
    fingerprint,
    clauses: [CLAUSES.auditReceipts, CLAUSES.licenseBinding, CLAUSES.broadcastCompliance],
    proofHash,
    issuedAt,
  };
}

export type ValuationInput = {
    assetId: string;
    comps: number[];
    capRate: number;
    netOperatingIncome: number;
    vacancyRate: number;
};

export async function runValuation(input: ValuationInput) {
    const stddev = (nums: number[]) => {
        if (!nums.length) return 0;
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
        return Math.sqrt(variance);
    };

    const avgComp = input.comps.reduce((a, b) => a + b, 0) / Math.max(1, input.comps.length);
    const incomeVal = input.netOperatingIncome / Math.max(input.capRate, 0.0001);
    const blended = 0.5 * avgComp + 0.5 * incomeVal;
    const risk = Math.min(100, Math.max(0, 50 + 10 * stddev(input.comps) + 20 * input.vacancyRate)); // Simplified logic

    const receipt = await issueReceipt({
        id: "valuation:" + input.assetId,
        type: "valuation",
        payloadRef: JSON.stringify(input),
        meta: { blended: blended.toFixed(2), risk: risk.toFixed(1) },
    });

    return {
        estimatedValue: blended,
        riskScore: risk,
        receipt,
    };
}
