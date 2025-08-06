import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface SavedProject {
  id: string;
  name: string;
  description?: string;
  inputs: any;
  createdAt: string;
  updatedAt: string;
  version: string;
}

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('cobit_projects');
      const projects = stored ? JSON.parse(stored) : [];
      setProjects(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
    setLoading(false);
  };

  const saveProject = (name: string, description: string, inputs: any) => {
    const project: SavedProject = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      description,
      inputs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0'
    };

    const existingProjects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
    existingProjects.push(project);
    localStorage.setItem('cobit_projects', JSON.stringify(existingProjects));
    return project;
  };

  const handleNewProject = () => {
    setShowNewProjectDialog(true);
  };

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'error' = 'warning') => {
    setConfirmDialogConfig({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  const handleCreateNewProject = () => {
    if (!projectName.trim()) {
      openConfirmDialog(
        'Error',
        'Please enter a project name',
        () => {},
        'error'
      );
      return;
    }

    // Create new project with default inputs
    const project = saveProject(projectName, projectDescription, {});
    localStorage.setItem('cobit_current_project', project.id);
    setShowNewProjectDialog(false);
    // Force page reload to trigger App.tsx useEffect
    window.location.href = window.location.pathname;
  };

  const handleLoadProject = (project: SavedProject) => {
    localStorage.setItem('cobit_current_project', project.id);
    // Force page reload to trigger App.tsx useEffect
    window.location.href = window.location.pathname;
  };

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Find project name for better notification
    const existingProjects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
    const projectToDelete = existingProjects.find((p: SavedProject) => p.id === projectId);
    const projectName = projectToDelete?.name || 'Project';
    
    openConfirmDialog(
      'Delete Project',
      `Are you sure you want to delete project "${projectName}"?`,
      () => {
        const filteredProjects = existingProjects.filter((p: SavedProject) => p.id !== projectId);
        localStorage.setItem('cobit_projects', JSON.stringify(filteredProjects));
        setProjects(filteredProjects);
        
        // Show success popup notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        notification.style.transform = 'translateX(100%)';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Project "${projectName}" deleted successfully!</span>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
      },
      'warning'
    );
  };

  const handleExportProject = (project: SavedProject, event: React.MouseEvent) => {
    event.stopPropagation();
    
    openConfirmDialog(
      'Export Project',
      `Are you sure you want to export project "${project.name}"?`,
      () => {
        try {
          const data = {
            project: project,
            exportDate: new Date().toISOString(),
            version: '1.0',
            tool: 'COBIT Governance Design Tool'
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cobit-project-${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          openConfirmDialog(
            'Success',
            `Project "${project.name}" exported successfully!`,
            () => {},
            'info'
          );
        } catch (error) {
          console.error('Export project error:', error);
          openConfirmDialog(
            'Error',
            'Failed to export project. Please try again.',
            () => {},
            'error'
          );
        }
      },
      'info'
    );
  };

  const handleExport = () => {
    const projects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
    
    if (projects.length === 0) {
      openConfirmDialog(
        'No Data',
        'No projects to export. Please save some projects first.',
        () => {},
        'info'
      );
      return;
    }

    openConfirmDialog(
      'Export All Projects',
      `Are you sure you want to export ${projects.length} project(s)?`,
      () => {
        try {
          const data = {
            projects: projects,
            exportDate: new Date().toISOString(),
            version: '1.0',
            tool: 'COBIT Governance Design Tool'
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cobit-projects-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          
          openConfirmDialog(
            'Success',
            `Successfully exported ${projects.length} project(s)!`,
            () => {},
            'info'
          );
        } catch (error) {
          console.error('Export error:', error);
          openConfirmDialog(
            'Error',
            'Failed to export data. Please try again.',
            () => {},
            'error'
          );
        }
      },
      'info'
    );
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      // Show error popup notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
      errorNotification.style.transform = 'translateX(100%)';
      errorNotification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Please select a valid JSON file</span>
        </div>
      `;
      
      document.body.appendChild(errorNotification);
      
      // Animate in
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(0)';
      }, 100);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(errorNotification);
        }, 300);
      }, 3000);
      
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data structure - support both single project and multiple projects
        let projectsToImport: any[] = [];
        
        if (data.projects && Array.isArray(data.projects)) {
          // Multiple projects format
          projectsToImport = data.projects;
        } else if (data.project && typeof data.project === 'object') {
          // Single project format
          projectsToImport = [data.project];
        } else {
          // Show error popup notification
          const errorNotification = document.createElement('div');
          errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
          errorNotification.style.transform = 'translateX(100%)';
          errorNotification.innerHTML = `
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Invalid file format. Please select a valid COBIT export file.</span>
            </div>
          `;
          
          document.body.appendChild(errorNotification);
          
          // Animate in
          setTimeout(() => {
            errorNotification.style.transform = 'translateX(0)';
          }, 100);
          
          // Auto remove after 3 seconds
          setTimeout(() => {
            errorNotification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              document.body.removeChild(errorNotification);
            }, 300);
          }, 3000);
          
          return;
        }

        // Validate each project structure
        const validProjects = projectsToImport.filter((project: any) => {
          return project && 
                 typeof project.id === 'string' && 
                 typeof project.name === 'string' && 
                 project.inputs && 
                 typeof project.createdAt === 'string' && 
                 typeof project.updatedAt === 'string';
        });

        if (validProjects.length === 0) {
          // Show error popup notification
          const errorNotification = document.createElement('div');
          errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
          errorNotification.style.transform = 'translateX(100%)';
          errorNotification.innerHTML = `
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>No valid projects found in the file.</span>
            </div>
          `;
          
          document.body.appendChild(errorNotification);
          
          // Animate in
          setTimeout(() => {
            errorNotification.style.transform = 'translateX(0)';
          }, 100);
          
          // Auto remove after 3 seconds
          setTimeout(() => {
            errorNotification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              document.body.removeChild(errorNotification);
            }, 300);
          }, 3000);
          
          return;
        }

        // Merge with existing projects (avoid duplicates by ID)
        const existingProjects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
        const existingIds = new Set(existingProjects.map((p: any) => p.id));
        
        const newProjects = validProjects.filter((project: any) => !existingIds.has(project.id));
        const allProjects = [...existingProjects, ...newProjects];
        
        // Save to localStorage
        localStorage.setItem('cobit_projects', JSON.stringify(allProjects));
        
        const importedCount = newProjects.length;
        const skippedCount = validProjects.length - newProjects.length;
        
        let message = `Successfully imported ${importedCount} project(s)!`;
        if (skippedCount > 0) {
          message += ` (${skippedCount} project(s) skipped - already exists)`;
        }
        
        // Show simple popup notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        notification.style.transform = 'translateX(100%)';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${message}</span>
          </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
        
        loadProjects();
        // Reset file input
        event.target.value = '';
      } catch (error) {
        console.error('Import error:', error);
        
        // Show error popup notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        errorNotification.style.transform = 'translateX(100%)';
        errorNotification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span>Failed to import data. Please check if the file is a valid JSON export.</span>
          </div>
        `;
        
        document.body.appendChild(errorNotification);
        
        // Animate in
        setTimeout(() => {
          errorNotification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
          errorNotification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            document.body.removeChild(errorNotification);
          }, 300);
        }, 4000);
      }
    };
    
    reader.onerror = () => {
      // Show error popup notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
      errorNotification.style.transform = 'translateX(100%)';
      errorNotification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Failed to read the file. Please try again.</span>
        </div>
      `;
      
      document.body.appendChild(errorNotification);
      
      // Animate in
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(0)';
      }, 100);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(errorNotification);
        }, 300);
      }, 3000);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            COBIT® Governance Design Tool
          </h1>
          <p className="text-lg text-gray-600">
            Welcome! Choose to start a new project or load an existing one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* New Project Section */}
          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">New Project</h2>
              <p className="text-gray-600 mb-6">
                Start fresh with a new COBIT governance assessment project.
              </p>
                             <Button 
                 onClick={handleNewProject} 
                 variant="primary" 
                 className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
               >
                 Create New Project
               </Button>
            </div>
          </Card>

          {/* Load Project Section */}
          <Card className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Load Project</h2>
              <p className="text-gray-600 mb-6">
                Continue working on an existing project.
              </p>
              
              {/* Export/Import Buttons */}
              <div className="flex space-x-2 mb-4">
                <Button onClick={handleExport} variant="secondary" size="sm">
                  📤 Export All
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="import-file-input"
                  />
                  <Button variant="secondary" size="sm" as="label" htmlFor="import-file-input">
                    📥 Import
                  </Button>
                </div>
              </div>

              {/* Project List */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No saved projects found.</div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleLoadProject(project)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-gray-800">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Updated: {new Date(project.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleExportProject(project, e)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Export project"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Delete project"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* New Project Dialog */}
        {showNewProjectDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter project name..."
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Project description (optional)..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  onClick={() => setShowNewProjectDialog(false)} 
                  variant="secondary"
                >
                  Cancel
                </Button>
                                 <Button 
                   onClick={handleCreateNewProject}
                   className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                 >
                   Create Project
                 </Button>
              </div>
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
    </div>
  );
};

export default WelcomePage; 