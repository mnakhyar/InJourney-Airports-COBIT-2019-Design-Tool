import { UserInputs, ScoreResult, DesignFactor } from '../../types';
import { GOVERNANCE_OBJECTIVES, MAPPING_TABLES, DESIGN_FACTORS, OBJECTIVE_BASELINES } from '../../constants/cobitData';


/**
 * Calculates scores for any Design Factor from 2 to 10.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate for (e.g., 'df2', 'df3').
 * @returns An array of ScoreResult for the specified factor.
 */
export const calculateGenericScores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    if (!factor) return [];

    const factorInputs = inputs[factor.id];
    if (!factorInputs) return [];

    const rawScores: { [objectiveId: string]: number } = {};
    GOVERNANCE_OBJECTIVES.forEach(obj => { rawScores[obj.id] = 0; });

    Object.keys(factorInputs).forEach(itemId => {
        const inputValue = factorInputs[itemId];
        let rating = 0;

        if (factor.type === 'rating-2d' && typeof inputValue === 'object' && inputValue !== null) {
            rating = inputValue.impact * inputValue.likelihood;
        } else if (typeof inputValue === 'number') {
            rating = inputValue;
            if (factor.type === 'percentage') {
                rating /= 100;
            }
        } else {
            return;
        }

        const mapping = MAPPING_TABLES[itemId];
        if (mapping) {
            Object.keys(mapping).forEach(objectiveId => {
                if (rawScores[objectiveId] !== undefined) {
                    const weight = mapping[objectiveId];
                    rawScores[objectiveId] += rating * weight;
                }
            });
        }
    });

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const rawScore = rawScores[obj.id] || 0;
        const finalScore = Math.round(rawScore * 100) / 100;

        const dfKey = factorId as keyof typeof OBJECTIVE_BASELINES[string];
        const baselineScore = OBJECTIVE_BASELINES[obj.id]?.[dfKey] || 0;
        const relativeImportance = baselineScore !== 0 ? finalScore / baselineScore : 0;
        
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
