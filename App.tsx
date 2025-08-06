
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { UserInputs, DesignFactorOption } from './types';
import { DESIGN_FACTORS, DESIGN_FACTOR_BASELINES } from './constants/cobitData';
import Sidebar from './components/Sidebar';
import WelcomePage from './pages/WelcomePage';
import InstructionPage from './pages/InstructionPage';
import DesignFactorPage from './pages/DesignFactorPage';
import SummaryStep2Page from './pages/SummaryStep2Page';
import SummaryStep3Page from './pages/SummaryStep3Page';
import CanvasPage from './pages/CanvasPage';
import SaveLoadDialog from './components/SaveLoadDialog';
import ConfirmDialog from './components/common/ConfirmDialog';
import Button from './components/common/Button';

function App() {
  const navigate = useNavigate();
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
        } else if (factor.type === 'percentage') {
          // Use baseline values as defaults for percentage inputs
          const baselineValues = DESIGN_FACTOR_BASELINES[factor.id];
          const baselineValue = baselineValues?.[item.id];
          const finalValue = baselineValue !== undefined ? baselineValue : (item.value || 0);
          initialInputs[factor.id][item.id] = finalValue;
        }
      });
    });
    return initialInputs;
  });

  // State to manage sidebar visibility
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  
  // Save/Load dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('');

  // Check if user has a current project
  const [hasCurrentProject, setHasCurrentProject] = useState<boolean>(false);

  // Track changes and notifications
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'info' | 'error';
  } | null>(null);

  // Load current project on app start
  useEffect(() => {
    const savedProjectId = localStorage.getItem('cobit_current_project');
    if (savedProjectId) {
      try {
        const projects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
        const project = projects.find((p: any) => p.id === savedProjectId);
        if (project) {
          // Ensure percentage inputs use baseline values if not set in the project
          const inputsWithBaselines = { ...project.inputs };
          DESIGN_FACTORS.forEach(factor => {
            if (factor.type === 'percentage') {
              const items = factor.options || [];
              const baselineValues = DESIGN_FACTOR_BASELINES[factor.id];
              if (!inputsWithBaselines[factor.id]) {
                inputsWithBaselines[factor.id] = {};
              }
              items.forEach((item: DesignFactorOption) => {
                if (inputsWithBaselines[factor.id][item.id] === undefined) {
                  const baselineValue = baselineValues?.[item.id];
                  inputsWithBaselines[factor.id][item.id] = baselineValue !== undefined ? baselineValue : (item.value || 0);
                }
              });
            }
          });
          setUserInputs(inputsWithBaselines);
          setCurrentProjectId(savedProjectId);
          setCurrentProjectName(project.name);
          setHasCurrentProject(true);
        } else {
          // Invalid project ID, clear it
          localStorage.removeItem('cobit_current_project');
          setHasCurrentProject(false);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        localStorage.removeItem('cobit_current_project');
        setHasCurrentProject(false);
      }
    } else {
      setHasCurrentProject(false);
    }
  }, []);

  // Track changes in userInputs
  useEffect(() => {
    if (hasCurrentProject && currentProjectId) {
      setHasUnsavedChanges(true);
    }
  }, [userInputs, hasCurrentProject, currentProjectId]);

  // Initialize weight service
  useEffect(() => {
    weightService.initialize();
  }, []);

  const handleLoadProject = (inputs: UserInputs, projectId: string, projectName: string) => {
    setUserInputs(inputs);
    setCurrentProjectId(projectId);
    setCurrentProjectName(projectName);
    setHasCurrentProject(true);
  };

  const handleSaveProject = async () => {
    if (!currentProjectId) {
      setShowSaveDialog(true);
      return;
    }

    // Auto-save current project
    try {
      const projects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === currentProjectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          inputs: userInputs,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('cobit_projects', JSON.stringify(projects));
        setHasUnsavedChanges(false);
        showNotificationMessage('Project saved successfully!');
      } else {
        setShowSaveDialog(true);
      }
    } catch (error) {
      showNotificationMessage('Failed to save project');
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const showConfirmDialogMessage = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'error' = 'warning') => {
    setConfirmDialogConfig({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  // If no current project, show welcome page
  if (!hasCurrentProject) {
    return <WelcomePage />;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-primary shadow-md no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                COBIT® Governance Design Tool
              </h1>
              {currentProjectName && (
                <span className="text-white bg-primary-dark px-3 py-1 rounded-full text-sm">
                  {currentProjectName}
                </span>
              )}
            </div>
            <div className="flex space-x-2 items-center">
              {hasUnsavedChanges && (
                <span className="text-yellow-500 text-sm font-medium mr-2">
                  ⚠️ Unsaved changes
                </span>
              )}

              <Button 
                onClick={() => {
                  if (hasUnsavedChanges) {
                    showConfirmDialogMessage(
                      'Unsaved Changes',
                      'You have unsaved changes. Do you want to save before leaving?',
                      () => {
                        handleSaveProject();
                        localStorage.removeItem('cobit_current_project');
                        setHasCurrentProject(false);
                        navigate('/');
                      },
                      'warning'
                    );
                  } else {
                    localStorage.removeItem('cobit_current_project');
                    setHasCurrentProject(false);
                    navigate('/');
                  }
                }} 
                variant="secondary"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 font-medium transition-colors duration-200"
              >
                Home
              </Button>
              <Button 
                onClick={handleSaveProject} 
                variant="secondary"
                className={`bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 ${hasUnsavedChanges ? "ring-2 ring-yellow-400" : ""}`}
              >
                Save Project
              </Button>
              <Button onClick={() => setShowSaveDialog(true)} variant="primary">
                Save As...
              </Button>
              <Button 
                onClick={() => navigate('/weight-management')} 
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200"
              >
                Weight Config
              </Button>
            </div>
          </div>
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

      {/* Save Dialog */}
      <SaveLoadDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        currentInputs={userInputs}
        onLoadProject={handleLoadProject}
        mode="save"
      />

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && confirmDialogConfig && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmDialogConfig.onConfirm}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          type={confirmDialogConfig.type}
        />
      )}
    </div>
  );
}

export default App;
