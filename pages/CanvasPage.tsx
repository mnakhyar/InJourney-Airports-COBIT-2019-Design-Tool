import React, { useMemo, useState } from 'react';
import { UserInputs, ScoreResult } from '../types';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS } from '../constants/cobitData';
import { calculateScoresForSingleFactor, calculateSummaryStep2, calculateSummaryStep3, calculateSuggestedCapabilityLevel } from '../services/cobitCalculator';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface CanvasDataRow {
    id: string;
    name: string;
    domain: string;
    scores: { [key: string]: number };
}

interface CanvasInputs {
    [objectiveId: string]: {
        adjustment?: number;
        adjustmentReason?: string;
        agreedCapability?: number;
        capabilityReason?: string;
        // New fields from user request
        initialQuickScoring?: number;
        agreedFor5Years?: number;
        yearlyScore_1?: number;
        yearlyScore_2?: number;
        yearlyScore_3?: number;
        yearlyScore_4?: number;
        yearlyScore_5?: number;
    };
}

// Helper component for diverging bar charts (e.g., for scores)
const DivergingBarCell = ({ value, maxAbsValue }: { value: number, maxAbsValue: number }) => {
    if (maxAbsValue === 0) return <div className="text-center font-mono text-xs">0.00</div>;
    const width = (Math.abs(value) / maxAbsValue) * 50; // Use 50% of cell for each direction
    const color = value >= 0 ? 'bg-primary' : 'bg-red-500';

    return (
        <div className="relative h-6 w-full flex items-center justify-center" title={value.toFixed(2)}>
            <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300"></div>
            <div
                style={{
                    width: `${width}%`,
                    left: value >= 0 ? '50%' : 'auto',
                    right: value < 0 ? '50%' : 'auto',
                }}
                className={`absolute h-full ${color} opacity-70 rounded-sm`}
            ></div>
            <span className="relative z-10 px-1 text-xs font-semibold text-gray-800">{value.toFixed(2)}</span>
        </div>
    );
};

// Helper component for capability level bars
const CapabilityBarCell = ({ value, max = 5 }: { value: number, max?: number }) => {
    const width = (value / max) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-sm cursor-pointer" title={`Level ${value}`}>
            <div
                style={{ width: `${width}%` }}
                className="h-6 bg-accent rounded-sm text-white flex items-center justify-center text-xs font-bold"
            >
                {value}
            </div>
        </div>
    );
};

const getRelativeImportanceColor = (value: number) => {
    if (value < 0) {
        return 'text-red-600 font-bold';
    }
    // The value is a percentage deviation, e.g., 20, -15.
    // Convert to a ratio: 1.2, 0.85 to keep highlighting for strongly positive values.
    const ratio = (value / 100) + 1;
    return ratio > 1.1 ? 'text-primary-dark font-bold' : 'text-gray-600';
};


const CanvasPage: React.FC<{ allInputs: UserInputs }> = ({ allInputs }) => {
    const [canvasInputs, setCanvasInputs] = useState<CanvasInputs>({});
    const [editingCell, setEditingCell] = useState<string | null>(null);

    const defaultWeights = useMemo(() => DESIGN_FACTORS.reduce((acc, df) => {
        acc[df.id] = 1;
        return acc;
    }, {} as { [key: string]: number }), []);
    
    const [factorWeights, setFactorWeights] = useState<{[key:string]: number}>(defaultWeights);

    type CanvasInputFields = keyof CanvasInputs[string];
    
    const step5Cols: { id: CanvasInputFields; name: string; shortName: string; type: string; min: number; max: number; }[] = [
        { id: 'initialQuickScoring', name: 'Initial Quick Scoring', shortName: 'Initial Scoring', type: 'number', min: 1, max: 5 },
        { id: 'agreedFor5Years', name: 'Agreed for 5 years', shortName: 'Agreed 5yr', type: 'number', min: 1, max: 5 },
        { id: 'yearlyScore_1', name: '2025', shortName: '2025', type: 'number', min: 1, max: 5 },
        { id: 'yearlyScore_2', name: '2026', shortName: '2026', type: 'number', min: 1, max: 5 },
        { id: 'yearlyScore_3', name: '2027', shortName: '2027', type: 'number', min: 1, max: 5 },
        { id: 'yearlyScore_4', name: '2028', shortName: '2028', type: 'number', min: 1, max: 5 },
        { id: 'yearlyScore_5', name: '2029', shortName: '2029', type: 'number', min: 1, max: 5 },
    ];


    const handleWeightChange = (factorId: string, value: string) => {
        const numericValue = value === '' ? 0 : parseFloat(value);
        setFactorWeights(prev => ({
            ...prev,
            [factorId]: isNaN(numericValue) ? 0 : numericValue,
        }));
    };

    const handleInputChange = (objectiveId: string, field: keyof CanvasInputs[string], value: string | number) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        
        // Add validation for numeric fields based on user request
        if (field === 'adjustment') {
            if (!isNaN(numericValue) && (numericValue < -100 || numericValue > 100)) {
                return; // Do not update state if out of -100 to 100 range
            }
        }
        if (field === 'agreedCapability') {
            if (!isNaN(numericValue) && (numericValue < 1 || numericValue > 4)) {
                return; // Do not update state if out of 1 to 4 range
            }
        }
        // New validation block for the new fields
        if (['initialQuickScoring', 'agreedFor5Years', 'yearlyScore_1', 'yearlyScore_2', 'yearlyScore_3', 'yearlyScore_4', 'yearlyScore_5'].includes(field as string)) {
             if (!isNaN(numericValue) && (numericValue < 1 || numericValue > 5)) {
                return; // Do not update state if out of 1 to 5 range
            }
        }

        setCanvasInputs(prev => ({
            ...prev,
            [objectiveId]: {
                ...prev[objectiveId],
                [field]: typeof value === 'string' && field.includes('Reason') ? value : (isNaN(numericValue) ? undefined : numericValue)
            }
        }));
    };

    const { canvasData, maxInitialScope, maxRefinedScope, maxConcludedScope } = useMemo(() => {
        const dfScores: { [dfId: string]: ScoreResult[] } = {};
        DESIGN_FACTORS.forEach(df => {
            dfScores[df.id] = calculateScoresForSingleFactor(allInputs, df.id);
        });

        const initialScopeScores = calculateSummaryStep2(allInputs, factorWeights);
        const refinedScores = calculateSummaryStep3(allInputs, factorWeights);

        const data: CanvasDataRow[] = GOVERNANCE_OBJECTIVES.map(obj => {
            const row: CanvasDataRow = { id: obj.id, name: obj.name, domain: obj.domain, scores: {} };
            DESIGN_FACTORS.forEach(df => {
                const scoreResult = dfScores[df.id].find(r => r.objectiveId === obj.id);
                // Always use relativeImportance for a consistent percentage view
                row.scores[df.id] = scoreResult ? scoreResult.relativeImportance : 0;
            });
            const initialScopeResult = initialScopeScores.find(r => r.objectiveId === obj.id);
            row.scores['initialScope'] = initialScopeResult ? initialScopeResult.finalScore : 0;
            const refinedScopeResult = refinedScores.find(r => r.objectiveId === obj.id);
            row.scores['refinedScope'] = refinedScopeResult ? refinedScopeResult.finalScore : 0;
            return row;
        });

        const maxInitial = Math.max(1, ...data.map(r => Math.abs(r.scores['initialScope'])));
        const maxRefined = Math.max(1, ...data.map(r => Math.abs(r.scores['refinedScope'])));
        
        const concludedScores = data.map(row => (row.scores['refinedScope'] || 0) + (canvasInputs[row.id]?.adjustment ?? 0));
        const maxConcluded = Math.max(1, ...concludedScores.map(s => Math.abs(s)));

        return { canvasData: data, maxInitialScope: maxInitial, maxRefinedScope: maxRefined, maxConcludedScope: maxConcluded };
    }, [allInputs, canvasInputs, factorWeights]);

    const yearlyTargetSummaries = useMemo(() => {
        const summaries: { [key: string]: { sum: number, count: number } } = {};
        
        // Define the columns to calculate summary for
        const summaryColumns = [
            'suggestedCapability',
            'agreedCapability', 
            'initialQuickScoring',
            'agreedFor5Years',
            'yearlyScore_1', // 2025
            'yearlyScore_2', // 2026
            'yearlyScore_3', // 2027
            'yearlyScore_4', // 2028
            'yearlyScore_5'  // 2029
        ];
        
        summaryColumns.forEach(col => {
            summaries[col] = { sum: 0, count: 0 };
        });

        // Ensure we have allInputs data, if not use default values
        const hasAllInputs = allInputs && Object.keys(allInputs).length > 0;
        
        GOVERNANCE_OBJECTIVES.forEach(obj => {
            // Always calculate summary, even if no user inputs yet
            const inputsForObjective = canvasInputs[obj.id] || {};
            
            summaryColumns.forEach(col => {
                let value: number = 0; // Default fallback value
                
                try {
                    if (col === 'suggestedCapability') {
                        // Calculate suggested capability from concluded scope
                        let refinedScore = 0;
                        if (hasAllInputs) {
                            const df4Result = calculateScoresForSingleFactor(allInputs, 'df4').find(r => r.objectiveId === obj.id);
                            refinedScore = df4Result?.finalScore || 0;
                        }
                        const adjustment = inputsForObjective.adjustment ?? 0;
                        const concludedScope = refinedScore + adjustment;
                        value = calculateSuggestedCapabilityLevel(concludedScope);
                    } else if (col === 'agreedCapability') {
                        // Use suggested capability as default if no user input
                        let refinedScore = 0;
                        if (hasAllInputs) {
                            const df4Result = calculateScoresForSingleFactor(allInputs, 'df4').find(r => r.objectiveId === obj.id);
                            refinedScore = df4Result?.finalScore || 0;
                        }
                        const adjustment = inputsForObjective.adjustment ?? 0;
                        const concludedScope = refinedScore + adjustment;
                        const suggestedCapability = calculateSuggestedCapabilityLevel(concludedScope);
                        value = inputsForObjective.agreedCapability ?? suggestedCapability;
                    } else if (col === 'initialQuickScoring') {
                        // Only calculate if user has input a value
                        const initialValue = inputsForObjective.initialQuickScoring;
                        value = initialValue !== undefined && initialValue !== null ? initialValue : 0;
                    } else if (col === 'agreedFor5Years') {
                        // Use agreed capability value for agreed 5 years
                        let refinedScore = 0;
                        if (hasAllInputs) {
                            const df4Result = calculateScoresForSingleFactor(allInputs, 'df4').find(r => r.objectiveId === obj.id);
                            refinedScore = df4Result?.finalScore || 0;
                        }
                        const adjustment = inputsForObjective.adjustment ?? 0;
                        const concludedScope = refinedScore + adjustment;
                        const suggestedCapability = calculateSuggestedCapabilityLevel(concludedScope);
                        const agreedCapability = inputsForObjective.agreedCapability ?? suggestedCapability;
                        value = agreedCapability;
                    } else if (col.startsWith('yearlyScore_')) {
                        // Only calculate if user has input a value
                        const yearlyValue = inputsForObjective[col as keyof typeof inputsForObjective] as number | undefined;
                        value = yearlyValue !== undefined && yearlyValue !== null ? yearlyValue : 0;
                    }
                } catch (error) {
                    // If calculation fails, use default value
                    console.warn(`Error calculating value for ${obj.id}.${col}:`, error);
                    value = 2; // Default capability level
                }
                
                // Only add to summary if value is valid and user has input (for user-input columns)
                if (typeof value === 'number' && !isNaN(value)) {
                    if (col === 'initialQuickScoring' || col.startsWith('yearlyScore_')) {
                        // For user-input columns, only count if user has actually input a value
                        const userInputValue = inputsForObjective[col as keyof typeof inputsForObjective] as number | undefined;
                        if (userInputValue !== undefined && userInputValue !== null) {
                            summaries[col].sum += value;
                            summaries[col].count += 1;
                        }
                    } else {
                        // For auto-calculated columns, always count
                        summaries[col].sum += value;
                        summaries[col].count += 1;
                    }
                }
            });
        });

        const finalSummaries: { [key: string]: { average: number, count: number } } = {};
        summaryColumns.forEach(col => {
            const { sum, count } = summaries[col];
            finalSummaries[col] = {
                average: count > 0 ? sum / count : 0,
                count: count
            };
        });

        return finalSummaries;
    }, [canvasInputs, allInputs]);

    const handlePrint = () => window.print();
    
    const step2Cols = [
        ...DESIGN_FACTORS.slice(0, 4).map((df, i) => ({ id: df.id, name: `DF ${i+1}: ${df.name}`, shortName: `DF${i+1}`})),
        { id: 'initialScope', name: 'Initial Scope: Governance/Management Objective Scores', shortName: 'Initial Scope' }
    ];
    const step3Cols = [
        ...DESIGN_FACTORS.slice(4).map((df, i) => ({ id: df.id, name: `DF ${i+5}: ${df.name}`, shortName: `DF${i+5}`})),
        { id: 'refinedScope', name: 'Refined Scope: Governance/Management Objective Score', shortName: 'Refined Scope' }
    ];
    const step4Cols = [
      { id: 'adjustment', name: 'Adjustment', shortName: 'Adjustment', type: 'number', min: -100, max: 100 },
      { id: 'adjustmentReason', name: 'Reason for Adjustment', shortName: 'Reason', type: 'text' },
      { id: 'concludedScope', name: 'Concluded Scope: Objective Priority', shortName: 'Concluded Scope', type: 'calculated' },
      { id: 'suggestedCapability', name: 'Suggested Target Capability Level', shortName: 'Sugg. Capability', type: 'calculated' },
      { id: 'agreedCapability', name: 'Agreed Target Capability Level', shortName: 'Agreed Capability', type: 'number', min: 1, max: 4 },
      { id: 'capabilityReason', name: 'Reason for Capability', shortName: 'Reason', type: 'text' },
    ];
    

    return (
        <div className="printable-area">
             <div className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Governance Design Canvas</h2>
                    <p className="mt-2 text-lg text-gray-600">A comprehensive worksheet to finalize the governance system design.</p>
                </div>
                 <Button onClick={handlePrint} variant="primary">
                    &#x1F4BE; Save as PDF / Print Report
                </Button>
            </div>
            <div className="mt-8 card-print-avoid">
                <Card title="Consolidated Design Matrix" description="Scroll horizontally and vertically to view all data. Interactive fields in Step 4 allow for final adjustments.">
                    <div className="relative overflow-auto border border-gray-200 rounded-lg" style={{ maxHeight: '70vh' }}>
                        <table className="border-collapse text-xs">
                            <thead className="bg-gray-100">
                                <tr className="h-12">
                                    <th scope="col" rowSpan={2} className="sticky top-0 left-0 z-40 p-2 text-left font-medium text-gray-600 uppercase bg-gray-200 border-r border-b border-gray-300 w-96">Governance/Management Objective</th>
                                    <th scope="col" colSpan={step2Cols.length} className="sticky top-0 z-20 p-2 font-medium text-white uppercase bg-primary-dark border-b border-gray-300">Step 2: Determine initial scope</th>
                                    <th scope="col" colSpan={step3Cols.length} className="sticky top-0 z-20 p-2 font-medium text-white uppercase bg-accent border-b border-gray-300">Step 3: Refine the scope</th>
                                    <th scope="col" colSpan={step4Cols.length} className="sticky top-0 z-20 p-2 font-medium uppercase bg-secondary border-b border-gray-300 text-black">Step 4: Conclude the Scope</th>
                                    <th scope="col" colSpan={step5Cols.length} className="sticky top-0 z-20 p-2 font-medium text-white uppercase bg-purple-600 border-b border-gray-300">Target Tahunan</th>
                                </tr>
                                <tr className="h-10">
                                    {step2Cols.map(col => <th key={col.id} scope="col" className="sticky top-12 z-20 p-2 font-medium text-white uppercase bg-primary-light border-r border-b border-gray-300 min-w-[90px]" title={col.name}>{col.shortName}</th>)}
                                    {step3Cols.map(col => <th key={col.id} scope="col" className="sticky top-12 z-20 p-2 font-medium text-green-800 uppercase bg-green-200 border-r border-b border-gray-300 min-w-[90px]" title={col.name}>{col.shortName}</th>)}
                                    {step4Cols.map(col => <th key={col.id} scope="col" className="sticky top-12 z-20 p-2 font-medium text-yellow-800 uppercase bg-yellow-100 border-r border-b border-gray-300 min-w-[90px]" title={col.name}>{col.shortName}</th>)}
                                    {step5Cols.map(col => <th key={col.id} scope="col" className="sticky top-12 z-20 p-2 font-medium text-purple-800 uppercase bg-purple-100 border-r border-b border-gray-300 min-w-[90px]" title={col.name}>{col.shortName}</th>)}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr className="bg-gray-50">
                                    <th scope="row" className="sticky left-0 p-2 text-left align-middle w-96 bg-gray-100 border-r border-gray-300 z-30 font-bold uppercase text-gray-700">Weight</th>
                                    
                                    {/* DF1-4 Weight Inputs */}
                                    {DESIGN_FACTORS.slice(0, 4).map(df => (
                                        <td key={`${df.id}-weight`} className="p-1 whitespace-nowrap bg-blue-50 border-r border-gray-200">
                                            <input 
                                                type="number" 
                                                value={factorWeights[df.id]} 
                                                onChange={e => handleWeightChange(df.id, e.target.value)} 
                                                className="w-full p-1 border rounded text-center font-bold"
                                                step="0.1"
                                                min="0"
                                            />
                                        </td>
                                    ))}
                                    <td className="bg-blue-50 border-r border-gray-200"></td>

                                    {/* DF5-10 Weight Inputs */}
                                    {DESIGN_FACTORS.slice(4).map(df => (
                                        <td key={`${df.id}-weight`} className="p-1 whitespace-nowrap bg-green-50 border-r border-gray-200">
                                            <input 
                                                type="number" 
                                                value={factorWeights[df.id]} 
                                                onChange={e => handleWeightChange(df.id, e.target.value)} 
                                                className="w-full p-1 border rounded text-center font-bold"
                                                step="0.1"
                                                min="0"
                                            />
                                        </td>
                                    ))}
                                    <td className="bg-green-50 border-r border-gray-200"></td>
                                    <td colSpan={step4Cols.length} className="bg-yellow-50 border-r border-gray-200"></td>
                                    <td colSpan={step5Cols.length} className="bg-purple-50"></td>
                                </tr>
                                {canvasData.map((row) => {
                                    const refinedScore = row.scores['refinedScope'] || 0;
                                    const adjustment = canvasInputs[row.id]?.adjustment ?? 0;
                                    const concludedScope = refinedScore + adjustment;

                                    const suggestedCapability = calculateSuggestedCapabilityLevel(concludedScope);
                                    
                                    const agreedCapabilityCellId = `agreed-${row.id}`;
                                    const isEditingAgreedCapability = editingCell === agreedCapabilityCellId;
                                    const agreedCapabilityValue = canvasInputs[row.id]?.agreedCapability ?? suggestedCapability;

                                    return (
                                        <tr key={row.id}>
                                            <th scope="row" className="sticky left-0 p-2 text-left align-middle w-96 bg-white border-r border-gray-300 z-30">
                                                <div className="flex items-start">
                                                  <span className="font-medium text-gray-900 w-16">{row.id}</span>
                                                  <span className="text-gray-600 flex-1"> - {row.name}</span>
                                                </div>
                                            </th>
                                            
                                            {/* Step 2 Columns */}
                                            {DESIGN_FACTORS.slice(0, 4).map(df => <td key={df.id} className={`p-2 whitespace-nowrap text-center font-mono bg-blue-50 ${getRelativeImportanceColor(row.scores[df.id])}`}>{row.scores[df.id]?.toFixed(2)}</td>)}
                                            <td className="p-1 whitespace-nowrap text-center font-mono bg-blue-50"><DivergingBarCell value={row.scores['initialScope']} maxAbsValue={maxInitialScope} /></td>

                                            {/* Step 3 Columns */}
                                            {DESIGN_FACTORS.slice(4).map(df => <td key={df.id} className={`p-2 whitespace-nowrap text-center font-mono bg-green-50 ${getRelativeImportanceColor(row.scores[df.id])}`}>{row.scores[df.id]?.toFixed(2)}</td>)}
                                            <td className="p-1 whitespace-nowrap text-center font-mono bg-green-50 border-r border-gray-300"><DivergingBarCell value={refinedScore} maxAbsValue={maxRefinedScope} /></td>
                                            
                                            {/* Step 4 inputs */}
                                            <td className="p-1 whitespace-nowrap bg-yellow-50"><input type="number" min={-100} max={100} value={canvasInputs[row.id]?.adjustment ?? ''} onChange={e => handleInputChange(row.id, 'adjustment', e.target.value)} className="w-full p-1 border rounded" placeholder="0"/></td>
                                            <td className="p-1 whitespace-nowrap bg-yellow-50"><input type="text" value={canvasInputs[row.id]?.adjustmentReason ?? ''} onChange={e => handleInputChange(row.id, 'adjustmentReason', e.target.value)} className="w-full p-1 border rounded" /></td>
                                            <td className="p-1 whitespace-nowrap text-center font-mono font-bold bg-yellow-50"><DivergingBarCell value={concludedScope} maxAbsValue={maxConcludedScope} /></td>
                                            <td className="p-1 whitespace-nowrap text-center font-bold text-primary bg-yellow-50"><CapabilityBarCell value={suggestedCapability} max={4} /></td>
                                            <td className="p-1 whitespace-nowrap bg-yellow-50" onClick={() => !isEditingAgreedCapability && setEditingCell(agreedCapabilityCellId)}>
                                                {isEditingAgreedCapability ? (
                                                     <input 
                                                        type="number" 
                                                        min={1} max={4} step={1}
                                                        value={canvasInputs[row.id]?.agreedCapability ?? ''} 
                                                        onChange={e => handleInputChange(row.id, 'agreedCapability', e.target.value)} 
                                                        className="w-full p-1 border rounded text-center" 
                                                        placeholder={`${suggestedCapability}`}
                                                        onBlur={() => setEditingCell(null)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <CapabilityBarCell value={agreedCapabilityValue} max={4} />
                                                )}
                                            </td>
                                            <td className="p-1 whitespace-nowrap bg-yellow-50 border-r border-gray-300"><input type="text" value={canvasInputs[row.id]?.capabilityReason ?? ''} onChange={e => handleInputChange(row.id, 'capabilityReason', e.target.value)} className="w-full p-1 border rounded" /></td>
                                            
                                            {/* Step 5 inputs */}
                                            {step5Cols.map(col => {
                                                // For "Agreed 5yr" and "2029", use the same value as "Agreed Capability"
                                                let displayValue = (canvasInputs[row.id]?.[col.id] as number) ?? '';
                                                let isReadOnly = false;
                                                
                                                if (col.id === 'agreedFor5Years' || col.id === 'yearlyScore_5') {
                                                    displayValue = agreedCapabilityValue;
                                                    isReadOnly = true;
                                                } else if (col.id === 'yearlyScore_1') {
                                                    // 2025 follows Initial Score
                                                    const initialScore = canvasInputs[row.id]?.initialQuickScoring;
                                                    if (initialScore !== undefined && initialScore !== null) {
                                                        displayValue = initialScore;
                                                        isReadOnly = true;
                                                    }
                                                }
                                                
                                                return (
                                                    <td key={`${row.id}-${col.id}`} className="p-1 whitespace-nowrap bg-purple-50 border-r border-gray-200">
                                                        <input 
                                                            type="number" 
                                                            min={col.min} max={col.max}
                                                            value={displayValue} 
                                                            onChange={e => handleInputChange(row.id, col.id, e.target.value)} 
                                                            className={`w-full p-1 border rounded text-center ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            placeholder="-"
                                                            step="1"
                                                            readOnly={isReadOnly}
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-200 font-bold text-gray-700">
                                <tr>
                                    <th scope="row" className="sticky left-0 p-2 text-left align-middle w-96 bg-gray-200 border-r border-t border-gray-300 z-30">Score</th>
                                    <td colSpan={step2Cols.length + step3Cols.length} className="border-t border-gray-300"></td>
                                    {/* Step 4 columns summary */}
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">
                                        {yearlyTargetSummaries['suggestedCapability']?.average > 0 ? yearlyTargetSummaries['suggestedCapability'].average.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">
                                        {yearlyTargetSummaries['agreedCapability']?.average > 0 ? yearlyTargetSummaries['agreedCapability'].average.toFixed(2) : '-'}
                                    </td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-t border-gray-300">-</td>
                                    {/* Step 5 columns summary */}
                                    {step5Cols.map(col => {
                                        const summaryColumns = [
                                            'initialQuickScoring',
                                            'agreedFor5Years',
                                            'yearlyScore_1', // 2025
                                            'yearlyScore_2', // 2026
                                            'yearlyScore_3', // 2027
                                            'yearlyScore_4', // 2028
                                            'yearlyScore_5'  // 2029
                                        ];
                                        
                                        if (summaryColumns.includes(col.id)) {
                                            return (
                                                <td key={`summary-score-${col.id}`} className="p-2 whitespace-nowrap text-center bg-purple-200 border-r border-t border-gray-300">
                                                    {yearlyTargetSummaries[col.id]?.average > 0 ? yearlyTargetSummaries[col.id].average.toFixed(2) : '-'}
                                                </td>
                                            );
                                        } else {
                                            return (
                                                <td key={`summary-score-${col.id}`} className="p-2 whitespace-nowrap text-center bg-purple-200 border-r border-t border-gray-300">
                                                    -
                                                </td>
                                            );
                                        }
                                    })}
                                </tr>
                                <tr>
                                    <th scope="row" className="sticky left-0 p-2 text-left align-middle w-96 bg-gray-200 border-r border-gray-300 z-30">Gamo Num</th>
                                    <td colSpan={step2Cols.length + step3Cols.length}></td>
                                    {/* Step 4 columns summary */}
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">-</td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">
                                        {yearlyTargetSummaries['suggestedCapability']?.count > 0 ? yearlyTargetSummaries['suggestedCapability'].count : '-'}
                                    </td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">
                                        {yearlyTargetSummaries['agreedCapability']?.count > 0 ? yearlyTargetSummaries['agreedCapability'].count : '-'}
                                    </td>
                                    <td className="p-2 whitespace-nowrap text-center bg-yellow-200 border-r border-gray-200">-</td>
                                    {/* Step 5 columns summary */}
                                    {step5Cols.map(col => {
                                        const summaryColumns = [
                                            'initialQuickScoring',
                                            'agreedFor5Years',
                                            'yearlyScore_1', // 2025
                                            'yearlyScore_2', // 2026
                                            'yearlyScore_3', // 2027
                                            'yearlyScore_4', // 2028
                                            'yearlyScore_5'  // 2029
                                        ];
                                        
                                        if (summaryColumns.includes(col.id)) {
                                            return (
                                                <td key={`summary-count-${col.id}`} className="p-2 whitespace-nowrap text-center bg-purple-200 border-r border-gray-200">
                                                    {yearlyTargetSummaries[col.id]?.count > 0 ? yearlyTargetSummaries[col.id].count : '-'}
                                                </td>
                                            );
                                        } else {
                                            return (
                                                <td key={`summary-count-${col.id}`} className="p-2 whitespace-nowrap text-center bg-purple-200 border-r border-gray-200">
                                                    -
                                                </td>
                                            );
                                        }
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CanvasPage;