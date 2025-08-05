
import { UserInputs, ScoreResult, DesignFactor } from '../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS, DESIGN_FACTOR_BASELINES } from '../constants/cobitData';
import { calculateDf1Scores } from './calculators/df1Calculator';
import { calculateDf2Scores } from './calculators/df2Calculator';
import { calculateDf3Scores } from './calculators/df3Calculator';
import { calculateDf4Scores } from './calculators/df4Calculator';
import { calculateDf5Scores } from './calculators/df5Calculator';
import { calculateDf6Scores } from './calculators/df6Calculator';
import { calculateDf7Scores } from './calculators/df7Calculator';
import { calculateDf8Scores } from './calculators/df8Calculator';
import { calculateDf9Scores } from './calculators/df9Calculator';
import { calculateDf10Scores } from './calculators/df10Calculator';

export const getCapabilityLevel = (score: number): number => {
    // This logic assumes a score that can be mapped to capability levels.
    // Given the override input in Step4FinalDesign is 0-100, we base it on that scale.
    // Negative scores will result in level 0.
    if (score < 15) return 0;
    if (score < 31) return 1;
    if (score < 51) return 2;
    if (score < 71) return 3;
    if (score < 91) return 4;
    return 5;
};

export const calculateSuggestedCapabilityLevel = (score: number): number => {
    if (score >= 75) return 4;
    if (score >= 50) return 3;
    if (score >= 25) return 2;
    return 1;
};


// Helper for Population Standard Deviation
const getStdDevP = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
};


export const calculateSummaryStatistics = (
  factor: DesignFactor,
  inputs: { [itemId: string]: number | { impact: number, likelihood: number } },
  baselines: { [key: string]: number }
): { average: number; stdDev: number; baselineRatio: number } | null => {
    
    if (!['rating', 'rating-1-3', 'rating-2d'].includes(factor.type)) {
        return null;
    }
    
    const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || [];
    if (!items || items.length === 0) return null;

    let userValues: number[] = [];

    if (factor.type === 'rating-2d') {
        userValues = items.map(item => {
            const val = inputs[item.id] as { impact: number, likelihood: number } || { impact: 3, likelihood: 3 };
            return val.impact * val.likelihood;
        });
    } else {
         userValues = items.map(item => {
            return (inputs[item.id] as number) || (factor.type === 'rating-1-3' ? 2 : 3);
        });
    }
    
    if (userValues.length === 0) return null;

    const userInputAverage = userValues.reduce((sum, val) => sum + val, 0) / userValues.length;
    const userInputStdDev = getStdDevP(userValues);
    
    let baselineValues: number[] = [];
    if (factor.id === 'df4') {
        baselineValues = new Array(items.length).fill(baselines['default'] || 2);
    } else if (factor.id === 'df3') {
        baselineValues = items.map(item => baselines[item.id] || 9);
    }
    else {
        baselineValues = items.map(item => baselines[item.id]).filter(v => v !== undefined);
    }
    
    if (baselineValues.length === 0) return {
        average: userInputAverage,
        stdDev: userInputStdDev,
        baselineRatio: 0,
    };
    
    const baselineAverage = baselineValues.reduce((sum, val) => sum + val, 0) / baselineValues.length;
    
    const baselineRatio = userInputAverage !== 0 ? baselineAverage / userInputAverage : 0;

    return {
        average: userInputAverage,
        stdDev: userInputStdDev,
        baselineRatio: baselineRatio,
    };
};

/**
 * Dispatcher function that calls the correct calculator based on the factor ID.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate.
 * @returns An array of ScoreResult for the single factor.
 */
export const calculateScoresForSingleFactor = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    if (!inputs[factorId]) {
        return GOVERNANCE_OBJECTIVES.map(obj => ({
            objectiveId: obj.id, objectiveName: obj.name, domain: obj.domain,
            rawScore: 0, normalizedScore: 0, finalScore: 0, capabilityLevel: 0,
            baselineScore: 0, relativeImportance: 0
        }));
    }

    switch (factorId) {
        case 'df1': return calculateDf1Scores(inputs);
        case 'df2': return calculateDf2Scores(inputs, factorId);
        case 'df3': return calculateDf3Scores(inputs, factorId);
        case 'df4': return calculateDf4Scores(inputs, factorId);
        case 'df5': return calculateDf5Scores(inputs, factorId);
        case 'df6': return calculateDf6Scores(inputs, factorId);
        case 'df7': return calculateDf7Scores(inputs, factorId);
        case 'df8': return calculateDf8Scores(inputs, factorId);
        case 'df9': return calculateDf9Scores(inputs, factorId);
        case 'df10': return calculateDf10Scores(inputs, factorId);
        default:
            // Fallback for an unknown factorId
            return GOVERNANCE_OBJECTIVES.map(obj => ({
                objectiveId: obj.id, objectiveName: obj.name, domain: obj.domain,
                rawScore: 0, normalizedScore: 0, finalScore: 0, capabilityLevel: 0,
                baselineScore: 0, relativeImportance: 0
            }));
    }
};

/**
 * Calculates the aggregated scores for a list of design factors.
 * @param inputs - The full UserInputs object.
 * @param factorIds - An array of factor IDs to include in the summary.
 * @param weights - An object mapping factor IDs to their weight multiplier.
 * @returns An array of aggregated ScoreResult.
 */
const calculateAggregatedScores = (inputs: UserInputs, factorIds: string[], weights: { [key: string]: number }): ScoreResult[] => {
    const aggregatedScores: { [objectiveId: string]: number } = {};
    GOVERNANCE_OBJECTIVES.forEach(obj => { aggregatedScores[obj.id] = 0; });

    // 1. Get results for each factor and aggregate scores
    factorIds.forEach(id => {
        const factorResults = calculateScoresForSingleFactor(inputs, id);
        const weight = weights[id] || 1;
        factorResults.forEach(res => {
            // UPDATED: Always use relativeImportance for a consistent percentage-based summary
            const scoreToAdd = res.relativeImportance;
            aggregatedScores[res.objectiveId] += (scoreToAdd * weight);
        });
    });

    // 2. Map aggregated scores to the final ScoreResult format
    return GOVERNANCE_OBJECTIVES.map(obj => {
        const totalScore = aggregatedScores[obj.id] || 0;
        return {
            objectiveId: obj.id,
            objectiveName: obj.name,
            domain: obj.domain,
            rawScore: totalScore,
            finalScore: Math.round(totalScore * 100) / 100,
            // These fields are not applicable for an aggregated summary view
            normalizedScore: 0, 
            baselineScore: 0,
            relativeImportance: 0,
            capabilityLevel: 0,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};


export const calculateSummaryStep2 = (inputs: UserInputs, weights: { [key: string]: number }): ScoreResult[] => {
    const factorIds = ['df1', 'df2', 'df3', 'df4'];
    // This gets the raw "Pre-Initial Scope" values in the `finalScore` property.
    const preInitialScopeResults = calculateAggregatedScores(inputs, factorIds, weights);

    const allPreInitialValues = preInitialScopeResults.map(r => r.finalScore);

    if (allPreInitialValues.length === 0) {
        return [];
    }
    
    // Step 1: Determine the Normalizer (Nilai_Pembagi)
    const maxVal = Math.max(...allPreInitialValues);
    const minVal = Math.min(...allPreInitialValues);
    const normalizer = Math.max(0, maxVal, Math.abs(minVal));

    // Step 2-5: Calculate final score for each objective
    return preInitialScopeResults.map(result => {
        const preInitialValue = result.finalScore; // This is the PreInitialScope_Value
        let finalScore = 0;

        try {
            // Step 5: Handle errors (division by zero)
            if (normalizer !== 0) {
                // Step 2: Calculate Normalized Score
                const normalizedScore = (preInitialValue / normalizer) * 100;
                
                // Step 3: Truncate
                const truncatedScore = Math.trunc(normalizedScore);
                
                // Step 4: Conditional Rounding to nearest 5
                // This formula works for both positive and negative values.
                finalScore = Math.round(truncatedScore / 5) * 5;
            }
        } catch (error) {
            // Fallback error handling
            console.error(`Error calculating initial scope for ${result.objectiveId}:`, error);
            finalScore = 0;
        }

        return {
            ...result,
            rawScore: preInitialValue, // Store the original pre-initial value
            finalScore: finalScore,
            normalizedScore: finalScore, // Keep consistent for charts
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};

export const calculateSummaryStep3 = (inputs: UserInputs, weights: { [key: string]: number }): ScoreResult[] => {
    // 1. Calculate "Pre-Refined Scope" for all 10 factors
    const allFactorIds = DESIGN_FACTORS.map(df => df.id);
    const preRefinedScopeResults = calculateAggregatedScores(inputs, allFactorIds, weights);

    const allPreRefinedValues = preRefinedScopeResults.map(r => r.finalScore);

    if (allPreRefinedValues.length === 0) {
        return [];
    }
    
    // 2. Determine the Normalizer
    const maxVal = Math.max(...allPreRefinedValues);
    const minVal = Math.min(...allPreRefinedValues);
    const normalizer = Math.max(0, maxVal, Math.abs(minVal));

    // 3-6. Calculate final score for each objective
    return preRefinedScopeResults.map(result => {
        const preRefinedValue = result.finalScore; // This is the PreRefinedScope_Value
        let finalScore = 0;

        try {
            // 6. Handle errors (division by zero)
            if (normalizer !== 0) {
                // 3. Calculate Normalized Score
                const normalizedScore = (preRefinedValue / normalizer) * 100;
                
                // 4. Truncate
                const truncatedScore = Math.trunc(normalizedScore);
                
                // 5. Conditional Rounding to nearest 5
                // This formula works for both positive and negative values.
                finalScore = Math.round(truncatedScore / 5) * 5;
            }
        } catch (error) {
            // Fallback error handling
            console.error(`Error calculating refined scope for ${result.objectiveId}:`, error);
            finalScore = 0;
        }
        
        const suggestedCapabilityLevel = calculateSuggestedCapabilityLevel(finalScore);

        return {
            ...result,
            rawScore: preRefinedValue, // Store the original pre-refined value
            finalScore: finalScore,
            normalizedScore: finalScore, // Keep consistent for charts
            suggestedCapabilityLevel: suggestedCapabilityLevel,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};