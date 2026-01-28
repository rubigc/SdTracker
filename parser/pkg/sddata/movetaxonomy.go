package sddata

import (
	"encoding/json"
	"os"
	"strings"
	"sync"
)

type MoveTaxonomy struct {
	ProtectMoves      []string `json:"protect_moves"`
	SetupMoves        []string `json:"setup_moves"`
	SpeedControlMoves []string `json:"speedcontrol_moves"`
	PivotMoves        []string `json:"pivot_moves"`
	SpreadMoves       []string `json:"spread_moves"`
	PriorityMoves     []string `json:"priority_moves"`
	KnockoffMoves     []string `json:"knockoff_moves"`
}

type moveTaxonomyCache struct {
	once sync.Once
	data MoveTaxonomy
	err  error
	sets map[string]map[string]struct{}
}

var taxonomyCache moveTaxonomyCache

func normalizeMoveName(move string) string {
	move = strings.ToLower(strings.TrimSpace(move))
	var b strings.Builder
	for _, r := range move {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func buildMoveSet(moves []string) map[string]struct{} {
	set := make(map[string]struct{}, len(moves))
	for _, move := range moves {
		normalized := normalizeMoveName(move)
		if normalized == "" {
			continue
		}
		set[normalized] = struct{}{}
	}
	return set
}

func loadMoveTaxonomy() {
	paths := []string{
		"./data/move_taxonomy.json",
		"../data/move_taxonomy.json",
		"../../data/move_taxonomy.json",
		"../../../data/move_taxonomy.json",
	}

	var data []byte
	var err error
	for _, path := range paths {
		data, err = os.ReadFile(path)
		if err == nil {
			break
		}
	}
	if err != nil {
		taxonomyCache.err = err
		return
	}

	if err := json.Unmarshal(data, &taxonomyCache.data); err != nil {
		taxonomyCache.err = err
		return
	}

	taxonomyCache.sets = map[string]map[string]struct{}{
		"protect":      buildMoveSet(taxonomyCache.data.ProtectMoves),
		"setup":        buildMoveSet(taxonomyCache.data.SetupMoves),
		"speedcontrol": buildMoveSet(taxonomyCache.data.SpeedControlMoves),
		"pivot":        buildMoveSet(taxonomyCache.data.PivotMoves),
		"spread":       buildMoveSet(taxonomyCache.data.SpreadMoves),
		"priority":     buildMoveSet(taxonomyCache.data.PriorityMoves),
		"knockoff":     buildMoveSet(taxonomyCache.data.KnockoffMoves),
	}
}

func moveInSet(setName string, move string) bool {
	taxonomyCache.once.Do(loadMoveTaxonomy)
	if taxonomyCache.err != nil {
		return false
	}
	set, ok := taxonomyCache.sets[setName]
	if !ok {
		return false
	}
	_, exists := set[normalizeMoveName(move)]
	return exists
}

func IsProtect(move string) bool {
	return moveInSet("protect", move)
}

func IsSetup(move string) bool {
	return moveInSet("setup", move)
}

func IsSpeedControl(move string) bool {
	return moveInSet("speedcontrol", move)
}

func IsPivot(move string) bool {
	return moveInSet("pivot", move)
}

func IsSpread(move string) bool {
	return moveInSet("spread", move)
}

func IsPriority(move string) bool {
	return moveInSet("priority", move)
}

func IsKnockOff(move string) bool {
	return moveInSet("knockoff", move)
}

func IsFakeOut(move string) bool {
	return normalizeMoveName(move) == "fakeout"
}
