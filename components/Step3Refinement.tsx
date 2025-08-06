
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInputs, DesignFactor } from '../types';
import { DESIGN_FACTORS } from '../constants/cobitData';
import Card from './common/Card';
import Slider from './common/Slider';
import Button from './common/Button';

interface Step3Props {
    onSubmit: (inputs: UserInputs) => void;
    initialInputs: UserInputs;
}

const Step3Refinement: React.FC<Step3Props> = ({ onSubmit, initialInputs }) => {
    const [inputs, setInputs] = useState<UserInputs>(initialInputs || {});
    const navigate = useNavigate();

    const handleChange = (factorId: string, itemId: string, value: number) => {
        setInputs(prev => ({
            ...prev,
            [factorId]: {
                ...prev[factorId],
                [itemId]: value
            }
        }));
    };

    const handleRadioChange = (factorId: string, value: string) => {
        setInputs(prev => ({
            ...prev,
            // For radio buttons, we store the selected option's ID with a value of 1.
            // This is a simplification; a more complex model might assign different weights.
            [factorId]: { [value]: 1 }
        }));
    };


    const handleSubmit = () => {
        // We only need to submit the inputs for this step
        const step3Inputs: UserInputs = {};
        DESIGN_FACTORS.slice(4).forEach(f => {
            if(inputs[f.id]) {
                step3Inputs[f.id] = inputs[f.id];
            }
        });
        onSubmit(step3Inputs);
        navigate('/final-design');
    };

    const renderFactor = (factor: DesignFactor) => {
        const items = factor.options || factor.categories || [];
        switch (factor.type) {
            case 'rating':
                return items.map(item => (
                     <div key={item.id} className="py-2">
                        <label htmlFor={`${factor.id}-${item.id}`} className="block text-sm font-medium text-gray-700">{item.name}</label>
                        <Slider
                            id={`${factor.id}-${item.id}`}
                            value={(inputs[factor.id]?.[item.id] as number) || 3}
                            onChange={newValue => handleChange(factor.id, item.id, newValue)}
                        />
                    </div>
                ));
            case 'radio':
                const selectedValue = inputs[factor.id] ? Object.keys(inputs[factor.id])[0] : (items[0]?.id || '');
                return (
                    <fieldset>
                        <legend className="sr-only">{factor.name}</legend>
                        <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                            {items.map(option => (
                                <div key={option.id} className="flex items-center">
                                    <input
                                        id={`${factor.id}-${option.id}`}
                                        name={factor.id}
                                        type="radio"
                                        checked={selectedValue === option.id}
                                        onChange={() => handleRadioChange(factor.id, option.id)}
                                        className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                    />
                                    <label htmlFor={`${factor.id}-${option.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                        {option.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                );
            default:
                return null;
        }
    };
    
    const step3Factors = DESIGN_FACTORS.slice(4);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Step 3: Refine the Scope of the Governance System</h2>
            <p className="mt-2 text-gray-600">Provide input for the remaining design factors. These will adjust the initial priorities based on more specific aspects of your I&T environment.</p>
            <div className="mt-8">
                {step3Factors.map(factor => (
                    <Card key={factor.id} title={factor.name} description={factor.description}>
                        {renderFactor(factor)}
                    </Card>
                ))}
            </div>
             <div className="flex justify-between mt-8">
                <Button onClick={() => navigate('/initial-scope')} variant="outline">
                    &larr; Back to Initial Scope
                </Button>
                <Button onClick={handleSubmit}>
                    Finalize Design &rarr;
                </Button>
            </div>
        </div>
    );
};

export default Step3Refinement;