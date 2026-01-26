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

const API_BASE = 'http://127.0.0.1:3001/api';

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('failed to fetch')) {
      throw new Error('Failed to reach API server. Make sure it is running (Settings → Backend Control).');
    }
    throw error;
  }
}

export const api = {
  getWinrates: async (accountId: number, teamId?: number): Promise<WinrateStats> => {
    const url = teamId
      ? `${API_BASE}/accounts/${accountId}/winrates?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/winrates`;
    return requestJson<WinrateStats>(url);
  },
  
  getLeadStats: async (accountId: number, teamId?: number): Promise<LeadStat[]> => {
    const url = teamId
      ? `${API_BASE}/accounts/${accountId}/leads?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/leads`;
    return requestJson<LeadStat[]>(url);
  },
  
  getTeraStats: async (accountId: number, teamId?: number): Promise<TeraStat[]> => {
    const url = teamId
      ? `${API_BASE}/accounts/${accountId}/tera?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/tera`;
    return requestJson<TeraStat[]>(url);
  },
  
  getHistory: async (accountId: number, teamId?: number): Promise<HistoryGame[]> => {
    const url = teamId
      ? `${API_BASE}/accounts/${accountId}/history?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/history`;
    return requestJson<HistoryGame[]>(url);
  },

  // Account endpoints
  getAccounts: async (): Promise<Account[]> => {
    return requestJson<Account[]>(`${API_BASE}/accounts`);
  },

  createAccount: async (data: CreateAccountRequest): Promise<Account> => {
    return requestJson<Account>(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateAccount: async (id: number, data: UpdateAccountRequest): Promise<void> => {
    await requestJson<void>(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Team endpoints
  getTeams: async (): Promise<Team[]> => {
    return requestJson<Team[]>(`${API_BASE}/teams`);
  },

  getTeamsByAccount: async (accountId: number): Promise<Team[]> => {
    return requestJson<Team[]>(`${API_BASE}/accounts/${accountId}/teams`);
  },

  createTeam: async (data: CreateTeamRequest): Promise<Team> => {
    return requestJson<Team>(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateTeam: async (id: number, data: UpdateTeamRequest): Promise<void> => {
    await requestJson<void>(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  deleteTeam: async (id: number): Promise<void> => {
    await requestJson<void>(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
    });
  },

  // Move usage endpoints
  getMoveStats: async (accountId: number, teamId?: number): Promise<MoveStats[]> => {
    const url = teamId 
      ? `${API_BASE}/accounts/${accountId}/moves?team_id=${teamId}`
      : `${API_BASE}/accounts/${accountId}/moves`;
    return requestJson<MoveStats[]>(url);
  },

  getMoveStatsByPokemon: async (accountId: number, pokemonName: string): Promise<MoveStats[]> => {
    return requestJson<MoveStats[]>(`${API_BASE}/accounts/${accountId}/moves/${encodeURIComponent(pokemonName)}`);
  },
};
