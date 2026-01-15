import { invoke } from '@tauri-apps/api/core';
import type { BackendStatus } from '../types';

export const backendService = {
  startBackend: async (): Promise<void> => {
    await invoke('start_backend');
  },
  
  stopBackend: async (): Promise<void> => {
    await invoke('stop_backend');
  },
  
  isBackendRunning: async (): Promise<boolean> => {
    return await invoke('is_backend_running');
  },
  
  getBackendStatus: async (): Promise<BackendStatus> => {
    return await invoke('get_backend_status');
  },
  
  getBackendLogs: async (): Promise<string[]> => {
    return await invoke('get_backend_logs');
  },
};
