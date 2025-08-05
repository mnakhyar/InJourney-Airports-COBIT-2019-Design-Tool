import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTOR_BASELINES, OBJECTIVE_BASELINES, DESIGN_FACTORS } from '../../constants/cobitData';
import { DF2_MAPPING } from '../../constants/mappings/df2Mapping';

/**
 * Calculates the three core values for a single objective for Design Factor 2.
 * This logic mirrors the calculation for DF1.
 * @param df2Inputs - The user's input values for DF2.
 * @param objectiveId - The ID of the governance objective to calculate for.
 * @returns An object containing the weighted score, baseline score, and final relative score.
 */
const calculateDf2Values = (
  df2Inputs: { [key: string]: number },
  objectiveId: string
): { weightedScore: number, baselineScore: number, relativeScore: number } => {
  const df2FactorBaselines = DESIGN_FACTOR_BASELINES.df2;

  // 1. Calculate baseline_ratio
  const totalBaseline = Object.values(df2FactorBaselines).reduce((sum, val) => sum + val, 0);
  const totalUserInput = Object.values(df2Inputs).reduce((sum, val) => sum + val, 0);

  const baselineRatio = totalUserInput > 0 ? totalBaseline / totalUserInput : 0;

  // 2. Calculate weighted_input_score
  const weights = DF2_MAPPING[objectiveId];
  if (!weights) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };
  
  const factor = DESIGN_FACTORS.find(f => f.id === 'df2');
  if (!factor || !factor.categories) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };

  const weightedInputScore = factor.categories.reduce((sum, category) => {
    const egId = category.id;
    const weight = weights[egId as keyof typeof weights] || 0;
    const inputValue = df2Inputs[egId] || 3; // Default to 3
    return sum + (inputValue * weight);
  }, 0);


  // 3. Get objective_baseline
  const objectiveBaseline = OBJECTIVE_BASELINES[objectiveId]?.['df2'] || 0;

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
 * The main exported calculator for Design Factor 2.
 * It iterates through all objectives, calculates the specific DF2 scores,
 * and maps them to the ScoreResult interface.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor, should be 'df2'.
 * @returns An array of ScoreResult for DF2.
 */
export const calculateDf2Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
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
        const { weightedScore, baselineScore, relativeScore } = calculateDf2Values(completeFactorInputs, obj.id);
        
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
