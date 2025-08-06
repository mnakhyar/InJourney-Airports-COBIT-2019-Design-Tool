
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScoreResult } from '../types';
import Button from './common/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Step2Props {
  results: ScoreResult[];
}

const Step2InitialScope: React.FC<Step2Props> = ({ results }) => {
    const navigate = useNavigate();
    const [sortConfig, setSortConfig] = useState<{ key: keyof ScoreResult; direction: string }>({ key: 'normalizedScore', direction: 'descending' });

    const sortedResults = useMemo(() => {
        let sortableItems = [...results];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
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

    if (!results || results.length === 0) {
        return (
             <div className="text-center p-12 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-700">No Results Yet</h2>
                <p className="mt-2 text-gray-500">Please complete Step 1 to see the initial scope calculation.</p>
                <Button onClick={() => navigate('/')} variant="primary" className="mt-6">
                    Go to Step 1
                </Button>
            </div>
        )
    }

    const chartData = sortedResults.slice(0, 15).map(r => ({ name: r.objectiveId, Score: r.normalizedScore }));

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Step 2: Initial Scope of Governance System</h2>
            <p className="mt-2 text-gray-600">Based on your inputs, here is the initial prioritization of the 40 governance and management objectives.</p>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 15 Prioritized Objectives</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip cursor={{fill: 'rgba(230, 247, 255, 0.5)'}}/>
                        <Legend />
                        <Bar dataKey="Score" fill="#1976D2" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Full List of Objectives</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID', 'Name', 'Domain', 'Score'].map((head, i) => (
                                     <th key={head} scope="col" onClick={() => requestSort(['objectiveId', 'objectiveName', 'domain', 'normalizedScore'][i] as keyof ScoreResult)} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                        {head} {getSortIndicator(['objectiveId', 'objectiveName', 'domain', 'normalizedScore'][i] as keyof ScoreResult)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedResults.map((result) => (
                                <tr key={result.objectiveId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.objectiveId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.objectiveName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.domain}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${result.normalizedScore}%` }}></div>
                                            </div>
                                            <span className="ml-3">{result.normalizedScore}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div className="flex justify-between mt-8">
                <Button onClick={() => navigate('/')} variant="outline">
                    &larr; Back to Step 1
                </Button>
                <Button onClick={() => navigate('/refinement')}>
                    Refine Scope &rarr;
                </Button>
            </div>
        </div>
    );
};

export default Step2InitialScope;
