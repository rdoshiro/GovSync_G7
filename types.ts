export interface LicenseData {
  firstName: string;
  lastName: string;
  dob: string;
  address: string;
  licenseNumber: string;
  originProvince: string;
  currentClass: string;
  expiryDate: string;
  conditions: string[];
  restrictions: string[];
  isAuthentic: boolean;
  authenticityConfidence: number;
}

export interface EquivalencyResult {
  targetClass: string;
  isDirectExchange: boolean;
  requiredTests: string[];
  requiredDocs: string[];
  fees: number;
  policyCitation: string;
  notes: string;
}

export interface ProcessingSession {
  id: string;
  timestamp: Date;
  status: 'scanning' | 'analyzing' | 'review' | 'complete' | 'error';
  imagePreviewUrl: string | null;
  licenseData: LicenseData | null;
  equivalency: EquivalencyResult | null;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PROCESS_TRANSFER = 'PROCESS_TRANSFER',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}