import { cn } from '../../utils/cn';

interface StatusIndicatorProps {
  status: 'running' | 'stopped' | 'loading';
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'loading':
        return 'bg-yellow-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'loading':
        return 'Loading...';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('w-3 h-3 rounded-full', getStatusColor())} />
      <span className="text-sm font-medium text-gray-300">
        {getStatusText()}
      </span>
    </div>
  );
}
