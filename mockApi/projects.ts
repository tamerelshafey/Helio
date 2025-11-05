import { projectsData } from '../data/projects';
import type { Project } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getAllProjects = async (): Promise<Project[]> => {
    await delay(200);
    return [...projectsData];
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
    await delay(100);
    return projectsData.find(p => p.id === id);
};

export const getProjectsByPartnerId = async (partnerId: string): Promise<Project[]> => {
    await delay(200);
    return projectsData.filter(p => p.partnerId === partnerId);
};

export const addProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    await delay(300);
    const newProject = { 
        ...project, 
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    projectsData.push(newProject);
    return newProject;
};

export const updateProject = async (id: string, updates: Partial<Omit<Project, 'id'>>): Promise<Project | undefined> => {
    await delay(300);
    const index = projectsData.findIndex(p => p.id === id);
    if (index > -1) {
        projectsData[index] = { ...projectsData[index], ...updates };
        return projectsData[index];
    }
    return undefined;
};

export const deleteProject = async (id: string): Promise<boolean> => {
    await delay(300);
    // FIX: Use splice to mutate the array directly instead of reassigning the import.
    const index = projectsData.findIndex(p => p.id === id);
    if (index > -1) {
        projectsData.splice(index, 1);
        return true;
    }
    return false;
};
