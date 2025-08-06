

import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { UserInputs, DesignFactor, ScoreResult } from '../types';
import { DESIGN_FACTORS, DESIGN_FACTOR_BASELINES } from '../constants/cobitData';
import { calculateScoresForSingleFactor, calculateSummaryStatistics } from '../services/cobitCalculator';
import Card from '../components/common/Card';
import Slider from '../components/common/Slider';
import PercentageGroup from '../components/PercentageGroup';
import ResultsDisplay from '../components/ResultsDisplay';
import InputVisualizer from '../components/InputVisualizer';
import SummaryStatistics from '../components/SummaryStatistics';

// Helper functions for Risk Profile colors and labels
const getImpactLikelihoodColor = (value: number): string => {
    switch (value) {
        case 1: return 'bg-green-500';
        case 2: return 'bg-green-300';
        case 3: return 'bg-yellow-400';
        case 4: return 'bg-orange-500';
        case 5: return 'bg-red-600';
        default: return 'bg-gray-200';
    }
};

const getRiskRatingInfo = (rating: number): { color: string; label: string } => {
    if (rating >= 1 && rating <= 3) return { color: 'bg-gray-700', label: 'Low Risk' };
    if (rating >= 4 && rating <= 8) return { color: 'bg-green-500', label: 'Normal Risk' };
    if (rating >= 9 && rating <= 15) return { color: 'bg-yellow-400', label: 'High Risk' };
    if (rating > 15) return { color: 'bg-red-600', label: 'Very High Risk' };
    return { color: 'bg-gray-200', label: 'N/A' };
};

const RiskLegend = () => (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="font-semibold text-gray-700 mb-3 text-lg">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Impact / Likelihood Scale</p>
                <div className="space-y-2">
                    {[
                        { value: 1, label: '1 (Very Low)' }, { value: 2, label: '2 (Low)' }, { value: 3, label: '3 (Medium)' }, { value: 4, label: '4 (High)' }, { value: 5, label: '5 (Very High)' }
                    ].map(item => (
                        <div key={`il-${item.value}`} className="flex items-center text-sm">
                            <span className={`w-4 h-4 rounded-full mr-2 ${getImpactLikelihoodColor(item.value)}`}></span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Risk Rating (Impact × Likelihood)</p>
                 <div className="space-y-2">
                    {[
                        { range: '1-3', info: getRiskRatingInfo(2) }, { range: '4-8', info: getRiskRatingInfo(6) }, { range: '9-15', info: getRiskRatingInfo(12) }, { range: '> 15', info: getRiskRatingInfo(20) }
                    ].map(item => (
                        <div key={`rr-${item.range}`} className="flex items-center text-sm">
                            <span className={`w-4 h-4 rounded-full mr-2 ${item.info.color}`}></span>
                            <span className="w-12 font-mono">{item.range}:</span>
                            <span>{item.info.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);


interface DesignFactorPageProps {
    allInputs: UserInputs;
    onInputChange: React.Dispatch<React.SetStateAction<UserInputs>>;
}

const DesignFactorPage: React.FC<DesignFactorPageProps> = ({ allInputs, onInputChange }) => {
    const { factorId } = useParams<{ factorId: string }>();
    const factor = DESIGN_FACTORS.find(df => df.id === factorId);

    const factorInputs = allInputs[factorId!] || {};

    const results = useMemo(() => {
        if (!factorId || !allInputs) return [];
        
        // Ensure all inputs have baseline values for missing data
        const effectiveInputs = { ...allInputs };
        const factor = DESIGN_FACTORS.find(df => df.id === factorId);
        if (factor) {
            const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
            const baselines = DESIGN_FACTOR_BASELINES[factor.id];
            
            if (!effectiveInputs[factor.id]) {
                effectiveInputs[factor.id] = {};
            }
            
            items.forEach(item => {
                if (effectiveInputs[factor.id][item.id] === undefined && baselines) {
                    if (factor.type === 'percentage') {
                        effectiveInputs[factor.id][item.id] = baselines[item.id] || 0;
                    } else if (factor.type === 'rating-1-3') {
                        effectiveInputs[factor.id][item.id] = baselines[item.id] || 2;
                    } else if (factor.type === 'rating-2d') {
                        effectiveInputs[factor.id][item.id] = { impact: 3, likelihood: 3 };
                    } else {
                        effectiveInputs[factor.id][item.id] = baselines[item.id] || 3;
                    }
                }
            });
        }
        
        return calculateScoresForSingleFactor(effectiveInputs, factorId);
    }, [allInputs, factorId]);

    const summaryStats = useMemo(() => {
        if (!factor) return null;
        const baselines = DESIGN_FACTOR_BASELINES[factor.id];
        if (!baselines) return null;
        
        // Use baseline values for missing inputs to ensure default scores are shown
        const effectiveInputs = { ...factorInputs };
        const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
        
        items.forEach(item => {
            if (effectiveInputs[item.id] === undefined) {
                if (factor.type === 'percentage') {
                    effectiveInputs[item.id] = baselines[item.id] || 0;
                } else if (factor.type === 'rating-1-3') {
                    effectiveInputs[item.id] = baselines[item.id] || 2;
                } else if (factor.type === 'rating-2d') {
                    effectiveInputs[item.id] = { impact: 3, likelihood: 3 };
                } else {
                    effectiveInputs[item.id] = baselines[item.id] || 3;
                }
            }
        });
        
        return calculateSummaryStatistics(factor, effectiveInputs, baselines);
    }, [factor, factorInputs]);

    if (!factor) {
        return <Navigate to="/" />;
    }

    const handleInputChange = (itemId: string, value: number | { impact: number, likelihood: number } | { [key: string]: number }) => {
        onInputChange(prev => {
            let newFactorInputs = { ...prev[factor.id] };
            if (factor.type === 'percentage') {
                 newFactorInputs = value as {[key:string]:number};
            } else {
                newFactorInputs[itemId] = value as any;
            }
            return { ...prev, [factor.id]: newFactorInputs };
        });
    };

    const renderInputs = () => {
        const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || [];
        switch (factor.type) {
            case 'rating':
            case 'rating-1-3':
                return (
                    <div>
                        {factor.id === 'df4' && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Legenda:</h4>
                                <div className="flex flex-wrap gap-4 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600">No Issue</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600">Issue</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600">Serius Issue</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {items.map(item => {
                            const baseline = factor.id === 'df4'
                                ? DESIGN_FACTOR_BASELINES.df4.default
                                : DESIGN_FACTOR_BASELINES[factor.id]?.[item.id];
                            const currentValue = (factorInputs[item.id] as number) || (factor.type === 'rating-1-3' ? 2 : 3);
                            
                            // Get symbol for DF4
                            const getSymbol = (value: number) => {
                                if (factor.id === 'df4') {
                                    switch (value) {
                                        case 1:
                                            return (
                                                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ml-2">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            );
                                        case 2:
                                            return (
                                                <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center ml-2">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            );
                                        case 3:
                                            return (
                                                <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center ml-2">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            );
                                        default:
                                            return null;
                                    }
                                }
                                return null;
                            };
                            
                                                         return (
                                 <div key={item.id} className="py-2 grid grid-cols-12 gap-2 items-center">
                                     <div className="col-span-12 sm:col-span-8">
                                         <label htmlFor={`${factor.id}-${item.id}`} className="block text-sm font-medium text-gray-700">{item.name}</label>
                                         <Slider
                                             id={`${factor.id}-${item.id}`}
                                             min={1}
                                             max={factor.type === 'rating-1-3' ? 3 : 5}
                                             value={currentValue}
                                             onChange={newValue => handleInputChange(item.id, newValue)}
                                         />
                                     </div>
                                     <div className="col-span-12 sm:col-span-2 flex justify-center items-center">
                                         {factor.id === 'df4' && getSymbol(currentValue)}
                                     </div>
                                     <div className="col-span-12 sm:col-span-2 text-center sm:border-l sm:pl-2 mt-2 sm:mt-0">
                                         {baseline !== undefined && (
                                             <>
                                                 <span className="text-xs text-gray-500 uppercase">Baseline</span>
                                                 <span className="block font-bold text-lg text-primary">{baseline}</span>
                                             </>
                                         )}
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                );
            case 'rating-2d':
                 return (
                    <div>
                        <div className="hidden md:grid md:grid-cols-12 gap-4 items-center mb-2 px-4 py-2 bg-gray-100 rounded-t-lg">
                            <div className="md:col-span-4 font-semibold text-gray-600 text-sm uppercase">Risk Scenario</div>
                            <div className="md:col-span-3 font-semibold text-gray-600 text-sm uppercase">Impact</div>
                            <div className="md:col-span-3 font-semibold text-gray-600 text-sm uppercase">Likelihood</div>
                            <div className="md:col-span-2 font-semibold text-gray-600 text-sm uppercase text-center">Value</div>
                        </div>
                        <div className="border border-gray-200 rounded-b-lg">
                        {items.map(item => {
                            const value = (factorInputs[item.id] as { impact: number, likelihood: number }) || { impact: 3, likelihood: 3 };
                            const riskRating = value.impact * value.likelihood;
                            const riskRatingInfo = getRiskRatingInfo(riskRating);
                            const baseline = DESIGN_FACTOR_BASELINES[factor.id]?.[item.id];
                            return (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-center border-t first:border-t-0 p-4 hover:bg-gray-50 transition-colors">
                                    <div className="md:col-span-4">
                                        <h4 className="text-md font-medium text-gray-800">{item.name}</h4>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label htmlFor={`${factor.id}-${item.id}-impact`} className="block text-sm font-medium text-gray-700 md:hidden">Impact</label>
                                        <Slider
                                            id={`${factor.id}-${item.id}-impact`}
                                            value={value.impact}
                                            indicatorColor={getImpactLikelihoodColor(value.impact)}
                                            onChange={newValue => handleInputChange(item.id, {...value, impact: newValue})}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                         <label htmlFor={`${factor.id}-${item.id}-likelihood`} className="block text-sm font-medium text-gray-700 md:hidden">Likelihood</label>
                                        <Slider
                                            id={`${factor.id}-${item.id}-likelihood`}
                                            value={value.likelihood}
                                            indicatorColor={getImpactLikelihoodColor(value.likelihood)}
                                            onChange={newValue => handleInputChange(item.id, {...value, likelihood: newValue})}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-around pt-2 md:pt-0">
                                        <div className="text-center">
                                            <span 
                                                className={`inline-block w-8 h-8 rounded-full ${riskRatingInfo.color} ring-2 ring-offset-2 ring-gray-200 transition-colors`}
                                                title={`${riskRatingInfo.label}: ${riskRating}`}
                                            ></span>
                                            <span className="block text-xs text-gray-500 mt-1.5 font-semibold">{riskRating}</span>
                                            <span className="block text-xs text-gray-500 font-semibold">Rating</span>
                                        </div>
                                         {baseline !== undefined && (
                                            <div className="text-center">
                                                <span className="font-bold text-lg text-primary">{baseline}</span>
                                                <span className="block text-xs text-gray-500 font-semibold">Baseline</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                        <RiskLegend />
                    </div>
                );
            case 'percentage':
                return <PercentageGroup 
                    options={factor.options || []}
                    values={factorInputs as {[key:string]:number}}
                    onChange={(newValues) => handleInputChange('', newValues)}
                    baselines={DESIGN_FACTOR_BASELINES[factor.id]}
                />;
            default:
                return <p>Input type not configured.</p>;
        }
    }

    const renderInputSection = () => {
        if (factor.id === 'df3') {
            return (
                <Card title="Input Section" description={factor.description}>
                    {renderInputs()}
                    <div className="mt-8 flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <InputVisualizer factor={factor} inputs={factorInputs} />
                    </div>
                </Card>
            );
        }

        return (
             <Card title="Input Section" description={factor.description}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 items-start">
                    <div className="space-y-1 divide-y divide-gray-100">
                        {renderInputs()}
                    </div>
                    <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <InputVisualizer factor={factor} inputs={factorInputs} />
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800">{factor.name}</h2>
            
            <div className="mt-6">
                {renderInputSection()}
            </div>
            
            {summaryStats && (
              <div className="mt-8">
                <SummaryStatistics stats={summaryStats} />
              </div>
            )}

            <div className="mt-8">
                 <ResultsDisplay 
                    title="Output Section: Impact Analysis"
                    description={`This shows the influence of *only* ${factor.name} on the 40 Governance and Management Objectives.`}
                    results={results}
                    factorId={factorId!}
                />
            </div>
        </div>
    );
};

export default DesignFactorPage;