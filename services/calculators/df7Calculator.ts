import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTOR_BASELINES, OBJECTIVE_BASELINES, DESIGN_FACTORS } from '../../constants/cobitData';
import { DF7_MAPPING } from '../../constants/mappings/df7Mapping';

/**
 * Calculates the three core values for a single objective for Design Factor 7.
 * This logic mirrors the calculation for DF1.
 * @param df7Inputs - The user's input values for DF7.
 * @param objectiveId - The ID of the governance objective to calculate for.
 * @returns An object containing the weighted score, baseline score, and final relative score.
 */
const calculateDf7Values = (
  df7Inputs: { [key: string]: number },
  objectiveId: string
): { weightedScore: number, baselineScore: number, relativeScore: number } => {
  const df7FactorBaselines = DESIGN_FACTOR_BASELINES.df7;

  // 1. Calculate baseline_ratio
  const totalBaseline = Object.values(df7FactorBaselines).reduce((sum, val) => sum + val, 0);
  const totalUserInput = Object.values(df7Inputs).reduce((sum, val) => sum + val, 0);

  const baselineRatio = totalUserInput > 0 ? totalBaseline / totalUserInput : 0;

  // 2. Calculate weighted_input_score
  const weights = DF7_MAPPING[objectiveId];
  if (!weights) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };
  
  const factor = DESIGN_FACTORS.find(f => f.id === 'df7');
  if (!factor || !factor.categories) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };

  // Use factor.categories to ensure we're using the correct IDs ('support', 'factory', etc.)
  const weightedInputScore = factor.categories.reduce((sum, category) => {
    // The weight key is the capitalized name, e.g., 'Support'
    const weightKey = category.name as keyof typeof weights;
    const weight = weights[weightKey] || 0;
    // The input key is the lowercase id, e.g., 'support'
    const inputValue = df7Inputs[category.id] || 3; // Default to 3
    return sum + (inputValue * weight);
  }, 0);

  // 3. Get objective_baseline
  const objectiveBaseline = OBJECTIVE_BASELINES[objectiveId]?.['df7'] || 0;

  // 4. Calculate final relative_score
  let relativeScore = 0;
  if (objectiveBaseline > 0) {
      const intermediateResult = (baselineRatio * 100 * weightedInputScore) / objectiveBaseline;
      const roundedToNearest5 = Math.round(intermediateResult / 5) * 5;
      relativeScore = roundedToNearest5 - 100;
  }

  return { 
    weightedScore: weightedInputScore,
    baselineScore: objectiveBaseline, 
    relativeScore: relativeScore
  };
};


/**
 * The main exported calculator for Design Factor 7.
 * It iterates through all objectives, calculates the specific DF7 scores,
 * and maps them to the ScoreResult interface.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor, should be 'df7'.
 * @returns An array of ScoreResult for DF7.
 */
export const calculateDf7Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factorInputs = (inputs[factorId] || {}) as { [key: string]: number };

    // Ensure all categories have a default value if not present in inputs
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    const completeFactorInputs = {...factorInputs};
    if (factor && factor.categories) {
        factor.categories.forEach(cat => {
            if (completeFactorInputs[cat.id] === undefined) {
                completeFactorInputs[cat.id] = 3; // Default rating of 3
            }
        });
    }

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const { weightedScore, baselineScore, relativeScore } = calculateDf7Values(completeFactorInputs, obj.id);
        
        return {
            objectiveId: obj.id,
            objectiveName: obj.name,
            domain: obj.domain,
            // Mirroring DF1 structure:
            finalScore: Math.round(weightedScore * 100) / 100,
            baselineScore: baselineScore, 
            relativeImportance: relativeScore,
            rawScore: weightedScore, 
            normalizedScore: 0,
            capabilityLevel: 0,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};