package db

const (
	QueryOverallWR = `
SELECT 
  (SELECT COUNT(*) FROM games
   JOIN game_players gp ON games.id = gp.game_id
   WHERE gp.player_name = ? AND games.winner = gp.player_name) AS wins,
  (SELECT COUNT(*) FROM game_players WHERE player_name = ?) AS total;
`

	QueryBO3WR = `
SELECT 
  SUM(CASE WHEN m.winner = p_index THEN 1 ELSE 0 END) AS wins,
  COUNT(*) AS total
FROM (
  SELECT m.id, m.winner, CASE WHEN m.player1 = ? THEN 1 ELSE 2 END AS p_index
  FROM matches m
  WHERE m.player1 = ? OR m.player2 = ?
) AS m;
`

	QueryBO3GamesWR = `
SELECT 
  game_number,
  COUNT(*) AS total,
  SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS wins
FROM games
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE player1 = ? OR player2 = ?
)
GROUP BY game_number
ORDER BY game_number;
`

	QueryLeadStats = `
SELECT 
  lead_pokemon AS pokemon,
  COUNT(*) AS total,
  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
FROM game_players gp
JOIN games g ON gp.game_id = g.id
WHERE gp.player_name = ?
  AND lead_pokemon IS NOT NULL
  AND lead_pokemon != ''
GROUP BY lead_pokemon;
`

	QueryLeadCombo = `
SELECT
  g.game_number,
  COUNT(*) AS total,
  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
FROM game_players gp
JOIN games g ON gp.game_id = g.id
WHERE gp.player_name = ?
  AND gp.lead_pokemon = ?
GROUP BY g.game_number
ORDER BY g.game_number;
`

	QueryPokemonStats = `
SELECT gp.team_pokemon, g.winner, gp.player_name
FROM game_players gp
JOIN games g ON gp.game_id = g.id
WHERE gp.player_name = ? AND gp.team_pokemon IS NOT NULL AND gp.team_pokemon != '';
`

	QueryPokemonVersus = `
SELECT
  (SELECT COUNT(DISTINCT g.id)
   FROM games g
   JOIN game_players gp ON g.id = gp.game_id
   JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != gp.player_name
   WHERE gp.player_name = ? AND opp.team_pokemon LIKE '%' || ? || '%' AND g.winner = gp.player_name) AS wins,
  (SELECT COUNT(DISTINCT g.id)
   FROM games g
   JOIN game_players gp ON g.id = gp.game_id
   JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != gp.player_name
   WHERE gp.player_name = ? AND opp.team_pokemon LIKE '%' || ? || '%') AS total;
`

	QueryTeraStats = `
SELECT tera_used AS tera_type, COUNT(*) AS total,
  SUM(CASE WHEN g.winner = gp.player_name THEN 1 ELSE 0 END) AS wins
FROM game_players gp
JOIN games g ON gp.game_id = g.id
WHERE gp.player_name = ? AND tera_used IS NOT NULL AND tera_used != ''
GROUP BY tera_used;
`

	QueryHistoryGames = `
SELECT g.*, m.player1, m.player2, m.match_date, 
       gp.team_pokemon AS player_team, gp.lead_pokemon AS player_lead, gp.tera_used AS player_tera,
       opp.player_name AS opponent, opp.team_pokemon AS opponent_team, opp.lead_pokemon AS opponent_lead, opp.tera_used AS opponent_tera
FROM games g
JOIN matches m ON g.match_id = m.id
JOIN game_players gp ON g.id = gp.game_id AND gp.player_name = ?
JOIN game_players opp ON g.id = opp.game_id AND opp.player_name != ?;
`

	QueryHistoryMatches = `
SELECT id, match_uuid, player1, player2, winner, match_date 
FROM matches 
WHERE player1 = ? OR player2 = ?;
`
)
