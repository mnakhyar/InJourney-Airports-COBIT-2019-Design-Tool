// Import all hardcoded mappings
import { DF1_MAPPING } from '../constants/mappings/df1Mapping';
import { DF2_MAPPING } from '../constants/mappings/df2Mapping';
import { DF3_MAPPING } from '../constants/mappings/df3Mapping';
import { DF4_MAPPING } from '../constants/mappings/df4Mapping';
import { DF5_MAPPING } from '../constants/mappings/df5Mapping';
import { DF6_MAPPING } from '../constants/mappings/df6Mapping';
import { DF7_MAPPING } from '../constants/mappings/df7Mapping';
import { DF8_MAPPING } from '../constants/mappings/df8Mapping';
import { DF9_MAPPING } from '../constants/mappings/df9Mapping';
import { DF10_MAPPING } from '../constants/mappings/df10Mapping';

// Hardcoded mappings
const HARDCODED_MAPPINGS = {
  df1: DF1_MAPPING,
  df2: DF2_MAPPING,
  df3: DF3_MAPPING,
  df4: DF4_MAPPING,
  df5: DF5_MAPPING,
  df6: DF6_MAPPING,
  df7: DF7_MAPPING,
  df8: DF8_MAPPING,
  df9: DF9_MAPPING,
  df10: DF10_MAPPING,
};

class WeightService {
  // Initialize the service (no longer needed but kept for compatibility)
  async initialize(): Promise<void> {
    // No initialization needed - always use hardcoded mappings
  }

  // Get weight for a specific mapping
  getWeight(factorId: string, sourceId: string, objectiveId: string): number {
    const hardcodedMapping = HARDCODED_MAPPINGS[factorId as keyof typeof HARDCODED_MAPPINGS];
    if (hardcodedMapping) {
      // Handle different mapping structures
      if (factorId === 'df1') {
        // DF1 has different structure: { objectiveId: { strategyId: weight } }
        return hardcodedMapping[objectiveId]?.[sourceId] || 0;
      } else if (factorId === 'df4') {
        // DF4 has structure: { issueId: { objectiveId: weight } }
        return hardcodedMapping[sourceId]?.[objectiveId] || 0;
      } else {
        // Other DFs have structure: { objectiveId: { sourceId: weight } }
        return hardcodedMapping[objectiveId]?.[sourceId] || 0;
      }
    }

    // Default fallback
    return 0;
  }

  // Get all weights for a specific factor
  getFactorWeights(factorId: string): { [sourceId: string]: { [objectiveId: string]: number } } {
    const weights: { [sourceId: string]: { [objectiveId: string]: number } } = {};

    // Always use hardcoded mappings
    const hardcodedMapping = HARDCODED_MAPPINGS[factorId as keyof typeof HARDCODED_MAPPINGS];
    if (hardcodedMapping) {
      // Convert hardcoded structure to standard format
      if (factorId === 'df1') {
        // Convert from { objectiveId: { strategyId: weight } } to { strategyId: { objectiveId: weight } }
        Object.keys(hardcodedMapping).forEach(objectiveId => {
          Object.keys(hardcodedMapping[objectiveId]).forEach(strategyId => {
            if (!weights[strategyId]) weights[strategyId] = {};
            weights[strategyId][objectiveId] = hardcodedMapping[objectiveId][strategyId];
          });
        });
      } else if (factorId === 'df4') {
        // DF4 is already in correct format
        return hardcodedMapping as { [sourceId: string]: { [objectiveId: string]: number } };
      } else {
        // Convert from { objectiveId: { sourceId: weight } } to { sourceId: { objectiveId: weight } }
        Object.keys(hardcodedMapping).forEach(objectiveId => {
          Object.keys(hardcodedMapping[objectiveId]).forEach(sourceId => {
            if (!weights[sourceId]) weights[sourceId] = {};
            weights[sourceId][objectiveId] = hardcodedMapping[objectiveId][sourceId];
          });
        });
      }
    }

    return weights;
  }

  // Check if using database weights (always false now)
  isUsingDatabaseWeights(): boolean {
    return false;
  }

  // Get weight source info (always hardcoded now)
  getWeightSourceInfo(): { source: 'database' | 'hardcoded'; configName?: string } {
    return {
      source: 'hardcoded'
    };
  }

  // Refresh (no longer needed but kept for compatibility)
  async refresh(): Promise<void> {
    // No refresh needed - always use hardcoded mappings
  }
}

export const weightService = new WeightService(); 