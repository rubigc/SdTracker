import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function usePlayerStats(accountId?: number, teamId?: number) {
  return useQuery({
    queryKey: ['account', accountId, 'winrates', teamId],
    queryFn: () => api.getWinrates(accountId as number, teamId),
    enabled: !!accountId,
  });
}

export function useLeadStats(accountId?: number, teamId?: number) {
  return useQuery({
    queryKey: ['account', accountId, 'leads', teamId],
    queryFn: () => api.getLeadStats(accountId as number, teamId),
    enabled: !!accountId,
  });
}

export function useLeadComboStats(accountId?: number, teamId?: number) {
  return useQuery({
    queryKey: ['account', accountId, 'lead-combos', teamId],
    queryFn: () => api.getLeadComboStats(accountId as number, teamId),
    enabled: !!accountId,
  });
}

export function useTeraStats(accountId?: number, teamId?: number) {
  return useQuery({
    queryKey: ['account', accountId, 'tera', teamId],
    queryFn: () => api.getTeraStats(accountId as number, teamId),
    enabled: !!accountId,
  });
}

export function useInsights(accountId?: number, teamId?: number, pokemon?: string) {
  return useQuery({
    queryKey: ['account', accountId, 'insights', teamId, pokemon],
    queryFn: () => api.getInsights(accountId as number, teamId, pokemon),
    enabled: !!accountId,
  });
}

export function useGameHistory(accountId?: number, teamId?: number) {
  return useQuery({
    queryKey: ['account', accountId, 'history', teamId],
    queryFn: () => api.getHistory(accountId as number, teamId),
    enabled: !!accountId,
  });
}
