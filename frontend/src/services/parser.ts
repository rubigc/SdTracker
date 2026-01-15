import { invoke } from '@tauri-apps/api/core';
import type { ParserStatus } from '../types';

export const parserService = {
  startParser: async (username: string): Promise<void> => {
    await invoke('start_parser', { username });
  },
  
  stopParser: async (): Promise<void> => {
    await invoke('stop_parser');
  },
  
  getParserStatus: async (): Promise<ParserStatus> => {
    return await invoke('get_parser_status');
  },
  
  sendReplayUrl: async (url: string): Promise<void> => {
    await fetch('http://localhost:8098/receive-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  },
};
