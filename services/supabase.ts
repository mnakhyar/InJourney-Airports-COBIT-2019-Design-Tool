import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  data: any; // COBIT project data
  created_at: string;
  updated_at: string;
}

// Auth service
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Project service
export const projectService = {
  // Create new project
  async createProject(userId: string, name: string, description: string, data: any) {
    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name,
          description,
          data
        }
      ])
      .select()
      .single();
    
    return { project, error };
  },

  // Get user's projects
  async getUserProjects(userId: string) {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { projects, error };
  },

  // Update project
  async updateProject(projectId: string, data: any) {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ data, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single();
    
    return { project, error };
  },

  // Delete project
  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    return { error };
  },

  // Get single project
  async getProject(projectId: string) {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    return { project, error };
  }
}; 