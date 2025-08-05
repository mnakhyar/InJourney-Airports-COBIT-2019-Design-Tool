
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInputs, DesignFactor } from '../types';
import { DESIGN_FACTORS } from '../constants/cobitData';
import Card from './common/Card';
import Slider from './common/Slider';
import Button from './common/Button';

interface Step1Props {
    onSubmit: (inputs: UserInputs) => void;
    initialInputs: UserInputs;
}

const Step1Context: React.FC<Step1Props> = ({ onSubmit, initialInputs }) => {
    const [inputs, setInputs] = useState<UserInputs>(initialInputs || {});
    const navigate = useNavigate();

    const handleRatingChange = (factorId: string, itemId: string, value: string) => {
        setInputs(prev => ({
            ...prev,
            [factorId]: {
                ...prev[factorId],
                [itemId]: parseInt(value, 10)
            }
        }));
    };

    const handleRiskChange = (factorId: string, itemId: string, type: 'impact' | 'likelihood', value: string) => {
        const currentVal = (inputs[factorId]?.[itemId] || { impact: 1, likelihood: 1 }) as { impact: number, likelihood: number };
        setInputs(prev => ({
            ...prev,
            [factorId]: {
                ...prev[factorId],
                [itemId]: {
                    ...currentVal,
                    [type]: parseInt(value, 10),
                }
            }
        }));
    };
    
    const handleSubmit = () => {
        onSubmit(inputs);
        navigate('/initial-scope');
    };

    const renderFactor = (factor: DesignFactor) => {
        const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || [];
        switch (factor.type) {
            case 'rating':
                return items.map(item => (
                    <div key={item.id} className="py-2">
                        <label htmlFor={`${factor.id}-${item.id}`} className="block text-sm font-medium text-gray-700">{item.name}</label>
                        <Slider
                            id={`${factor.id}-${item.id}`}
                            value={(inputs[factor.id]?.[item.id] as number) || 3}
                            onChange={newValue => handleRatingChange(factor.id, item.id, String(newValue))}
                        />
                    </div>
                ));
            case 'rating-2d':
                 return items.map(item => {
                    const value = (inputs[factor.id]?.[item.id] as { impact: number, likelihood: number }) || { impact: 3, likelihood: 3 };
                    return (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                            <h4 className="md:col-span-2 text-md font-semibold text-gray-800">{item.name}</h4>
                            <div>
                                <label htmlFor={`${factor.id}-${item.id}-impact`} className="block text-sm font-medium text-gray-700">Impact</label>
                                <Slider
                                    id={`${factor.id}-${item.id}-impact`}
                                    value={value.impact}
                                    onChange={newValue => handleRiskChange(factor.id, item.id, 'impact', String(newValue))}
                                />
                            </div>
                            <div>
                                <label htmlFor={`${factor.id}-${item.id}-likelihood`} className="block text-sm font-medium text-gray-700">Likelihood</label>
                                <Slider
                                    id={`${factor.id}-${item.id}-likelihood`}
                                    value={value.likelihood}
                                    onChange={newValue => handleRiskChange(factor.id, item.id, 'likelihood', String(newValue))}
                                />
                            </div>
                        </div>
                    );
                });
            default:
                return null;
        }
    };
    
    const step1Factors = DESIGN_FACTORS.slice(0, 4);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Step 1: Understand Context and Strategy</h2>
            <p className="mt-2 text-gray-600">Provide input for the first four design factors to establish the initial scope of the governance system.</p>
            <div className="mt-8">
                {step1Factors.map(factor => (
                    <Card key={factor.id} title={factor.name} description={factor.description}>
                        {renderFactor(factor)}
                    </Card>
                ))}
            </div>
             <div className="flex justify-end mt-8">
                <Button onClick={handleSubmit}>
                    Calculate Initial Scope &rarr;
                </Button>
            </div>
        </div>
    );
};

export default Step1Context;