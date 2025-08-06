
import React from 'react';

interface SliderProps {
  id: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  indicatorColor?: string;
}

const Slider: React.FC<SliderProps> = ({ id, value, onChange, min = 1, max = 5, step = 1, indicatorColor }) => {
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10);
    
    // Only call onChange if the value is a valid number.
    // This prevents updates on empty inputs, which would result in NaN.
    if (!isNaN(numValue)) {
      // Clamp the value to be within min and max
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
    }
  };
  
  // Resets the input if it's left empty or invalid
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
        onChange(value);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mt-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleValueChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex items-center space-x-2">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleValueChange}
              onBlur={handleBlur}
              className="w-20 p-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            />
            {indicatorColor && <span className={`w-4 h-4 rounded-full ${indicatorColor} transition-colors duration-200`}></span>}
        </div>
      </div>
    </div>
  );
};

export default Slider;