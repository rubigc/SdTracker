import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendService } from '../services/backend';

export function useBackend() {
  const queryClient = useQueryClient();

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
    apiRunning: apiRunning ?? false,
    startApiServer: startApiMutation.mutate,
    stopApiServer: stopApiMutation.mutate,
    isApiStarting: startApiMutation.isPending,
    isApiStopping: stopApiMutation.isPending,
  };
}
