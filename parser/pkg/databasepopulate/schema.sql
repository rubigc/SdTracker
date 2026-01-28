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

CREATE TABLE IF NOT EXISTS replay_switchins (
	replay_id TEXT NOT NULL,
	side TEXT NOT NULL,
	turn INTEGER NOT NULL,
	in_mon TEXT NOT NULL,
	method TEXT NOT NULL,
	opp_active_1 TEXT,
	opp_active_2 TEXT,
	opp_move_1 TEXT,
	opp_move_2 TEXT,
	opp_last_move_1 TEXT,
	opp_last_move_2 TEXT,
	into_knock_off INTEGER,
	into_fake_out INTEGER,
	into_spread INTEGER,
	into_opp_tailwind INTEGER,
	into_trick_room INTEGER,
	hp_after_percent REAL,
	PRIMARY KEY (replay_id, side, turn, in_mon, method)
);

CREATE TABLE IF NOT EXISTS replay_mon_stats (
	replay_id TEXT NOT NULL,
	side TEXT NOT NULL,
	mon TEXT NOT NULL,
	turns_active INTEGER,
	move_count INTEGER,
	attack_count INTEGER,
	protect_count INTEGER,
	protect_baited_count INTEGER,
	protect_useless_count INTEGER,
	protect_consecutive_attempt_count INTEGER,
	protect_fail_count INTEGER,
	protect_consecutive_fail_count INTEGER,
	switch_out_count INTEGER,
	switch_in_count INTEGER,
	pivot_switch_in_count INTEGER,
	forced_switch_in_count INTEGER,
	setup_count INTEGER,
	speedcontrol_count INTEGER,
	fake_out_count INTEGER,
	intimidate_entry_count INTEGER,
	tera_used INTEGER,
	tera_turn INTEGER,
	switchin_into_knock_off_count INTEGER,
	switchin_into_fake_out_count INTEGER,
	switchin_into_spread_count INTEGER,
	switchin_into_opp_tailwind_count INTEGER,
	switchin_into_trick_room_count INTEGER,
	avg_hp_after_switchin REAL,
	PRIMARY KEY (replay_id, side, mon)
);

CREATE TABLE IF NOT EXISTS replay_side_metrics (
	replay_id TEXT NOT NULL,
	side TEXT NOT NULL,
	total_turns INTEGER,
	proactivity_rate REAL,
	aggression_factor REAL,
	protect_rate REAL,
	switch_rate REAL,
	pivot_dependence REAL,
	early_tera INTEGER,
	early_tera_turn INTEGER,
	tailwind_set_count INTEGER,
	trickroom_set_count INTEGER,
	reactive_switch_rate REAL,
	into_knock_off_rate REAL,
	into_fake_out_rate REAL,
	speedcontrol_commit_rate REAL,
	PRIMARY KEY (replay_id, side)
);
