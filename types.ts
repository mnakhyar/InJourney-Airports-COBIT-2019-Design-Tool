
export interface GovernanceObjective {
  id: string;
  name:string;
  domain: string;
}

export interface DesignFactorOption {
    id: string;
    name: string;
    value?: number; // Used for percentage inputs
}

export interface DesignFactor {
  id: string;
  name: string;
  description: string;
  options?: DesignFactorOption[];
  // The following are item types for rating, keep for flexibility
  archetypes?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  issues?: { id: string; name: string }[];
  riskScenarios?: { id: string; name: string }[];
  type: 'rating' | 'rating-2d' | 'percentage' | 'rating-1-3' | 'radio';
}

export interface UserInputs {
  // For rating and percentage, it's { itemId: value }
  // For rating-2d, it's { itemId: { impact: number, likelihood: number } }
  [factorId: string]: { [itemId: string]: number | { impact: number, likelihood: number } };
}

export interface ScoreResult {
  objectiveId: string;
  objectiveName: string;
  domain: string;
  rawScore: number;
  normalizedScore: number;
  finalScore: number; // Used in final summary
  baselineScore: number;
  relativeImportance: number;
  overrideScore?: number;
  capabilityLevel: number;
  suggestedCapabilityLevel?: number;
}

// Database-related types
export interface SavedProject {
  id: string;
  name: string;
  description?: string;
  inputs: UserInputs;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface WeightMapping {
  designFactorId: string;
  sourceId: string;
  targetObjectiveId: string;
  weight: number;
}

export interface WeightConfiguration {
  id: string;
  name: string;
  description?: string;
  mappings: { [key: string]: { [key: string]: { [key: string]: number } } };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SaveLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: UserInputs;
  onLoadProject: (inputs: UserInputs, projectId: string, projectName: string) => void;
  mode: 'save' | 'load';
}