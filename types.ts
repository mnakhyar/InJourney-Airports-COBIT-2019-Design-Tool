
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