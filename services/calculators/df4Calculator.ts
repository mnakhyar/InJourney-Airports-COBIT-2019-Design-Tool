import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS, DESIGN_FACTOR_BASELINES, OBJECTIVE_BASELINES } from '../../constants/cobitData';
import { DF4_MAPPING } from '../../constants/mappings/df4Mapping';


/**
 * Calculates the three core values for a single objective for Design Factor 4.
 * @param df4Inputs - The user's input values for DF4.
 * @param objectiveId - The ID of the governance objective to calculate for.
 * @returns An object containing the weighted score, baseline score, and final relative score.
 */
const calculateDf4Values = (
  df4Inputs: { [key: string]: number },
  objectiveId: string
): { weightedScore: number, baselineScore: number, relativeScore: number } => {
  const factor = DESIGN_FACTORS.find(f => f.id === 'df4');
  if (!factor || !factor.issues) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };
  
  const df4FactorBaselineValue = DESIGN_FACTOR_BASELINES.df4.default;

  // 1. Calculate baseline_ratio
  const totalBaseline = factor.issues.length * df4FactorBaselineValue;
  
  const totalUserInput = factor.issues.reduce((sum, issue) => {
    const userInput = df4Inputs[issue.id] || 2; // Default to 2 for DF4
    return sum + userInput;
  }, 0);

  const baselineRatio = totalUserInput > 0 ? totalBaseline / totalUserInput : 0;

  // 2. Calculate weighted_input_score
  const weights = DF4_MAPPING;
  let weightedInputScore = 0;

  factor.issues.forEach(issue => {
    const issueWeights = weights[issue.id];
    if(issueWeights && issueWeights[objectiveId]) {
        const rating = df4Inputs[issue.id] || 2; // Default to 2 for DF4
        weightedInputScore += rating * issueWeights[objectiveId];
    }
  });

  // 3. Get objective_baseline
  const objectiveBaseline = OBJECTIVE_BASELINES[objectiveId]?.['df4'] || 0;

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
 * Calculates scores for Design Factor 4.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate for (e.g., 'df4').
 * @returns An array of ScoreResult for the specified factor.
 */
export const calculateDf4Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factorInputs = (inputs[factorId] || {}) as { [key: string]: number };

    // Ensure all items have a default value if not present in inputs
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    const completeFactorInputs = { ...factorInputs };
    if (factor && factor.issues) {
        factor.issues.forEach(issue => {
            if (completeFactorInputs[issue.id] === undefined) {
                completeFactorInputs[issue.id] = 2; // Default rating of 2 for DF4
            }
        });
    }

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const { weightedScore, baselineScore, relativeScore } = calculateDf4Values(completeFactorInputs, obj.id);
        
        return {
            objectiveId: obj.id,
            objectiveName: obj.name,
            domain: obj.domain,
            // Per DF1 calculation style
            finalScore: Math.round(weightedScore * 100) / 100,
            baselineScore: baselineScore, 
            relativeImportance: relativeScore,
            // Other fields
            rawScore: weightedScore, 
            normalizedScore: 0,
            capabilityLevel: 0,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};
