import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import ConfirmDialog from './common/ConfirmDialog';

interface SavedProject {
  id: string;
  name: string;
  description?: string;
  inputs: any;
  createdAt: string;
  updatedAt: string;
  version: string;
}

interface SaveLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: any;
  onLoadProject: (inputs: any, projectId: string, projectName: string) => void;
  mode: 'save' | 'load';
}

const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  isOpen,
  onClose,
  currentInputs,
  onLoadProject,
  mode
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'load') {
      loadProjects();
    }
  }, [isOpen, mode]);

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

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'error' = 'warning') => {
    setConfirmDialogConfig({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      openConfirmDialog(
        'Error',
        'Please enter a project name',
        () => {},
        'error'
      );
      return;
    }

    setLoading(true);
    
    try {
      const project: SavedProject = {
        id: currentProjectId || Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: projectName,
        description: projectDescription,
        inputs: currentInputs,
        createdAt: currentProjectId ? new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      };

      const existingProjects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
      
      if (currentProjectId) {
        // Update existing project
        const index = existingProjects.findIndex((p: SavedProject) => p.id === currentProjectId);
        if (index !== -1) {
          existingProjects[index] = { ...existingProjects[index], ...project };
        }
      } else {
        // Save new project
        existingProjects.push(project);
      }
      
      localStorage.setItem('cobit_projects', JSON.stringify(existingProjects));
      
      if (!currentProjectId) {
        setCurrentProjectId(project.id);
        localStorage.setItem('cobit_current_project', project.id);
      }
      
      openConfirmDialog(
        'Success',
        currentProjectId ? 'Project updated successfully!' : 'Project saved successfully!',
        () => {
          onClose();
        },
        'info'
      );
    } catch (error) {
      openConfirmDialog(
        'Error',
        'Failed to save project',
        () => {},
        'error'
      );
    }
    
    setLoading(false);
  };

  const handleLoad = async (project: SavedProject) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    onLoadProject(project.inputs, project.id, project.name);
    localStorage.setItem('cobit_current_project', project.id);
    onClose();
  };

  const handleDelete = async (projectId: string) => {
        openConfirmDialog(
      'Delete Project',
      'Are you sure you want to delete this project?',
      async () => {
        try {
          const existingProjects = JSON.parse(localStorage.getItem('cobit_projects') || '[]');
          const filteredProjects = existingProjects.filter((p: SavedProject) => p.id !== projectId);
          localStorage.setItem('cobit_projects', JSON.stringify(filteredProjects));
          setProjects(filteredProjects);
          openConfirmDialog(
            'Success',
            'Project deleted successfully!',
            () => {},
            'info'
          );
        } catch (error) {
          openConfirmDialog(
            'Error',
            'Failed to delete project',
            () => {},
            'error'
          );
        }
      },
      'warning'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'save' ? 'Save Project As...' : 'Load Project'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {mode === 'save' ? (
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
            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="secondary">Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Project'}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No saved projects found.</div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Updated: {new Date(project.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleLoad(project)}
                          variant="primary"
                          size="sm"
                        >
                          Load
                        </Button>
                        <Button 
                          onClick={() => handleDelete(project.id)}
                          variant="secondary"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

export default SaveLoadDialog; 