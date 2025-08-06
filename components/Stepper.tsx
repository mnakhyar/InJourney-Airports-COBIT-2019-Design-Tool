
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { path: '/', name: '1. Context & Strategy', description: 'Understand the enterprise' },
  { path: '/initial-scope', name: '2. Initial Scope', description: 'Determine initial priorities' },
  { path: '/refinement', name: '3. Refinement', description: 'Fine-tune the scope' },
  { path: '/final-design', name: '4. Final Design', description: 'Conclude and report' },
];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress" className="print:hidden">
      <ol role="list" className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step.name} className="relative md:flex-1 md:flex">
              <Link to={step.path} className={`group flex items-center w-full ${!isCompleted && !isCurrent ? 'pointer-events-none' : ''}`}>
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span
                    className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                      isCompleted ? 'bg-primary group-hover:bg-primary-dark' : isCurrent ? 'border-2 border-primary text-primary' : 'border-2 border-gray-300 group-hover:border-gray-400 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={isCurrent ? 'text-primary' : 'text-gray-500'}>{stepNumber}</span>
                    )}
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
                </span>
              </Link>
              {stepIdx !== steps.length - 1 ? (
                <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path d="M0.5 0V30L10.5 40L0.5 50V80" stroke="currentColor" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
