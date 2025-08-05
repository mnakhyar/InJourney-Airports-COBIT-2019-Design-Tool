
import React from 'react';
import { DesignFactorOption } from '../types';

interface PercentageGroupProps {
    options: DesignFactorOption[];
    values: { [key: string]: number };
    onChange: (newValues: { [key: string]: number }) => void;
    baselines?: { [key: string]: number };
}

const PercentageGroup: React.FC<PercentageGroupProps> = ({ options, values, onChange, baselines }) => {
    
    const handleValueChange = (id: string, value: number) => {
        // Fallback to 0 if value is NaN, then clamp between 0 and 100
        const clampedValue = Math.max(0, Math.min(100, value || 0));
        onChange({
            ...values,
            [id]: clampedValue,
        });
    };

    const total = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);

    return (
        <div className="space-y-4">
            {options.map(option => (
                <div key={option.id} className="grid grid-cols-12 gap-x-4 items-center">
                    <div className="col-span-12 sm:col-span-9">
                        <label htmlFor={option.id} className="block text-sm font-medium text-gray-700">{option.name}</label>
                        <div className="flex items-center space-x-4 mt-1">
                            <input
                                id={option.id}
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={values[option.id] || 0}
                                onChange={(e) => handleValueChange(option.id, parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={Math.round(values[option.id] || 0)}
                                onChange={(e) => handleValueChange(option.id, parseInt(e.target.value, 10))}
                                className="w-20 p-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <span className="font-semibold text-gray-600">%</span>
                        </div>
                    </div>
                     <div className="col-span-12 sm:col-span-3 text-center sm:border-l sm:pl-4 mt-2 sm:mt-0">
                        {baselines && baselines[option.id] !== undefined && (
                            <>
                                <span className="text-xs text-gray-500 uppercase">Baseline</span>
                                <span className="block font-bold text-lg text-primary">{baselines[option.id]}%</span>
                            </>
                        )}
                    </div>
                </div>
            ))}
            <div className={`text-right text-sm font-bold pr-16 ${total !== 100 ? 'text-red-500' : 'text-gray-800'}`}>
               Total: {Math.round(total)}%
            </div>
        </div>
    );
};

export default PercentageGroup;
