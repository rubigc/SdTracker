import type { 
  WinrateStats, 
  LeadStat, 
  TeraStat, 
  HistoryGame,
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  MoveStats
} from '../types';

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

  // Account endpoints
  getAccounts: async (): Promise<Account[]> => {
    const response = await fetch(`${API_BASE}/accounts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    return response.json();
  },

  createAccount: async (data: CreateAccountRequest): Promise<Account> => {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create account: ${response.statusText}`);
    }
    return response.json();
  },

  updateAccount: async (id: number, data: UpdateAccountRequest): Promise<void> => {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update account: ${response.statusText}`);
    }
  },

  // Team endpoints
  getTeams: async (): Promise<Team[]> => {
    const response = await fetch(`${API_BASE}/teams`);
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    return response.json();
  },

  getTeamsByAccount: async (accountId: number): Promise<Team[]> => {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/teams`);
    if (!response.ok) {
      throw new Error(`Failed to fetch teams: ${response.statusText}`);
    }
    return response.json();
  },

  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.statusText}`);
    }
    return response.json();
  },

  updateTeam: async (id: number, data: UpdateTeamRequest): Promise<void> => {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update team: ${response.statusText}`);
    }
  },

  deleteTeam: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete team: ${response.statusText}`);
    }
  },

  // Move usage endpoints
  getMoveStats: async (accountId: number, teamId?: number): Promise<MoveStats[]> => {
    const url = teamId 
      ? `${API_BASE}/accounts/${accountId}/moves?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/moves`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch move stats: ${response.statusText}`);
    }
    return response.json();
  },

  getMoveStatsByPokemon: async (accountId: number, pokemonName: string): Promise<MoveStats[]> => {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/moves/${encodeURIComponent(pokemonName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch move stats: ${response.statusText}`);
    }
    return response.json();
  },
};
