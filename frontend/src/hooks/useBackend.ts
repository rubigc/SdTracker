import { useState } from 'react';

export function useBackend() {
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  
  const startBackend = async () => {
    setIsStarting(true);
    try {
      // Backend will be started automatically by Tauri
      // This is a placeholder for future implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to start backend:', error);
    } finally {
      setIsStarting(false);
    }
  };
  
  const stopBackend = async () => {
    setIsStopping(true);
    try {
      // Backend will be stopped automatically by Tauri
      // This is a placeholder for future implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to stop backend:', error);
    } finally {
      setIsStopping(false);
    }
  };
  
  return {
    isRunning,
    startBackend,
    stopBackend,
    isStarting,
    isStopping,
  };
}
