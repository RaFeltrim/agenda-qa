import { useSupabaseData } from './useSupabaseData';
import { Sprint } from '../types';

export function useSprints() {
    return useSupabaseData<Sprint>('sprints', 'dataInicio');
}
