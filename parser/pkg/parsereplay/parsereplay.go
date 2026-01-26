package parsereplay

import (
	"SdTracker/pkg/sddata"
	"fmt"
	"regexp"
	"strings"
)

type Pokemon struct {
	Name     string
	Item     string
	Ability  string
	Moves    []string
	Gender   string
	Level    int
	TeraType string
}

type Team struct {
	Pokemons []Pokemon
}

func removeDuplicates(input []string) []string {
	var result []string

	for _, str := range input {
		skip := false
		for _, existing := range result {
			if strings.Contains(str, existing) || strings.Contains(existing, str) {
				skip = true
				break
			}
		}
		if !skip {
			result = append(result, str)
		}
	}

	return result
}

func searchLineWithPrefix(text string, prefix string) string {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, prefix) {
			return line
		}
	}
	return ""
}

func findAllLinesWithSubstring(text string, substr string) []string {
	lines := strings.Split(text, "\n")
	var results []string

	for _, line := range lines {
		if strings.Contains(line, substr) {
			results = append(results, line)
		}
	}

	return results
}

func GetOts(replay string, player int) string {
	ots := ""

	if player == 1 {
		ots = searchLineWithPrefix(replay, "|showteam|p1|")
		ots = strings.ReplaceAll(ots, "|showteam|p1|", "")
	}
	if player == 2 {
		ots = searchLineWithPrefix(replay, "|showteam|p2|")
		ots = strings.ReplaceAll(ots, "|showteam|p2|", "")
	}

	otsTeam := parseTeam(ots)

	ots = parsePaste(otsTeam)

	return ots
}

func GetPlayerIdByName(replay string, playerName string) int {
	player := 0
	playerstring := "|player|p1|" + playerName

	if searchLineWithPrefix(replay, playerstring) == "" {
		player = 2
	} else {
		player = 1
	}

	return player
}

func GetPlayerNameById(replay string, id int) string {
	player := ""
	if id == 1 {
		player = searchLineWithPrefix(replay, "|player|p1|")
		player = strings.ReplaceAll(player, "|player|p1|", "")
	} else {
		player = searchLineWithPrefix(replay, "|player|p2|")
		player = strings.ReplaceAll(player, "|player|p2|", "")
	}

	temp := strings.Split(player, "|")
	player = temp[0]

	return player
}

func parsePaste(team Team) string {
	paste := ""

	for _, pokemon := range team.Pokemons {
		paste = fmt.Sprintf("%s%s @ %s  \n", paste, pokemon.Name, pokemon.Item)
		paste = fmt.Sprintf("%sAbility: %s  \n", paste, pokemon.Ability)
		paste = fmt.Sprintf("%sTera Type: %s  \n", paste, pokemon.TeraType)
		paste = fmt.Sprintf("%s- %s  \n- %s  \n- %s  \n- %s  \n", paste, pokemon.Moves[0], pokemon.Moves[1], pokemon.Moves[2], pokemon.Moves[3])
		paste = fmt.Sprintf("%s\n", paste)
	}
	return paste
}

func parseTeam(teamStr string) Team {
	pokemonStrs := strings.Split(teamStr, "]")

	var pokemons []Pokemon
	for _, pokemonStr := range pokemonStrs {
		if pokemonStr != "" {
			pokemon := parsePokemon(pokemonStr)
			pokemons = append(pokemons, pokemon)
		}
	}

	return Team{Pokemons: pokemons}
}

func parsePokemon(pokemonStr string) Pokemon {
	parts := strings.Split(pokemonStr, "|")
	if len(parts) < 11 {
		return Pokemon{}
	}

	name := parts[0]
	item := parts[2]
	ability := parts[3]
	movesStr := parts[4]
	gender := parts[7]
	level := 50

	teraType := strings.ReplaceAll(parts[11], ",", "")

	moves := strings.Split(movesStr, ",")

	for x, move := range moves {
		moves[x] = sddata.GetMoveName(strings.ToLower(move)) //find the correct function for this
	}

	item = sddata.GetItemName(strings.ToLower(item))
	ability = sddata.GetAbilityName(strings.ToLower(ability))

	return Pokemon{
		Name:     name,
		Item:     item,
		Ability:  ability,
		Moves:    moves,
		Gender:   gender,
		Level:    level,
		TeraType: teraType,
	}
}

func GetWhoWonId(replay string) int {
	winner := searchLineWithPrefix(replay, "|win|")
	winner = strings.ReplaceAll(winner, "|win|", "")
	return GetPlayerIdByName(replay, winner)
}

func GetLeadFromPlayerId(replay string, player int) []string {
	var lead []string
	var l1, l2 string
	var searchString string

	if player == 1 {
		searchString = "|switch|p1"
	} else {
		searchString = "|switch|p2"
	}

	l1 = searchLineWithPrefix(replay, searchString+"a:")
	l2 = searchLineWithPrefix(replay, searchString+"b:")

	// Extract the full species name with form from index 2 instead of nickname from index 3
	// Switch line format: |switch|p1a: Nickname|Species, L50, F|100/100
	l1 = strings.Split(l1, "|")[2]
	l1 = strings.Split(l1, ",")[0]
	l2 = strings.Split(l2, "|")[2]
	l2 = strings.Split(l2, ",")[0]

	lead = append(lead, l1)
	lead = append(lead, l2)

	return lead
}

func GetAllPlayedPokemonFromPlayerId(replay string, player int) []string {
	var playedPokemon []string
	var searchString string

	if player == 1 {
		searchString = "|switch|p1"
	} else {
		searchString = "|switch|p2"
	}

	unparsedList := findAllLinesWithSubstring(replay, searchString)

	for x := range unparsedList {
		// Extract the full species name with form from index 2 instead of nickname from index 3
		// Switch line format: |switch|p1a: Nickname|Species, L50, F|100/100
		unparsedList[x] = strings.Split(unparsedList[x], "|")[2]
		unparsedList[x] = strings.Split(unparsedList[x], ",")[0]
	}
	playedPokemon = removeDuplicates(unparsedList)

	return playedPokemon
}

func GetGameNumber(replay string) int {
	checkString := strings.Index(replay, ">Game 1<")
	if checkString != -1 {
		return 1
	}
	checkString = strings.Index(replay, ">Game 2<")
	if checkString != -1 {
		return 2
	}
	return 3
}

func GetMatchUUID(replay string) string {
	parseLine := searchLineWithPrefix(replay, "|uhtml|bestof|<h2><strong>Game ")
	re := regexp.MustCompile(`game-bestof3-[^"]*-(\d+-[a-z0-9]+)`)
	match := re.FindStringSubmatch(parseLine)
	if len(match) > 1 {
		return match[1]
	}
	return ""
}

func GetTera(replay string, playerId int) string {
	var parseLine string
	if playerId == 1 {
		parseLine = searchLineWithPrefix(replay, "|-terastallize|p1")
	} else {
		parseLine = searchLineWithPrefix(replay, "|-terastallize|p2")
	}
	if len(parseLine) > 1 {
		parseLine = strings.Split(parseLine, "|")[2]
		parseLine = strings.Split(parseLine, ":")[1]
		parseLine = strings.ReplaceAll(parseLine, " ", "")
		return parseLine
	}
	return "-"
}

// MoveUsage represents a move used by a Pokemon in a game
type MoveUsage struct {
	PokemonName string
	MoveName    string
}

// GetMoveUsage extracts all moves used by a player during a game
func GetMoveUsage(replay string, playerId int) []MoveUsage {
	var moveUsages []MoveUsage
	var searchString string

	if playerId == 1 {
		searchString = "|move|p1"
	} else {
		searchString = "|move|p2"
	}

	moveLines := findAllLinesWithSubstring(replay, searchString)

	for _, line := range moveLines {
		// Move line format: |move|p1a: Pokemon|Move Name|Target
		parts := strings.Split(line, "|")
		if len(parts) >= 4 {
			// Extract Pokemon name (e.g., "p1a: Pokemon" -> "Pokemon")
			pokemonPart := parts[2]
			pokemonName := strings.Split(pokemonPart, ":")[1]
			pokemonName = strings.TrimSpace(pokemonName)

			// Extract move name
			moveName := parts[3]
			moveName = strings.TrimSpace(moveName)

			// Skip if move name is empty or is a special move
			if moveName != "" && moveName != "Struggle" {
				moveUsages = append(moveUsages, MoveUsage{
					PokemonName: pokemonName,
					MoveName:    moveName,
				})
			}
		}
	}

	return moveUsages
}

// GetPokemonMovesFromTeam extracts the moves from a team's OTS (showteam) data
func GetPokemonMovesFromTeam(replay string, playerId int) map[string][]string {
	pokemonMoves := make(map[string][]string)

	ots := GetOts(replay, playerId)
	team := parseTeam(ots)

	for _, pokemon := range team.Pokemons {
		pokemonMoves[pokemon.Name] = pokemon.Moves
	}

	return pokemonMoves
}
