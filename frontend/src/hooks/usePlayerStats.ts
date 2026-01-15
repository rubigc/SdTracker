import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';


export function usePlayerStats(player: string) {
  return useQuery({
    queryKey: ['player', player, 'winrates'],
    queryFn: () => api.getWinrates(player),
    enabled: !!player,
  });
}

export function useLeadStats(player: string) {
  return useQuery({
    queryKey: ['player', player, 'leads'],
    queryFn: () => api.getLeadStats(player),
    enabled: !!player,
  });
}

export function useTeraStats(player: string) {
  return useQuery({
    queryKey: ['player', player, 'tera'],
    queryFn: () => api.getTeraStats(player),
    enabled: !!player,
  });
}

export function useGameHistory(player: string) {
  return useQuery({
    queryKey: ['player', player, 'history'],
    queryFn: () => api.getHistory(player),
    enabled: !!player,
  });
}
