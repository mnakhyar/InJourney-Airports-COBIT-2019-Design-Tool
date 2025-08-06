import { SavedProject, UserInputs, WeightConfiguration, ApiResponse } from '../types';

class DatabaseService {
  private readonly PROJECTS_KEY = 'cobit_projects';
  private readonly WEIGHTS_KEY = 'cobit_weights';
  private readonly CURRENT_PROJECT_KEY = 'cobit_current_project';

  // Project Management
  async saveProject(name: string, description: string, inputs: UserInputs): Promise<ApiResponse<SavedProject>> {
    try {
      const projects = this.getProjectsFromStorage();
      const project: SavedProject = {
        id: this.generateId(),
        name,
        description,
        inputs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      };

      projects.push(project);
      this.saveProjectsToStorage(projects);

      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: 'Failed to save project' };
    }
  }

  async loadProject(id: string): Promise<ApiResponse<SavedProject>> {
    try {
      const projects = this.getProjectsFromStorage();
      const project = projects.find(p => p.id === id);
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: 'Failed to load project' };
    }
  }

  async updateProject(id: string, inputs: UserInputs): Promise<ApiResponse<SavedProject>> {
    try {
      const projects = this.getProjectsFromStorage();
      const projectIndex = projects.findIndex(p => p.id === id);
      
      if (projectIndex === -1) {
        return { success: false, error: 'Project not found' };
      }

      projects[projectIndex] = {
        ...projects[projectIndex],
        inputs,
        updatedAt: new Date().toISOString()
      };

      this.saveProjectsToStorage(projects);
      return { success: true, data: projects[projectIndex] };
    } catch (error) {
      return { success: false, error: 'Failed to update project' };
    }
  }

  async listProjects(): Promise<ApiResponse<SavedProject[]>> {
    try {
      const projects = this.getProjectsFromStorage();
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: 'Failed to list projects' };
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const projects = this.getProjectsFromStorage();
      const filteredProjects = projects.filter(p => p.id !== id);
      this.saveProjectsToStorage(filteredProjects);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete project' };
    }
  }

  // Weight Configuration Management
  async getWeightConfigurations(): Promise<ApiResponse<WeightConfiguration[]>> {
    try {
      const weights = this.getWeightsFromStorage();
      return { success: true, data: weights };
    } catch (error) {
      return { success: false, error: 'Failed to load weight configurations' };
    }
  }

  async saveWeightConfiguration(config: Omit<WeightConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<WeightConfiguration>> {
    try {
      const weights = this.getWeightsFromStorage();
      const newConfig: WeightConfiguration = {
        ...config,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      weights.push(newConfig);
      this.saveWeightsToStorage(weights);
      return { success: true, data: newConfig };
    } catch (error) {
      return { success: false, error: 'Failed to save weight configuration' };
    }
  }

  // Current Project Management
  setCurrentProject(projectId: string | null): void {
    if (projectId) {
      localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
    } else {
      localStorage.removeItem(this.CURRENT_PROJECT_KEY);
    }
  }

  getCurrentProjectId(): string | null {
    return localStorage.getItem(this.CURRENT_PROJECT_KEY);
  }

  // Helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getProjectsFromStorage(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.PROJECTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveProjectsToStorage(projects: SavedProject[]): void {
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  }

  private getWeightsFromStorage(): WeightConfiguration[] {
    try {
      const stored = localStorage.getItem(this.WEIGHTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveWeightsToStorage(weights: WeightConfiguration[]): void {
    localStorage.setItem(this.WEIGHTS_KEY, JSON.stringify(weights));
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      projects: this.getProjectsFromStorage(),
      weights: this.getWeightsFromStorage(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): ApiResponse<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.projects) {
        this.saveProjectsToStorage(data.projects);
      }
      if (data.weights) {
        this.saveWeightsToStorage(data.weights);
      }
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, error: 'Invalid data format' };
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.PROJECTS_KEY);
    localStorage.removeItem(this.WEIGHTS_KEY);
    localStorage.removeItem(this.CURRENT_PROJECT_KEY);
  }
}

export const databaseService = new DatabaseService(); 