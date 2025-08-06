import { WeightConfiguration, ApiResponse } from '../types';
import { databaseService } from './databaseService';

// Import all hardcoded mappings as fallback
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

// Hardcoded mappings as fallback
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
  private activeConfiguration: WeightConfiguration | null = null;
  private configurations: WeightConfiguration[] = [];

  // Initialize the service
  async initialize(): Promise<void> {
    try {
      await this.loadConfigurations();
      await this.loadActiveConfiguration();
    } catch (error) {
      console.error('Failed to initialize weight service:', error);
    }
  }

  // Load all configurations from database
  private async loadConfigurations(): Promise<void> {
    try {
      const response = await databaseService.getWeightConfigurations();
      if (response.success && response.data) {
        this.configurations = response.data;
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
      this.configurations = [];
    }
  }

  // Load active configuration
  private async loadActiveConfiguration(): Promise<void> {
    try {
      const activeConfig = this.configurations.find(config => config.isActive);
      this.activeConfiguration = activeConfig || null;
    } catch (error) {
      console.error('Failed to load active configuration:', error);
      this.activeConfiguration = null;
    }
  }

  // Get weight for a specific mapping
  getWeight(factorId: string, sourceId: string, objectiveId: string): number {
    // First try to get from active database configuration
    if (this.activeConfiguration?.mappings) {
      const dbWeight = this.activeConfiguration.mappings[factorId]?.[sourceId]?.[objectiveId];
      if (dbWeight !== undefined) {
        return dbWeight;
      }
    }

    // Fallback to hardcoded mappings
    const hardcodedMapping = HARDCODED_MAPPINGS[factorId as keyof typeof HARDCODED_MAPPINGS];
    if (hardcodedMapping) {
      // Handle different mapping structures
      if (factorId === 'df1') {
        // DF1 has different structure: { objectiveId: { strategyId: weight } }
        return hardcodedMapping[objectiveId]?.[sourceId] || 1.0;
      } else if (factorId === 'df4') {
        // DF4 has structure: { issueId: { objectiveId: weight } }
        return hardcodedMapping[sourceId]?.[objectiveId] || 1.0;
      } else {
        // Other DFs have structure: { objectiveId: { sourceId: weight } }
        return hardcodedMapping[objectiveId]?.[sourceId] || 1.0;
      }
    }

    // Default fallback
    return 1.0;
  }

  // Get all weights for a specific factor
  getFactorWeights(factorId: string): { [sourceId: string]: { [objectiveId: string]: number } } {
    const weights: { [sourceId: string]: { [objectiveId: string]: number } } = {};

    // Try to get from active database configuration
    if (this.activeConfiguration?.mappings?.[factorId]) {
      return this.activeConfiguration.mappings[factorId];
    }

    // Fallback to hardcoded mappings
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

  // Get active configuration
  getActiveConfiguration(): WeightConfiguration | null {
    return this.activeConfiguration;
  }

  // Get all configurations
  getAllConfigurations(): WeightConfiguration[] {
    return this.configurations;
  }

  // Set active configuration
  async setActiveConfiguration(configId: string): Promise<ApiResponse<void>> {
    try {
      // Update all configurations
      const updatedConfigs = this.configurations.map(config => ({
        ...config,
        isActive: config.id === configId
      }));

      // Save all configurations with updated active status
      for (const config of updatedConfigs) {
        await databaseService.saveWeightConfiguration({
          name: config.name,
          description: config.description,
          mappings: config.mappings,
          isActive: config.isActive
        });
      }

      // Update local state
      this.configurations = updatedConfigs;
      this.activeConfiguration = updatedConfigs.find(c => c.isActive) || null;

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to set active configuration' };
    }
  }

  // Save configuration
  async saveConfiguration(config: Omit<WeightConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WeightConfiguration>> {
    try {
      const response = await databaseService.saveWeightConfiguration(config);
      if (response.success && response.data) {
        // Update local state
        const existingIndex = this.configurations.findIndex(c => c.id === response.data!.id);
        if (existingIndex >= 0) {
          this.configurations[existingIndex] = response.data;
        } else {
          this.configurations.push(response.data);
        }

        // Update active configuration if this is the active one
        if (response.data.isActive) {
          this.activeConfiguration = response.data;
        }
      }
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to save configuration' };
    }
  }

  // Refresh configurations from database
  async refresh(): Promise<void> {
    await this.loadConfigurations();
    await this.loadActiveConfiguration();
  }

  // Check if using database weights
  isUsingDatabaseWeights(): boolean {
    return this.activeConfiguration !== null;
  }

  // Get weight source info
  getWeightSourceInfo(): { source: 'database' | 'hardcoded'; configName?: string } {
    if (this.activeConfiguration) {
      return {
        source: 'database',
        configName: this.activeConfiguration.name
      };
    }
    return {
      source: 'hardcoded'
    };
  }
}

export const weightService = new WeightService(); 