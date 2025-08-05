

import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS, OBJECTIVE_BASELINES } from '../../constants/cobitData';
import { DF6_MAPPING } from '../../constants/mappings/df6Mapping';


/**
 * Calculates scores for Design Factor 6.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate for (e.g., 'df6').
 * @returns An array of ScoreResult for the specified factor.
 */
export const calculateDf6Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    if (!factor || !factor.options) return [];

    const factorInputs = inputs[factor.id] as { [key: string]: number };
    if (!factorInputs) return [];
    
    // Normalize user inputs by their actual total sum.
    const totalUserInput = Object.values(factorInputs).reduce((sum, val) => sum + (val || 0), 0);

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const objectiveWeights = DF6_MAPPING[obj.id];
        let rawScore = 0;

        if (objectiveWeights) {
            // Calculate the raw score based on the user's normalized percentage inputs
            rawScore = factor.options!.reduce((acc, option) => {
                const inputValue = factorInputs[option.id] || 0;
                
                // Normalize the user's input value against their total input sum.
                const normalizedValue = totalUserInput > 0 ? inputValue / totalUserInput : 0;
                
                // The option name 'High', 'Normal', or 'Low' matches the key in the DF6_MAPPING weight object.
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