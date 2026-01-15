import { Button } from '../common/Button';
import { StatusIndicator } from '../common/StatusIndicator';
import { useBackend } from '../../hooks/useBackend';
import { BackendLogsViewer } from './BackendLogsViewer';

export function BackendControlPanel() {
  const { status, isLoading, startBackend, stopBackend, isStarting, isStopping, apiRunning, startApiServer, stopApiServer, isApiStarting, isApiStopping } = useBackend();
  
  const handleStart = () => {
    startBackend();
  };
  
  const handleStop = () => {
    stopBackend();
  };

  const handleStartApi = () => {
    startApiServer();
  };
  
  const handleStopApi = () => {
    stopApiServer();
  };
  
  const isRunning = status?.running ?? false;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Backend Control</h2>
        <StatusIndicator 
          status={isLoading ? 'loading' : (isRunning ? 'running' : 'stopped')} 
        />
      </div>
      
      <div className="flex gap-2">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full"
            variant="success"
          >
            {isStarting ? 'Starting...' : 'Start Backend'}
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            disabled={isStopping}
            className="w-full"
            variant="danger"
          >
            {isStopping ? 'Stopping...' : 'Stop Backend'}
          </Button>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">API Server</h3>
        <div className="flex gap-2">
          {!apiRunning ? (
            <Button
              onClick={handleStopApi}
              disabled={isApiStopping}
              className="w-full"
              variant="danger"
            >
              {isApiStopping ? 'Stopping...' : 'Stop API Server'}
            </Button>
          ) : (
            <Button
              onClick={handleStartApi}
              disabled={isApiStarting}
              className="w-full"
              variant="success"
            >
              {isApiStarting ? 'Starting...' : 'Start API Server'}
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
      
      {status && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Status</p>
            <p className="text-lg font-semibold text-white">
              {isRunning ? 'Running' : 'Stopped'}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Port</p>
            <p className="text-lg font-semibold text-white">
              {status.port}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 col-span-2">
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-lg font-semibold text-white">
              {formatUptime(status.uptime)}
            </p>
          </div>
        </div>
      )}
      
      {isRunning && <BackendLogsViewer />}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
