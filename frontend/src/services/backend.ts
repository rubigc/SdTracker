import { invoke } from '@tauri-apps/api/core';

export const backendService = {
  startApiServer: async (): Promise<void> => {
    await invoke('start_api_server');
  },

  stopApiServer: async (): Promise<void> => {
    await invoke('stop_api_server');
  },

  isApiServerRunning: async (): Promise<boolean> => {
    return await invoke('is_api_server_running');
  },
};
