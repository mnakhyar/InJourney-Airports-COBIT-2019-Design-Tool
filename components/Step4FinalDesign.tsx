import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScoreResult, UserInputs } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { getCapabilityLevel } from '../services/cobitCalculator';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface Step4Props {
  results: ScoreResult[];
  setResults: React.Dispatch<React.SetStateAction<ScoreResult[]>>;
  userInputs: UserInputs;
}

const Step4FinalDesign: React.FC<Step4Props> = ({ results, setResults, userInputs }) => {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState<{ key: keyof ScoreResult; direction: string }>({ key: 'finalScore', direction: 'descending' });
    
    const handleOverrideChange = (objectiveId: string, value: string) => {
        const newScore = value === '' ? undefined : parseInt(value, 10);
        if (newScore !== undefined && (isNaN(newScore) || newScore < 0 || newScore > 100)) {
            return;
        }

        setResults(prevResults =>
            prevResults.map(r =>
                r.objectiveId === objectiveId
                    ? { ...r, overrideScore: newScore, capabilityLevel: getCapabilityLevel(newScore ?? r.finalScore) }
                    : r
            )
        );
    };

    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        sortableItems.sort((a, b) => {
            const valA = a.overrideScore ?? a.finalScore;
            const valB = b.overrideScore ?? b.finalScore;
            
            if (sortConfig.key === 'finalScore') {
                 if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                 if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                 return 0;
            }

            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [results, sortConfig]);

    const requestSort = (key: keyof ScoreResult) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof ScoreResult) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };
    
    const handlePrint = () => {
        window.print();
    };


    if (!results || results.length === 0) {
       return (
             <div className="text-center p-12 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700">No Final Design Yet</h2>
                <p className="mt-2 text-gray-500">Please complete Steps 1-3 to see the final governance design.</p>
                <Button onClick={() => navigate('/refinement')} variant="primary" className="mt-6">
                    Go to Step 3
                </Button>
            </div>
        )
    }

    const chartData = sortedResults.map(r => ({ 
        subject: r.objectiveId, 
        Score: r.overrideScore ?? r.finalScore, 
    }));


    return (
        <div className="printable-area">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Step 4: Conclude Governance System Design</h2>
                    <p className="mt-2 text-gray-600">Review the final prioritized objectives. You can manually override scores and view recommended capability levels.</p>
                </div>
                 <Button onClick={handlePrint} variant="secondary">
                    &#x1F4BE; Save as PDF / Print Report
                </Button>
            </div>
            
             <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <Card title="Final Prioritized Objectives" description="The final list with calculated scores, manual overrides, and target capability levels.">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['ID', 'Name', 'Score', 'Override', 'Capability Level'].map((head, i) => (
                                            <th key={head} scope="col" onClick={() => requestSort(['objectiveId', 'objectiveName', 'finalScore', 'overrideScore', 'capabilityLevel'][i] as keyof ScoreResult)} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                                {head} {getSortIndicator(['objectiveId', 'objectiveName', 'finalScore', 'overrideScore', 'capabilityLevel'][i] as keyof ScoreResult)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedResults.map((result) => (
                                        <tr key={result.objectiveId}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.objectiveId}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{result.objectiveName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{result.finalScore}</td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={result.overrideScore ?? ''}
                                                    onChange={e => handleOverrideChange(result.objectiveId, e.target.value)}
                                                    className="w-20 p-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                                    placeholder={result.finalScore.toString()}
                                                />
                                            </td>
                                             <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-primary">{result.capabilityLevel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                     <Card title="Priorities Radar" description="A visual representation of the priority of all objectives.">
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8 }} />
                                <PolarRadiusAxis angle={30} domain={['auto', 'auto']}/>
                                <Radar name="Score" dataKey="Score" stroke="#0D47A1" fill="#1976D2" fillOpacity={0.6} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>
                 </div>
            </div>

             <div className="flex justify-between mt-8 print:hidden">
                <Button onClick={() => navigate('/refinement')} variant="outline">
                    &larr; Back to Step 3
                </Button>
            </div>
        </div>
    );
};

export default Step4FinalDesign;