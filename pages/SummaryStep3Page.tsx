

import React, { useState, useMemo, useEffect } from 'react';
import { UserInputs, ScoreResult } from '../types';
import { calculateSummaryStep3 } from '../services/cobitCalculator';
import { GOVERNANCE_OBJECTIVES, DESIGN_FACTORS } from '../constants/cobitData';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, ReferenceLine, Cell } from 'recharts';


const DivergingBarChart = ({ data }: { data: any[] }) => {
    return (
        <ResponsiveContainer width="100%" height={data.length * 30}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={['auto', 'auto']} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} interval={0} />
                <Tooltip cursor={{ fill: 'rgba(230, 247, 255, 0.5)' }} />
                <Legend />
                <ReferenceLine y={0} stroke="#000" />
                <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
                <Bar dataKey="value" name="Score">
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.value < 0 ? '#FFC107' : '#1976D2'} />
                    ))}
                    <LabelList 
                        dataKey="value" 
                        position="right" 
                        formatter={(value: number) => value.toFixed(1)}
                        style={{ fill: '#000', fontSize: 12 }} 
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};


interface SummaryStep3PageProps {
    allInputs: UserInputs;
}

const SummaryStep3Page: React.FC<SummaryStep3PageProps> = ({ allInputs }) => {
    const [results, setResults] = useState<ScoreResult[]>([]);
    const [sortOrder, setSortOrder] = useState<'score' | 'id'>('score');

    const defaultWeights = useMemo(() => DESIGN_FACTORS.reduce((acc, df) => {
        acc[df.id] = 1;
        return acc;
    }, {} as { [key: string]: number }), []);

    useEffect(() => {
        setResults(calculateSummaryStep3(allInputs, defaultWeights));
    }, [allInputs, defaultWeights]);

    const handleOverrideChange = (objectiveId: string, value: string) => {
        const newScore = value === '' ? undefined : parseFloat(value);
        if (newScore !== undefined && isNaN(newScore)) return;

        setResults(prevResults =>
            prevResults.map(r =>
                r.objectiveId === objectiveId
                    ? { ...r, overrideScore: newScore }
                    : r
            )
        );
    };

    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        if (sortOrder === 'score') {
            sortableItems.sort((a, b) => {
                const valA = a.overrideScore ?? a.finalScore;
                const valB = b.overrideScore ?? b.finalScore;
                return valB - valA; // Descending score
            });
        } else { // sortOrder === 'id'
            const objectiveOrder = GOVERNANCE_OBJECTIVES.map(obj => obj.id);
            sortableItems.sort((a, b) => {
                return objectiveOrder.indexOf(a.objectiveId) - objectiveOrder.indexOf(b.objectiveId);
            });
        }
        return sortableItems;
    }, [results, sortOrder]);
    
    const chartData = useMemo(() => {
        // The chart should show all scores, sorted by score
        const allScores = [...results].sort((a,b) => (b.overrideScore ?? b.finalScore) - (a.overrideScore ?? a.finalScore));
        return allScores.map(r => ({ 
            name: r.objectiveId, 
            value: r.overrideScore ?? r.finalScore, 
        })).reverse();
    }, [results]);


    const handlePrint = () => window.print();

    return (
         <div className="printable-area">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 print-only">Governance System Design Report</h1>
            <div className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Step 3 Summary: Governance System Design</h2>
                    <p className="mt-2 text-lg text-gray-600">This is the consolidated design based on all 10 design factors. You can make manual adjustments and print the report.</p>
                </div>
                 <Button onClick={handlePrint} variant="secondary">
                    &#x1F4BE; Save as PDF / Print Report
                </Button>
            </div>
            
             <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 card-print-avoid">
                <div className="lg:col-span-2">
                     <Card title="Final Prioritized Objectives" description="Final scores are the direct sum of weighted inputs. They can be manually overridden.">
                        <div className="flex justify-end space-x-2 mb-4 no-print">
                            <Button onClick={() => setSortOrder('score')} variant={sortOrder === 'score' ? 'primary' : 'outline'} size="sm">Sort by Score</Button>
                            <Button onClick={() => setSortOrder('id')} variant={sortOrder === 'id' ? 'primary' : 'outline'} size="sm">Sort by ID</Button>
                        </div>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg" style={{maxHeight: '600px'}}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {['ID', 'Name', 'Final Score', 'Override'].map((head) => (
                                            <th key={head} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedResults.map((result) => (
                                        <tr key={result.objectiveId}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.objectiveId}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{result.objectiveName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{result.finalScore.toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={result.overrideScore ?? ''}
                                                    onChange={e => handleOverrideChange(result.objectiveId, e.target.value)}
                                                    className="w-24 p-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm no-print"
                                                    placeholder={result.finalScore.toFixed(2)}
                                                />
                                                <span className="print-only">{result.overrideScore?.toFixed(2) ?? result.finalScore.toFixed(2)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                 <div className="lg:col-span-1 card-print-avoid">
                     <Card title="Priorities Chart" description="A visual representation of all objectives.">
                         <div className="overflow-auto border border-gray-200 rounded-lg" style={{maxHeight: '600px'}}>
                            <DivergingBarChart data={chartData} />
                        </div>
                    </Card>
                 </div>
            </div>
        </div>
    );
};

export default SummaryStep3Page;