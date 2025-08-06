

import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS, OBJECTIVE_BASELINES } from '../../constants/cobitData';
import { DF9_MAPPING } from '../../constants/mappings/df9Mapping';


/**
 * Calculates scores for Design Factor 9.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate for (e.g., 'df9').
 * @returns An array of ScoreResult for the specified factor.
 */
export const calculateDf9Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    if (!factor || !factor.options) return [];

    const factorInputs = (inputs[factor.id] || {}) as { [key: string]: number };
    
    // Use baseline values if inputs are empty
    const df9Baselines = { agile: 15, devops: 10, traditional: 75 };
    const effectiveInputs = Object.keys(factorInputs).length === 0 ? df9Baselines : factorInputs;

    // Normalize user inputs by their actual total sum.
    const totalUserInput = Object.values(effectiveInputs).reduce((sum, val) => sum + (val || 0), 0);

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const objectiveWeights = DF9_MAPPING[obj.id];
        let rawScore = 0;

        if (objectiveWeights) {
            // Calculate the raw score based on the user's normalized percentage inputs
            rawScore = factor.options!.reduce((acc, option) => {
                const inputValue = effectiveInputs[option.id] || 0;
                
                // Normalize the user's input value against their total input sum.
                const normalizedValue = totalUserInput > 0 ? inputValue / totalUserInput : 0;
                
                // The option name 'Agile', 'DevOps', 'Traditional' matches the key in the DF9_MAPPING weight object.
                const weightKey = option.name as keyof typeof objectiveWeights;
                const weight = objectiveWeights[weightKey] || 0;
                return acc + (normalizedValue * weight);
            }, 0);
        }
        
        const finalScore = Math.round(rawScore * 100) / 100;

        const dfKey = factorId as keyof typeof OBJECTIVE_BASELINES[string];
        const baselineScore = OBJECTIVE_BASELINES[obj.id]?.[dfKey] || 0;
        
        let relativeImportance = 0; // Default to 0 as per Step 4

        // Implement the 4-step algorithm for Relative Importance
        if (baselineScore > 0) { // Step 4: Handle division by zero
            // Step 1: Calculate Percentage Ratio
            const percentageRatio = (finalScore * 100) / baselineScore;
    
            // Step 2: Round to nearest 5
            const roundedToNearest5 = Math.round(percentageRatio / 5) * 5;
    
            // Step 3: Convert to Relative Score
            relativeImportance = roundedToNearest5 - 100;
        }
        
        return {
            objectiveId: obj.id,
            objectiveName: obj.name,
            domain: obj.domain,
            rawScore: rawScore,
            normalizedScore: 0, 
            finalScore: finalScore,
            baselineScore: baselineScore,
            relativeImportance: relativeImportance,
            capabilityLevel: 0,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};