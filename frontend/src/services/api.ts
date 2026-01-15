import type { WinrateStats, LeadStat, TeraStat, HistoryGame } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  getWinrates: async (player: string): Promise<WinrateStats> => {
    const response = await fetch(`${API_BASE}/winrates/${player}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch winrates: ${response.statusText}`);
    }
    return response.json();
  },
  
  getLeadStats: async (player: string): Promise<LeadStat[]> => {
    const response = await fetch(`${API_BASE}/leads/${player}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch lead stats: ${response.statusText}`);
    }
    return response.json();
  },
  
  getTeraStats: async (player: string): Promise<TeraStat[]> => {
    const response = await fetch(`${API_BASE}/tera/${player}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tera stats: ${response.statusText}`);
    }
    return response.json();
  },
  
  getHistory: async (player: string): Promise<HistoryGame[]> => {
    const response = await fetch(`${API_BASE}/history/${player}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    return response.json();
  },
};
