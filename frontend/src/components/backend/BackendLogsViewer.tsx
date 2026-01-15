import { useQuery } from '@tanstack/react-query';
import { backendService } from '../../services/backend';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';

export function BackendLogsViewer() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['backend', 'logs'],
    queryFn: () => backendService.getBackendLogs(),
    refetchInterval: 2000, // Poll every 2 seconds
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Backend Logs</CardTitle>
          <Button
            onClick={() => refetch()}
            variant="secondary"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {isLoading ? (
            <p className="text-gray-400">Loading logs...</p>
          ) : logs && logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="text-gray-300 mb-1">
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No logs available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
