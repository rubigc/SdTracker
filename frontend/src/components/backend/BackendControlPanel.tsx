import { Button } from '../common/Button';
import { StatusIndicator } from '../common/StatusIndicator';
import { useBackend } from '../../hooks/useBackend';
import { BackendLogsViewer } from './BackendLogsViewer';

export function BackendControlPanel() {
  const { apiRunning, startApiServer, stopApiServer, isApiStarting, isApiStopping } = useBackend();
  
  const handleStartApi = () => {
    startApiServer();
  };
  
  const handleStopApi = () => {
    stopApiServer();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">API Server Control</h2>
        <StatusIndicator 
          status={apiRunning ? 'running' : 'stopped'} 
        />
      </div>
      
      <div className="flex gap-2">
        {!apiRunning ? (
          <Button
            onClick={handleStartApi}
            disabled={isApiStarting}
            className="w-full"
            variant="success"
          >
            {isApiStarting ? 'Starting...' : 'Start API Server'}
          </Button>
        ) : (
          <Button
            onClick={handleStopApi}
            disabled={isApiStopping}
            className="w-full"
            variant="danger"
          >
            {isApiStopping ? 'Stopping...' : 'Stop API Server'}
          </Button>
        )}
      </div>
      
      <div className="mt-4 bg-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-400">Status</p>
        <p className="text-lg font-semibold text-white">
          {apiRunning ? 'Running on port 3001' : 'Stopped'}
        </p>
      </div>
    </div>
  );
}
