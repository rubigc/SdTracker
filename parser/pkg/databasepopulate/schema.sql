CREATE TABLE IF NOT EXISTS matches (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_uuid TEXT UNIQUE,
	player1 TEXT,
	player2 TEXT,
	winner INTEGER,
	match_date TEXT
);

CREATE TABLE IF NOT EXISTS games (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id INTEGER,
	game_number INTEGER,
	match_uuid TEXT,
	winner TEXT,
	replay TEXT,
	FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE TABLE IF NOT EXISTS game_players (
	game_id INTEGER NOT NULL,
	player_name TEXT NOT NULL,
	team_pokemon TEXT,
	lead_pokemon TEXT,
	tera_used TEXT,
	ots TEXT,
	team_id INTEGER,
	PRIMARY KEY (game_id, player_name),
	FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE IF NOT EXISTS accounts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT UNIQUE NOT NULL,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS teams (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	account_id INTEGER,
	team_data TEXT NOT NULL,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	last_used TEXT,
	games_played INTEGER DEFAULT 0,
	wins INTEGER DEFAULT 0,
	FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS team_usage (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	game_id INTEGER NOT NULL,
	team_id INTEGER NOT NULL,
	account_id INTEGER NOT NULL,
	FOREIGN KEY (game_id) REFERENCES games(id),
	FOREIGN KEY (team_id) REFERENCES teams(id),
	FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS move_usage (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	game_id INTEGER NOT NULL,
	account_id INTEGER NOT NULL,
	pokemon_name TEXT NOT NULL,
	move_name TEXT NOT NULL,
	usage_count INTEGER DEFAULT 1,
	FOREIGN KEY (game_id) REFERENCES games(id),
	FOREIGN KEY (account_id) REFERENCES accounts(id)
);
