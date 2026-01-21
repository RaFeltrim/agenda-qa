import { useSupabaseData } from './useSupabaseData';
import { Project } from '../types';

export function useProjects() {
    return useSupabaseData<Project>('projects', 'createdAt');
}
