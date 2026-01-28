// API Response Types
export interface WinrateStats {
  overall_win_rate: number;
  games_played: number;
  bo3_win_rate: number;
  bo3_played: number;
  bo3_game_winrates: Record<string, GameWR>;
}

export interface GameWR {
  win_rate: number;
  games_played: number;
}

export interface LeadStat {
  pokemon: string;
  win_rate: number;
  games_played: number;
}

export interface LeadComboStat {
  pokemon: string[];
  win_rate: number;
  games_played: number;
}

export interface TeraStat {
  pokemon: string;
  win_rate: number;
  games_played: number;
}

export interface InsightStat {
  insight_id: string;
  label: string;
  pokemon?: string | null;
  occurrences: number;
  games_played: number;
  wins: number;
  win_rate: number;
}

export interface HistoryGame {
  match_id: number;
  game_id: number;
  game_number: number;
  winner: string;
  player: Player;
  opponent: Player;
}

export interface Player {
  name: string;
  team?: string | null;
  lead?: string | null;
  tera?: string | null;
  ots?: string | null;
  elo?: number | null;
  elo_change?: number | null;
}

// Account Types
export interface Account {
  id: number;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface CreateAccountRequest {
  name: string;
}

export interface UpdateAccountRequest {
  is_active: boolean;
}

// Team Types
export interface Team {
  id: number;
  name: string;
  account_id: number | null;
  team_data: string;
  created_at: string;
  last_used: string | null;
  games_played: number;
  wins: number;
}

export interface CreateTeamRequest {
  name: string;
  account_id?: number;
  team_data: string;
}

export interface UpdateTeamRequest {
  name?: string;
  team_data?: string;
}

// Move Usage Types
export interface MoveUsage {
  id: number;
  game_id: number;
  account_id: number;
  pokemon_name: string;
  move_name: string;
  usage_count: number;
}

export interface MoveStats {
  pokemon_name: string;
  move_name: string;
  total_usage: number;
  games_played: number;
  win_rate: number;
}

// Parser Types
export interface ParserStatus {
  running: boolean;
  username: string;
  port: number;
  uptime: number;
  logs_received: number;
}

// API Types
export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}
