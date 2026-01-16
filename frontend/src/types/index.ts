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

export interface TeraStat {
  pokemon: string;
  win_rate: number;
  games_played: number;
}

export interface HistoryGame {
  game_id: number;
  game_number: number;
  winner: string;
  player: Player;
  opponent: Player;
}

export interface Player {
  name: string;
  team: string;
  lead: string;
  tera: string;
  ots: string;
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
