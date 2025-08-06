import React from 'react';

interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl mb-8 print:shadow-none print:border print:border-gray-200">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;