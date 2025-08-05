import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTOR_BASELINES, OBJECTIVE_BASELINES } from '../../constants/cobitData';
import { DF1_MAPPING } from '../../constants/mappings/df1Mapping';

/**
 * Calculates the three core values for a single objective for Design Factor 1.
 * @param df1Inputs - The user's input values for DF1.
 * @param objectiveId - The ID of the governance objective to calculate for.
 * @returns An object containing the weighted score, baseline score, and final relative score.
 */
const calculateDf1Values = (
  df1Inputs: { [key: string]: number },
  objectiveId: string
): { weightedScore: number, baselineScore: number, relativeScore: number } => {
  const df1StrategyBaselines = DESIGN_FACTOR_BASELINES.df1;

  // 1. Calculate baseline_ratio
  const totalBaseline = Object.values(df1StrategyBaselines).reduce((sum, val) => sum + val, 0);
  const totalUserInput = Object.values(df1Inputs).reduce((sum, val) => sum + val, 0);

  const baselineRatio = totalUserInput > 0 ? totalBaseline / totalUserInput : 0;

  // 2. Calculate weighted_input_score
  const weights = DF1_MAPPING[objectiveId];
  if (!weights) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };

  const weightedInputScore = Object.keys(df1Inputs).reduce((sum, key) => {
    const weight = weights[key] || 0;
    const inputValue = df1Inputs[key] || 0;
    return sum + (inputValue * weight);
  }, 0);

  // 3. Get objective_baseline
  const objectiveBaseline = OBJECTIVE_BASELINES[objectiveId]?.['df1'] || 0;

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
 * The main exported calculator for Design Factor 1.
 * It iterates through all objectives, calculates the specific DF1 scores,
 * and maps them to the ScoreResult interface as requested.
 * @param inputs - The full UserInputs object.
 * @returns An array of ScoreResult for DF1.
 */
export const calculateDf1Scores = (inputs: UserInputs): ScoreResult[] => {
    const factorInputs = (inputs['df1'] || {}) as { [key: string]: number };

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const { weightedScore, baselineScore, relativeScore } = calculateDf1Values(factorInputs, obj.id);
        
        return {
            objectiveId: obj.id,
            objectiveName: obj.name,
            domain: obj.domain,
            // Per request: Map calculated values to specific output fields
            finalScore: weightedScore, // "Score" column shows the weighted score
            baselineScore: baselineScore, // "Baseline Score" column shows the objective baseline
            relativeImportance: relativeScore, // "Relative Importance" column shows the final calculated relative score
            // Other fields are not relevant for a single factor calculation
            rawScore: weightedScore, 
            normalizedScore: 0,
            capabilityLevel: 0,
        };
    }).sort((a, b) => b.finalScore - a.finalScore);
};