import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parserService } from '../services/parser';
import type { ParserStatus } from '../types';

export function useParser() {
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['parser', 'status'],
    queryFn: () => parserService.getParserStatus(),
    refetchInterval: 1000, // Poll every second
  });
  
  const startMutation = useMutation({
    mutationFn: () => parserService.startParser(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser', 'status'] });
    },
  });
  
  const stopMutation = useMutation({
    mutationFn: () => parserService.stopParser(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser', 'status'] });
    },
  });
  
  return {
    status: status as ParserStatus | undefined,
    isLoading,
    startParser: startMutation.mutate,
    stopParser: stopMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
  };
}
