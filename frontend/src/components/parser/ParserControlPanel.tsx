import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StatusIndicator } from '../common/StatusIndicator';
import { useParser } from '../../hooks/useParser';

export function ParserControlPanel() {
  const [username, setUsername] = useState('');
  const { status, isLoading, startParser, stopParser, isStarting, isStopping } = useParser();
  
  const handleStart = () => {
    if (username.trim()) {
      startParser(username.trim());
    }
  };
  
  const handleStop = () => {
    stopParser();
  };
  
  const isRunning = status?.running ?? false;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Parser Control</h2>
        <StatusIndicator 
          status={isLoading ? 'loading' : (isRunning ? 'running' : 'stopped')} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Pokemon Showdown Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isRunning}
        />
        
        <div className="flex items-end gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={!username.trim() || isStarting}
              className="w-full"
              variant="success"
            >
              {isStarting ? 'Starting...' : 'Start Parser'}
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={isStopping}
              className="w-full"
              variant="danger"
            >
              {isStopping ? 'Stopping...' : 'Stop Parser'}
            </Button>
          )}
        </div>
      </div>
      
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-lg font-semibold text-white">
              {status.username || 'Not set'}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Port</p>
            <p className="text-lg font-semibold text-white">
              {status.port}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-lg font-semibold text-white">
              {formatUptime(status.uptime)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Logs Received</p>
            <p className="text-lg font-semibold text-white">
              {status.logs_received}
            </p>
          </div>
        </div>
      )}
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
