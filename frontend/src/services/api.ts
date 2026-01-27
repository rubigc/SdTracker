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

const FALLBACK_HOST = '127.0.0.1';
let requestCounter = 0;

type ApiDebugStage = 'request' | 'response' | 'error';

interface ApiDebugDetail {
  id: number;
  stage: ApiDebugStage;
  method: string;
  url: string;
  status?: number;
  ok?: boolean;
  error?: string;
  body?: string;
  time: string;
}

function emitApiDebug(detail: ApiDebugDetail) {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent('sdtracker-api-debug', { detail }));
}

function resolveApiBase(): string {
  const envBase = import.meta.env?.VITE_API_BASE;
  if (envBase) {
    return envBase;
  }
  if (typeof window === 'undefined') {
    return `http://${FALLBACK_HOST}:3001/api`;
  }
  if (import.meta.env?.DEV) {
    return '/api';
  }
  const protocol = window.location.protocol;
  if (protocol === 'tauri:' || protocol === 'file:') {
    return `http://${FALLBACK_HOST}:3001/api`;
  }
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
  const useHost = isLocalHost ? FALLBACK_HOST : host;
  return `http://${useHost}:3001/api`;
}

const API_BASE = resolveApiBase();

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const id = ++requestCounter;
  const method = init?.method ?? 'GET';
  const body = typeof init?.body === 'string' ? init.body : undefined;
  const url = typeof input === 'string' ? input : input.toString();
  emitApiDebug({
    id,
    stage: 'request',
    method,
    url,
    body,
    time: new Date().toISOString(),
  });

  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      emitApiDebug({
        id,
        stage: 'response',
        method,
        url,
        status: response.status,
        ok: response.ok,
        time: new Date().toISOString(),
      });
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    emitApiDebug({
      id,
      stage: 'response',
      method,
      url,
      status: response.status,
      ok: response.ok,
      time: new Date().toISOString(),
    });
    return response.json();
  } catch (error) {
    emitApiDebug({
      id,
      stage: 'error',
      method,
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      time: new Date().toISOString(),
    });
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

export async function createPokepast(
  pasteText: string,
  title?: string,
  author?: string,
  notes?: string
): Promise<string> {
  const payload = {
    text: pasteText,
    title: title?.trim() || undefined,
    author: author?.trim() || undefined,
    notes: notes?.trim() || undefined,
  };

  const response = await requestJson<{ url: string }>(`${API_BASE}/pokepaste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response?.url) {
    throw new Error('Pokepast creation failed.');
  }

  return response.url;
}
