import { useSupabaseData } from './useSupabaseData';
import { Card } from '../types';

export function useCards() {
    return useSupabaseData<Card>('cards', 'updated_at');
}
