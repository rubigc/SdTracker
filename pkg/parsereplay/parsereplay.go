package parsereplay

import (
	"SdTracker/pkg/sddata"
	"fmt"
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

func searchLineWithPrefix(text, prefix string) string {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, prefix) {
			return line
		}
	}
	return ""
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
	playerstring := "|player|p1|"
	playerstring += playerName

	if searchLineWithPrefix(replay, playerName) == "" {
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

func WhoWon(replay string) int {
	winner := searchLineWithPrefix(replay, "|win|")
	winner = strings.ReplaceAll(winner, "|win|", "")

	return GetPlayerIdByName(replay, winner)
}
