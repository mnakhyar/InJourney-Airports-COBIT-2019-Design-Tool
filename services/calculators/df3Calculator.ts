import { UserInputs, ScoreResult } from '../../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS, DESIGN_FACTOR_BASELINES, OBJECTIVE_BASELINES } from '../../constants/cobitData';
import { DF3_MAPPING } from '../../constants/mappings/df3Mapping';

/**
 * Calculates the three core values for a single objective for Design Factor 3.
 * @param df3Inputs - The user's input values for DF3.
 * @param objectiveId - The ID of the governance objective to calculate for.
 * @returns An object containing the weighted score, baseline score, and final relative score.
 */
const calculateDf3Values = (
  df3Inputs: { [key: string]: { impact: number, likelihood: number } },
  objectiveId: string
): { weightedScore: number, baselineScore: number, relativeScore: number } => {
  const factor = DESIGN_FACTORS.find(f => f.id === 'df3');
  if (!factor || !factor.riskScenarios) return { weightedScore: 0, baselineScore: 0, relativeScore: 0 };

  const df3FactorBaselines = DESIGN_FACTOR_BASELINES.df3;

  // 1. Calculate baseline_ratio
  const totalBaseline = factor.riskScenarios.reduce((sum, scenario) => sum + (df3FactorBaselines[scenario.id] || 9), 0);
  
  const totalUserInput = factor.riskScenarios.reduce((sum, scenario) => {
    const userInput = df3Inputs[scenario.id] || { impact: 3, likelihood: 3 };
    return sum + (userInput.impact * userInput.likelihood);
  }, 0);

  const baselineRatio = totalUserInput > 0 ? totalBaseline / totalUserInput : 0;

  // 2. Calculate weighted_input_score
  const weights = DF3_MAPPING;
  let weightedInputScore = 0;
  factor.riskScenarios.forEach(scenario => {
    const scenarioWeights = weights[scenario.id];
    if (scenarioWeights && scenarioWeights[objectiveId]) {
      const userInput = df3Inputs[scenario.id] || { impact: 3, likelihood: 3 };
      const rating = userInput.impact * userInput.likelihood;
      weightedInputScore += rating * scenarioWeights[objectiveId];
    }
  });


  // 3. Get objective_baseline
  const objectiveBaseline = OBJECTIVE_BASELINES[objectiveId]?.['df3'] || 0;

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
 * Calculates scores for Design Factor 3.
 * @param inputs - The full UserInputs object.
 * @param factorId - The ID of the factor to calculate for (should be 'df3').
 * @returns An array of ScoreResult for the specified factor.
 */
export const calculateDf3Scores = (inputs: UserInputs, factorId: string): ScoreResult[] => {
    const factorInputs = (inputs[factorId] || {}) as { [key: string]: { impact: number, likelihood: number } };

    // Ensure all items have a default value if not present in inputs
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    const completeFactorInputs = { ...factorInputs };
    if (factor && factor.riskScenarios) {
        factor.riskScenarios.forEach(scenario => {
            if (completeFactorInputs[scenario.id] === undefined) {
                completeFactorInputs[scenario.id] = { impact: 3, likelihood: 3 };
            }
        });
    }

    return GOVERNANCE_OBJECTIVES.map(obj => {
        const { weightedScore, baselineScore, relativeScore } = calculateDf3Values(completeFactorInputs, obj.id);
        
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
