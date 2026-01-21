import { useSupabaseData } from './useSupabaseData';
import { Meeting } from '../types';

export function useMeetings() {
    return useSupabaseData<Meeting>('meetings', 'horario');
}
