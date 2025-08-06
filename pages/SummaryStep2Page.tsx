

import React, { useMemo } from 'react';
import { UserInputs, ScoreResult } from '../types';
import { calculateSummaryStep2 } from '../services/cobitCalculator';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, ReferenceLine, Cell } from 'recharts';
import { DESIGN_FACTORS } from '../constants/cobitData';

interface SummaryStep2PageProps {
    allInputs: UserInputs;
}

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

const SummaryStep2Page: React.FC<SummaryStep2PageProps> = ({ allInputs }) => {
    const navigate = useNavigate();
    const defaultWeights = useMemo(() => DESIGN_FACTORS.reduce((acc, df) => {
        acc[df.id] = 1;
        return acc;
    }, {} as { [key: string]: number }), []);

    const results = useMemo(() => calculateSummaryStep2(allInputs, defaultWeights), [allInputs, defaultWeights]);
    
    const chartData = results.map(r => ({ name: r.objectiveId, value: r.finalScore })).reverse();

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Step 2 Summary: Initial Scope</h2>
            <p className="mt-2 text-lg text-gray-600">
                This summary combines the results from your inputs for Enterprise Strategy (DF1), Enterprise Goals (DF2), Risk Profile (DF3), and I&T-Related Issues (DF4) to determine the initial priority of objectives.
            </p>

            <div className="mt-8">
                <Card title="Prioritized Objectives Chart" description="Overall priority scores for all 40 objectives. Scores are the direct sum of weighted inputs and can be negative.">
                    <div className="overflow-auto border border-gray-200 rounded-lg" style={{maxHeight: '600px'}}>
                        <DivergingBarChart data={chartData} />
                    </div>
                </Card>
            </div>
            
            <div className="flex justify-end mt-8">
                <Button onClick={() => navigate('/design-factor/df5')}>
                    Continue to Scope Refinement (DF5) &rarr;
                </Button>
            </div>
        </div>
    );
};

export default SummaryStep2Page;