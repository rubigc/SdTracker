package sddata

import (
	"encoding/json"
	"os"
)

func GetMoveName(move string) string {
	var jsonMap map[string]map[string]string
	data, _ := os.ReadFile("./data/moves.json")

	json.Unmarshal(data, &jsonMap)

	fancyMove := jsonMap[move]["name"]

	return fancyMove
}

func GetAbilityName(abilty string) string {
	var jsonMap map[string]map[string]string
	data, _ := os.ReadFile("./data/abilities.json")

	json.Unmarshal(data, &jsonMap)

	fancyAbility := jsonMap[abilty]["name"]

	return fancyAbility
}

func GetItemName(item string) string {
	var jsonMap map[string]map[string]string
	data, _ := os.ReadFile("./data/items.json")

	json.Unmarshal(data, &jsonMap)

	fancyItem := jsonMap[item]["name"]

	return fancyItem
}
