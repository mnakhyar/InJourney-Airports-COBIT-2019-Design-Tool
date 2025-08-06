
import React from 'react';
import { DesignFactor } from '../types';
import { DESIGN_FACTOR_BASELINES } from '../constants/cobitData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, LabelList } from 'recharts';

interface InputVisualizerProps {
    factor: DesignFactor;
    inputs: { [itemId: string]: number | { impact: number, likelihood: number } };
}

const COLORS = ['#0D47A1', '#1976D2', '#FFC107', '#4CAF50', '#F44336', '#9C27B0', '#009688', '#795548'];

const InputVisualizer: React.FC<InputVisualizerProps> = ({ factor, inputs }) => {
    
    const allItems = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
    
    // Get baseline values for the factor
    const baselineValues = DESIGN_FACTOR_BASELINES[factor.id] || {};
    
    // Create data with baseline values as fallback
    const createDataWithBaseline = () => {
        const data: any[] = [];
        
        allItems.forEach(item => {
            let value: number;
            
            if (inputs[item.id] !== undefined) {
                // Use user input if available
                if (typeof inputs[item.id] === 'number') {
                    value = inputs[item.id] as number;
                } else if (typeof inputs[item.id] === 'object' && inputs[item.id] !== null) {
                    // For 2D ratings (impact * likelihood)
                    const twoDValue = inputs[item.id] as { impact: number, likelihood: number };
                    value = twoDValue.impact * twoDValue.likelihood;
                } else {
                    value = 0;
                }
            } else {
                // Use baseline value as fallback
                if (factor.id === 'df4') {
                    value = baselineValues.default || 2;
                } else if (factor.id === 'df3') {
                    value = baselineValues[item.id] || 9;
                } else {
                    value = baselineValues[item.id] || 3;
                }
            }
            
            data.push({
                name: getItemName(item.id),
                value: value,
                subject: getItemName(item.id)
            });
        });
        
        return data;
    };
    
    // Create 2D data for risk profile
    const create2DDataWithBaseline = () => {
        const data: any[] = [];
        
        allItems.forEach(item => {
            let impact: number, likelihood: number;
            
            if (inputs[item.id] !== undefined && typeof inputs[item.id] === 'object' && inputs[item.id] !== null) {
                const twoDValue = inputs[item.id] as { impact: number, likelihood: number };
                impact = twoDValue.impact;
                likelihood = twoDValue.likelihood;
            } else {
                // Use baseline values (default to 3 for both)
                impact = 3;
                likelihood = 3;
            }
            
            data.push({
                name: getItemName(item.id),
                Impact: impact,
                Likelihood: likelihood
            });
        });
        
        return data;
    };
    
    // Create percentage data for distribution factors
    const createPercentageDataWithBaseline = () => {
        const data: any[] = [];
        
        allItems.forEach(item => {
            let value: number;
            
            if (inputs[item.id] !== undefined) {
                value = inputs[item.id] as number;
            } else {
                // Use baseline percentage values
                value = baselineValues[item.id] || 0;
            }
            
            data.push({
                name: getItemName(item.id),
                value: value
            });
        });
        
        return data;
    };

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
             const data = createDataWithBaseline();
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
            const data = create2DDataWithBaseline();
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
            const data = createDataWithBaseline();
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
             const data = createPercentageDataWithBaseline();
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