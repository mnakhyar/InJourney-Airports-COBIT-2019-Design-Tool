import React from 'react';
import Card from './common/Card';

interface SummaryStatisticsProps {
  stats: {
    average: number;
    stdDev: number;
    baselineRatio: number;
  };
}

const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ stats }) => {
  return (
    <Card title="Summary Statistics" description="An analysis of your inputs for this factor.">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody className="bg-white">
            <tr className="border-t border-gray-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">Average User Input</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono w-24">{stats.average.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">The mean value of all your ratings for this factor.</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Standard Deviation (Population)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono">{stats.stdDev.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Measures the amount of variation or dispersion of your ratings.</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Baseline Ratio</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono">{stats.baselineRatio.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Compares the standard baseline average to your average input (Baseline Avg / Your Avg).</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SummaryStatistics;
