
import React from 'react';
import { DesignFactor } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, LabelList } from 'recharts';

interface InputVisualizerProps {
    factor: DesignFactor;
    inputs: { [itemId: string]: number | { impact: number, likelihood: number } };
}

const COLORS = ['#0D47A1', '#1976D2', '#FFC107', '#4CAF50', '#F44336', '#9C27B0', '#009688', '#795548'];

const InputVisualizer: React.FC<InputVisualizerProps> = ({ factor, inputs }) => {
    
    const allItems = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];

    const getItemName = (id: string) => {
        const item = allItems.find(i => i.id === id);
        // Shorten long names for charts
        if (item) {
            if(item.name.includes('—')) return item.name.split('—')[0];
            if(item.name.length > 30) return item.name.substring(0, 27) + '...';
            return item.name;
        }
        return id;
    };
    
    const renderClusteredBarChart = (data: any[]) => {
        return (
            <ResponsiveContainer width="100%" height={data.length * 45 < 300 ? 300 : data.length * 45}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <YAxis type="category" dataKey="name" width={200} tick={{fontSize: 12}} interval={0} />
                    <XAxis type="number" domain={[0, 5]} allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Bar dataKey="Impact" fill="#1976D2">
                        <LabelList dataKey="Impact" position="right" style={{ fill: 'black', fontSize: 12 }} />
                    </Bar>
                    <Bar dataKey="Likelihood" fill="#FFC107">
                        <LabelList dataKey="Likelihood" position="right" style={{ fill: 'black', fontSize: 12 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    const renderBarChart = (data: any[], domainMax: number) => {
        return (
            <ResponsiveContainer width="100%" height={data.length * 35 < 300 ? 300 : data.length * 35}>
                 <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <YAxis type="category" dataKey="name" tick={{fontSize: 12}} width={factor.id === 'df4' ? 150 : 100} interval={0}/>
                    <XAxis type="number" domain={[0, domainMax]} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1976D2" barSize={20}>
                        <LabelList dataKey="value" position="right" style={{ fill: 'black', fontSize: 12 }} />
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    }
    
    const renderRadarChart = (data: any[], domainMax: number) => {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 12}} />
                    <PolarRadiusAxis angle={30} domain={[0, domainMax]} allowDecimals={false}/>
                    <Radar name="Rating" dataKey="value" stroke="#0D47A1" fill="#1976D2" fillOpacity={0.6} />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        );
    }

    const renderPieChart = (data: any[]) => {
         return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(0)}%`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    switch (factor.id) {
        case 'df1':
        case 'df2': {
             const data = Object.entries(inputs).map(([id, value]) => ({ name: getItemName(id), value: value as number, subject: getItemName(id) }));
             return (
                <div className="w-full">
                    <h4 className="text-center font-semibold text-gray-700 mb-2">Input Ratings (Bar)</h4>
                    {renderBarChart(data, 5)}
                    <h4 className="text-center font-semibold text-gray-700 mt-6 mb-2">Input Ratings (Radar)</h4>
                    {renderRadarChart(data, 5)}
                </div>
             );
        }
        case 'df3': {
            const data = Object.entries(inputs).map(([id, val]) => {
                const value = val as { impact: number, likelihood: number };
                return { name: getItemName(id), Impact: value.impact, Likelihood: value.likelihood };
            });
            return (
                 <div className="w-full">
                    <h4 className="text-center font-semibold text-gray-700 mb-2">Risk Profile Inputs</h4>
                    {renderClusteredBarChart(data)}
                </div>
            )
        }
         case 'df4':
         case 'df7': {
            const domainMax = factor.id === 'df4' ? 3 : 5;
            const data = Object.entries(inputs).map(([id, value]) => ({ name: getItemName(id), value: value as number }));
            return (
                 <div className="w-full">
                    <h4 className="text-center font-semibold text-gray-700 mb-2">Input Ratings</h4>
                    {renderBarChart(data, domainMax)}
                </div>
            )
         }
        case 'df5':
        case 'df6':
        case 'df8':
        case 'df9':
        case 'df10': {
             const data = Object.entries(inputs).map(([id, value]) => ({ name: getItemName(id), value: value as number }));
             return (
                 <div className="w-full">
                    <h4 className="text-center font-semibold text-gray-700 mb-2">Input Distribution</h4>
                    {renderPieChart(data)}
                </div>
             )
        }
        default:
            return null;
    }
};

export default InputVisualizer;