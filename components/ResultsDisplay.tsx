import React, { useState, useMemo } from 'react';
import { ScoreResult } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GOVERNANCE_OBJECTIVES } from '../constants/cobitData';


interface ResultsDisplayProps {
    title: string;
    description: string;
    results: ScoreResult[];
    factorId: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ title, description, results, factorId }) => {
    const [sortOrder, setSortOrder] = useState<'score' | 'id'>('score');

    const neutralValue = 0; // All DFs now use percentage deviation centered at 0

    // Memoize sorted results for the table
    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        if (sortOrder === 'id') {
            const objectiveOrder = GOVERNANCE_OBJECTIVES.map(obj => obj.id);
            sortableItems.sort((a, b) => objectiveOrder.indexOf(a.objectiveId) - objectiveOrder.indexOf(b.objectiveId));
        } else { // 'score'
            // Sort by Relative Importance, descending
            sortableItems.sort((a, b) => b.relativeImportance - a.relativeImportance);
        }
        return sortableItems;
    }, [results, sortOrder]);

    // Memoize data for the bar chart (all objectives)
    const barChartData = useMemo(() => {
        return sortedResults.map(r => ({
            name: r.objectiveId,
            "Relative Importance": r.relativeImportance,
        })).reverse();
    }, [sortedResults]);

    // Memoize data for the radar chart (all 40 objectives)
    const radarChartData = useMemo(() => {
        return sortedResults.map(result => ({
            subject: result.objectiveId,
            "Importance (%)": result.relativeImportance,
        }));
    }, [sortedResults]);


    return (
        <Card title={title} description={description}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Table */}
                <div className="lg:col-span-1">
                     <div className="flex justify-end space-x-2 mb-4">
                        <Button onClick={() => setSortOrder('score')} variant={sortOrder === 'score' ? 'primary' : 'outline'} size="sm">Sort by Importance</Button>
                        <Button onClick={() => setSortOrder('id')} variant={sortOrder === 'id' ? 'primary' : 'outline'} size="sm">Sort by ID</Button>
                     </div>
                     <div className="overflow-x-auto border border-gray-200 rounded-lg" style={{maxHeight: '550px'}}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Governing Objective</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Baseline Score</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Relative Importance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedResults.map((result) => (
                                    <tr key={result.objectiveId}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                            <span className="font-bold text-gray-900">{result.objectiveId}</span> - {result.objectiveName}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-semibold w-24 text-right font-mono">
                                           {result.finalScore.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 w-24 text-right font-mono">
                                           {result.baselineScore.toFixed(2)}
                                        </td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold w-24 text-right font-mono ${result.relativeImportance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                           {result.relativeImportance.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Right Column: Charts */}
                <div className="lg:col-span-1 space-y-8">
                     <div>
                        <h4 className="font-semibold text-center text-gray-700 mb-2">Objectives by Relative Importance</h4>
                        <div className="overflow-auto border border-gray-200 rounded-lg" style={{maxHeight: '550px'}}>
                            <ResponsiveContainer width="100%" height={results.length * 30}>
                               <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={['auto', 'auto']} />
                                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine x={neutralValue} stroke="#666" strokeDasharray="3 3" />
                                    <Bar dataKey="Relative Importance">
                                         {barChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry['Relative Importance'] < neutralValue ? '#F44336' : '#1976D2'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-center text-gray-700 mb-2">Objective-level Importance Analysis</h4>
                         <ResponsiveContainer width="100%" height={400}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 8}} />
                                <PolarRadiusAxis angle={30} domain={[-100, 100]} />
                                <Radar name="Importance (%)" dataKey="Importance (%)" stroke="#0D47A1" fill="#1976D2" fillOpacity={0.6} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                <Legend wrapperStyle={{fontSize: "12px"}} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ResultsDisplay;