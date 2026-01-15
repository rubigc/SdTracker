import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendService } from '../services/backend';
import type { BackendStatus } from '../types';

export function useBackend() {
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['backend', 'status'],
    queryFn: () => backendService.getBackendStatus(),
    refetchInterval: 1000, // Poll every second
  });
  
  const startMutation = useMutation({
    mutationFn: () => backendService.startBackend(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backend', 'status'] });
    },
  });
  
  const stopMutation = useMutation({
    mutationFn: () => backendService.stopBackend(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backend', 'status'] });
    },
  });

  const { data: apiRunning } = useQuery({
    queryKey: ['api', 'running'],
    queryFn: () => backendService.isApiServerRunning(),
    refetchInterval: 1000, // Poll every second
  });
  
  const startApiMutation = useMutation({
    mutationFn: () => backendService.startApiServer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'running'] });
    },
  });
  
  const stopApiMutation = useMutation({
    mutationFn: () => backendService.stopApiServer(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'running'] });
    },
  });
  
  return {
    status: status as BackendStatus | undefined,
    isLoading,
    startBackend: startMutation.mutate,
    stopBackend: stopMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    apiRunning: apiRunning ?? false,
    startApiServer: startApiMutation.mutate,
    stopApiServer: stopApiMutation.mutate,
    isApiStarting: startApiMutation.isPending,
    isApiStopping: stopApiMutation.isPending,
  };
}
