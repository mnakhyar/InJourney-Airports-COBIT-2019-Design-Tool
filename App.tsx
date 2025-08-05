
import React, { useState, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UserInputs, DesignFactorOption } from './types';
import { DESIGN_FACTORS } from './constants/cobitData';
import Sidebar from './components/Sidebar';
import InstructionPage from './pages/InstructionPage';
import DesignFactorPage from './pages/DesignFactorPage';
import SummaryStep2Page from './pages/SummaryStep2Page';
import SummaryStep3Page from './pages/SummaryStep3Page';
import CanvasPage from './pages/CanvasPage';

function App() {
  const [userInputs, setUserInputs] = useState<UserInputs>(() => {
    // Initialize inputs with default values from constants
    const initialInputs: UserInputs = {};
    DESIGN_FACTORS.forEach(factor => {
      const items = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
      initialInputs[factor.id] = {};
      
      items.forEach((item: DesignFactorOption) => {
        if (factor.type === 'rating') {
          initialInputs[factor.id][item.id] = 3; // Default rating
        } else if (factor.type === 'rating-1-3') {
           initialInputs[factor.id][item.id] = 2; // Default rating
        } else if (factor.type === 'rating-2d') {
          initialInputs[factor.id][item.id] = { impact: 3, likelihood: 3 };
        } else if (factor.type === 'percentage' && item.value !== undefined) {
          initialInputs[factor.id][item.id] = item.value;
        }
      });
    });
    return initialInputs;
  });

  // State to manage sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-primary shadow-md no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            COBIT® Governance Design Tool
          </h1>
        </div>
      </header>

      <div className="flex container mx-auto bg-white shadow-xl mt-[-10px] rounded-t-lg">
        {/* Conditionally render the sidebar */}
        {isSidebarVisible && <Sidebar />}
        
        {/* Wrapper for main content and toggle button */}
        <div className="relative flex-1 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="absolute top-5 z-10 bg-primary text-white p-1 rounded-full shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 ring-offset-2 ring-primary-light no-print"
            style={{ left: '-16px' }}
            aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
          >
            {isSidebarVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <main className={`flex-1 p-6 sm:p-8 ${isSidebarVisible ? 'border-l border-gray-200' : ''}`}>
             <Routes>
                <Route path="/" element={<InstructionPage />} />
                <Route 
                  path="/design-factor/:factorId" 
                  element={<DesignFactorPage allInputs={userInputs} onInputChange={setUserInputs} />} 
                />
                <Route 
                  path="/summary/step2" 
                  element={<SummaryStep2Page allInputs={userInputs} />} 
                />
                <Route 
                  path="/summary/step3" 
                  element={<SummaryStep3Page allInputs={userInputs} />} 
                />
                <Route 
                  path="/canvas" 
                  element={<CanvasPage allInputs={userInputs} />} 
                />
              </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
