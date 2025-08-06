import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, projectService, Project } from '../services/supabase';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      loadProjects(currentUser.id);
    };

    checkAuth();
  }, [navigate]);

  const loadProjects = async (userId: string) => {
    try {
      const { projects: userProjects, error } = await projectService.getUserProjects(userId);
      if (error) {
        setError('Failed to load projects');
      } else {
        setProjects(userProjects || []);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/welcome');
  };

  const handleLoadProject = (project: Project) => {
    // Store project data in localStorage for compatibility with existing app
    localStorage.setItem('cobit_current_project', project.id);
    localStorage.setItem('cobit_project_data', JSON.stringify(project.data));
    navigate('/');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const { error } = await projectService.deleteProject(projectId);
        if (error) {
          setError('Failed to delete project');
        } else {
          setProjects(projects.filter(p => p.id !== projectId));
        }
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (err) {
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COBIT Governance Design Tool</h1>
              <p className="text-gray-600">Welcome back, {user?.user_metadata?.username || user?.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="secondary">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Project */}
        <div className="mb-8">
          <Card title="Create New Project" description="Start a new COBIT governance design project">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">New Project</h3>
                <p className="text-gray-600">Create a new governance design project from scratch</p>
              </div>
              <Button onClick={handleCreateProject} variant="primary">
                Create New Project
              </Button>
            </div>
          </Card>
        </div>

        {/* Projects List */}
        <div className="mb-8">
          <Card title="Your Projects" description={`You have ${projects.length} project${projects.length !== 1 ? 's' : ''}`}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first COBIT governance design project.</p>
                <Button onClick={handleCreateProject} variant="primary">
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                    </div>
                    
                    <Button
                      onClick={() => handleLoadProject(project)}
                      variant="primary"
                      className="w-full"
                    >
                      Open Project
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 