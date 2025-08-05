

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
        return calculateScoresForSingleFactor(allInputs, factorId);
    }, [allInputs, factorId]);

    const summaryStats = useMemo(() => {
        if (!factor || !factorInputs) return null;
        const baselines = DESIGN_FACTOR_BASELINES[factor.id];
        if (!baselines) return null;
        
        return calculateSummaryStatistics(factor, factorInputs, baselines);
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
                return items.map(item => {
                    const baseline = factor.id === 'df4'
                        ? DESIGN_FACTOR_BASELINES.df4.default
                        : DESIGN_FACTOR_BASELINES[factor.id]?.[item.id];
                    return (
                        <div key={item.id} className="py-2 grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-12 sm:col-span-9">
                                <label htmlFor={`${factor.id}-${item.id}`} className="block text-sm font-medium text-gray-700">{item.name}</label>
                                <Slider
                                    id={`${factor.id}-${item.id}`}
                                    min={1}
                                    max={factor.type === 'rating-1-3' ? 3 : 5}
                                    value={(factorInputs[item.id] as number) || (factor.type === 'rating-1-3' ? 2 : 3)}
                                    onChange={newValue => handleInputChange(item.id, newValue)}
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-3 text-center sm:border-l sm:pl-4 mt-2 sm:mt-0">
                                {baseline !== undefined && (
                                    <>
                                        <span className="text-xs text-gray-500 uppercase">Baseline</span>
                                        <span className="block font-bold text-lg text-primary">{baseline}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                });
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