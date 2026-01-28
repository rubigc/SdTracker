package parsereplay

import (
	"errors"
	"regexp"
	"strconv"
	"strings"
	"unicode"

	"SdTracker/pkg/sddata"
)

var battleLogRegex = regexp.MustCompile(`(?s)<script[^>]*class="battle-log-data"[^>]*>(.*?)</script>`)

var ErrBattleLogNotFound = errors.New("battle log data not found")

// ExtractBattleLogLines extracts the raw battle log text from a Showdown replay HTML and splits it into lines.
// Trailing whitespace is trimmed from each line.
func ExtractBattleLogLines(replayHTML string) ([]string, error) {
	match := battleLogRegex.FindStringSubmatch(replayHTML)
	if len(match) < 2 {
		return nil, ErrBattleLogNotFound
	}

	raw := strings.ReplaceAll(match[1], "\r\n", "\n")
	raw = strings.ReplaceAll(raw, "\r", "\n")
	lines := strings.Split(raw, "\n")
	for i, line := range lines {
		lines[i] = strings.TrimRightFunc(line, unicode.IsSpace)
	}
	return lines, nil
}

type MoveUse struct {
	Move string
}

type BattleState struct {
	Turn int

	Active map[string]map[string]string // side -> slot -> monName

	MovesThisTurn map[string]MoveUse // key: side+slot
	LastMoveUsed  map[string]string  // key: monKey (side+monNormalized)

	TailwindTurns  map[string]int // side -> remaining turns
	TrickRoomTurns int

	TeraTurnByMon  map[string]int
	TeraUsedBySide map[string]bool

	PendingPivotSwitch map[string]bool // key: side+slot
	PendingFaint       map[string]bool // key: side+slot

	// Protect classification (per-turn): was the Protect targeted into?
	ProtectUsersThisTurn  map[string]string // slotKey -> monName
	ProtectGotHitThisTurn map[string]bool   // slotKey -> true if any opponent move targeted it this turn

	ProtectConsecutiveThisTurn map[string]bool // slotKey -> true if this Protect was consecutive with last turn

	LastProtectAttemptTurn map[string]int    // slotKey -> last turn a Protect-like move was attempted
	LastProtectAttemptMon  map[string]string // slotKey -> monName at time of last Protect attempt
}

type SwitchInEvent struct {
	Turn   int
	Side   string
	InMon  string
	Method string

	OppActive1   string
	OppActive2   string
	OppMove1     string
	OppMove2     string
	OppLastMove1 string
	OppLastMove2 string

	IntoKnockOff    bool
	IntoFakeOut     bool
	IntoSpread      bool
	IntoOppTailwind bool
	IntoTrickRoom   bool
	HpAfterPercent  *float64
}

type MonReplayStats struct {
	Side string
	Mon  string

	TurnsActive                    int
	MoveCount                      int
	AttackCount                    int
	ProtectCount                   int
	ProtectBaitedCount             int
	ProtectUselessCount            int
	ProtectConsecutiveAttemptCount int
	ProtectFailedCount             int
	ProtectConsecutiveFailedCount  int
	SwitchOutCount                 int
	SwitchInCount                  int
	PivotSwitchInCount             int
	ForcedSwitchInCount            int
	SetupCount                     int
	SpeedcontrolCount              int
	FakeOutCount                   int
	IntimidateEntryCount           int
	TeraUsed                       bool
	TeraTurn                       int

	SwitchinIntoKnockOffCount    int
	SwitchinIntoFakeOutCount     int
	SwitchinIntoSpreadCount      int
	SwitchinIntoOppTailwindCount int
	SwitchinIntoTrickRoomCount   int
	AvgHPAfterSwitchIn           *float64
}

type ReplaySideMetrics struct {
	Side string

	TotalTurns             int
	ProactivityRate        float64
	AggressionFactor       float64
	ProtectRate            float64
	SwitchRate             float64
	PivotDependence        float64
	SpeedcontrolCommitRate float64
	EarlyTera              bool
	EarlyTeraTurn          int
	TailwindSetCount       int
	TrickroomSetCount      int
	ReactiveSwitchRate     float64
	IntoKnockOffRate       float64
	IntoFakeOutRate        float64
}

type ReplayInstrumentation struct {
	SwitchIns   []SwitchInEvent
	MonStats    map[string]*MonReplayStats
	SideMetrics map[string]*ReplaySideMetrics
	TotalTurns  int
}

type monAgg struct {
	stats   MonReplayStats
	hpSum   float64
	hpCount int
}

type sideAgg struct {
	totalMoves               int
	attackCount              int
	setupCount               int
	speedcontrolCount        int
	protectCount             int
	switchOutCount           int
	totalSwitchIn            int
	pivotSwitchInCount       int
	switchinsIntoOppTailwind int
	switchinsIntoTrickRoom   int
	switchinsIntoKnockOff    int
	switchinsIntoFakeOut     int
	tailwindSetCount         int
	trickroomSetCount        int
	teraTurnMin              int
}

func ParseReplayInstrumentation(replayHTML string) (*ReplayInstrumentation, error) {
	lines, err := ExtractBattleLogLines(replayHTML)
	if err != nil {
		return nil, err
	}
	return AnalyzeBattleLogLines(lines)
}

func AnalyzeBattleLogLines(lines []string) (*ReplayInstrumentation, error) {
	state := newBattleState()
	monStats := map[string]*monAgg{}
	sideAggs := map[string]*sideAgg{
		"p1": {},
		"p2": {},
	}

	instrumentation := &ReplayInstrumentation{
		SwitchIns:   []SwitchInEvent{},
		MonStats:    map[string]*MonReplayStats{},
		SideMetrics: map[string]*ReplaySideMetrics{},
	}

	for _, line := range lines {
		if line == "" || !strings.HasPrefix(line, "|") {
			continue
		}

		parts := strings.Split(line, "|")
		if len(parts) < 2 {
			continue
		}

		msgType := parts[1]

		switch msgType {
		case "turn":
			if len(parts) < 3 {
				continue
			}
			turn, err := strconv.Atoi(strings.TrimSpace(parts[2]))
			if err != nil {
				continue
			}
			advanceTurn(state, monStats, turn)
			instrumentation.TotalTurns = turn
		case "switch":
			handleSwitch(state, monStats, sideAggs, &instrumentation.SwitchIns, parts, "switch")
		case "drag":
			handleSwitch(state, monStats, sideAggs, &instrumentation.SwitchIns, parts, "drag")
		case "move":
			handleMove(state, monStats, sideAggs, parts)
		case "faint":
			handleFaint(state, parts)
		case "-terastallize":
			handleTera(state, monStats, sideAggs, parts)
		case "-sidestart":
			handleSideStart(state, parts)
		case "-sideend":
			handleSideEnd(state, parts)
		case "-fieldstart":
			handleFieldStart(state, parts)
		case "-fieldend":
			handleFieldEnd(state, parts)
		case "-fail":
			handleFail(state, monStats, parts)
		case "-ability":
			handleAbility(state, monStats, parts)
		}
	}

	finalizeTurn(state, monStats)
	finalizeMonStats(monStats, instrumentation.MonStats)
	finalizeSideMetrics(sideAggs, instrumentation)

	return instrumentation, nil
}

func newBattleState() *BattleState {
	return &BattleState{
		Turn: 0,
		Active: map[string]map[string]string{
			"p1": {},
			"p2": {},
		},
		MovesThisTurn: map[string]MoveUse{},
		LastMoveUsed:  map[string]string{},
		TailwindTurns: map[string]int{
			"p1": 0,
			"p2": 0,
		},
		TrickRoomTurns:             0,
		TeraTurnByMon:              map[string]int{},
		TeraUsedBySide:             map[string]bool{},
		PendingPivotSwitch:         map[string]bool{},
		PendingFaint:               map[string]bool{},
		ProtectUsersThisTurn:       map[string]string{},
		ProtectGotHitThisTurn:      map[string]bool{},
		ProtectConsecutiveThisTurn: map[string]bool{},
		LastProtectAttemptTurn:     map[string]int{},
		LastProtectAttemptMon:      map[string]string{},
	}
}

func normalizeKey(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var b strings.Builder
	for _, r := range value {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func monKey(side, mon string) string {
	return side + "|" + normalizeKey(mon)
}

func parseSlotToken(token string) (side string, slot string, name string) {
	token = strings.TrimSpace(token)
	parts := strings.SplitN(token, ":", 2)
	slotToken := strings.TrimSpace(parts[0])
	if len(slotToken) < 3 {
		return "", "", ""
	}
	side = slotToken[:2]
	slot = slotToken[2:3]
	if len(parts) > 1 {
		name = strings.TrimSpace(parts[1])
	}
	return side, slot, name
}

func parseSideToken(token string) string {
	token = strings.TrimSpace(token)
	if token == "" {
		return ""
	}
	if strings.Contains(token, ":") {
		token = strings.SplitN(token, ":", 2)[0]
		token = strings.TrimSpace(token)
	}
	if len(token) >= 2 {
		side := token[:2]
		if side == "p1" || side == "p2" {
			return side
		}
	}
	return ""
}

func extractSpeciesFromSwitchParts(parts []string) string {
	speciesPart := ""
	if len(parts) >= 4 && strings.TrimSpace(parts[3]) != "" {
		speciesPart = parts[3]
	} else if len(parts) >= 3 {
		speciesPart = parts[2]
	}
	if speciesPart == "" {
		return ""
	}
	if strings.Contains(speciesPart, ",") {
		speciesPart = strings.Split(speciesPart, ",")[0]
	}
	if strings.Contains(speciesPart, ":") {
		speciesPart = strings.SplitN(speciesPart, ":", 2)[1]
	}
	return strings.TrimSpace(speciesPart)
}

func parseHPPercent(raw string) *float64 {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	if strings.Contains(raw, "fnt") {
		value := 0.0
		return &value
	}

	parts := strings.Split(raw, " ")
	hpToken := parts[0]
	if strings.HasSuffix(hpToken, "%") {
		trimmed := strings.TrimSuffix(hpToken, "%")
		val, err := strconv.ParseFloat(trimmed, 64)
		if err == nil {
			return &val
		}
	}

	if strings.Contains(hpToken, "/") {
		pieces := strings.SplitN(hpToken, "/", 2)
		if len(pieces) == 2 {
			cur, err1 := strconv.ParseFloat(pieces[0], 64)
			max, err2 := strconv.ParseFloat(pieces[1], 64)
			if err1 == nil && err2 == nil && max > 0 {
				value := (cur / max) * 100.0
				return &value
			}
		}
	}

	return nil
}

func opponentSide(side string) string {
	if side == "p1" {
		return "p2"
	}
	if side == "p2" {
		return "p1"
	}
	return ""
}

func advanceTurn(state *BattleState, monStats map[string]*monAgg, turn int) {
	finalizeTurn(state, monStats)
	if state.Turn > 0 {
		decrementField(state)
	}
	state.Turn = turn
	state.MovesThisTurn = map[string]MoveUse{}
	state.PendingPivotSwitch = map[string]bool{}
	state.ProtectUsersThisTurn = map[string]string{}
	state.ProtectGotHitThisTurn = map[string]bool{}
	state.ProtectConsecutiveThisTurn = map[string]bool{}

	if turn <= 0 {
		return
	}

	for side, slots := range state.Active {
		for _, mon := range slots {
			if mon == "" {
				continue
			}
			stats := ensureMonStats(monStats, side, mon)
			stats.stats.TurnsActive++
		}
	}
}

func finalizeTurn(state *BattleState, monStats map[string]*monAgg) {
	if state.Turn <= 0 {
		return
	}
	for slotKey, mon := range state.ProtectUsersThisTurn {
		if len(slotKey) < 3 || mon == "" {
			continue
		}
		side := slotKey[:2]
		stats := ensureMonStats(monStats, side, mon)
		if state.ProtectGotHitThisTurn[slotKey] {
			stats.stats.ProtectBaitedCount++
		} else {
			stats.stats.ProtectUselessCount++
		}
	}
}

func decrementField(state *BattleState) {
	for side, remaining := range state.TailwindTurns {
		if remaining > 0 {
			state.TailwindTurns[side] = remaining - 1
		}
	}
	if state.TrickRoomTurns > 0 {
		state.TrickRoomTurns--
	}
}

func ensureMonStats(monStats map[string]*monAgg, side string, mon string) *monAgg {
	key := monKey(side, mon)
	stats, ok := monStats[key]
	if !ok {
		stats = &monAgg{stats: MonReplayStats{Side: side, Mon: mon}}
		monStats[key] = stats
	}
	return stats
}

func handleSwitch(state *BattleState, monStats map[string]*monAgg, sideAggs map[string]*sideAgg, events *[]SwitchInEvent, parts []string, switchType string) {
	if len(parts) < 3 {
		return
	}
	actorToken := parts[2]
	side, slot, _ := parseSlotToken(actorToken)
	if side == "" || slot == "" {
		return
	}
	slotKey := side + slot
	wasFaint := state.PendingFaint[slotKey]

	method := "voluntary_switch"
	if state.Turn == 0 {
		method = "lead"
	}
	if wasFaint {
		method = "replacement_after_faint"
		state.PendingFaint[slotKey] = false
	} else if switchType == "drag" {
		method = "forced_drag"
	} else if state.PendingPivotSwitch[slotKey] {
		method = "pivot_switch"
	}
	state.PendingPivotSwitch[slotKey] = false

	incoming := extractSpeciesFromSwitchParts(parts)
	incoming = strings.TrimSpace(incoming)
	if incoming == "" {
		return
	}

	outgoing := state.Active[side][slot]
	if outgoing != "" && !wasFaint {
		outStats := ensureMonStats(monStats, side, outgoing)
		outStats.stats.SwitchOutCount++
		sideAggs[side].switchOutCount++
	}

	oppSide := opponentSide(side)
	oppActiveA := state.Active[oppSide]["a"]
	oppActiveB := state.Active[oppSide]["b"]
	oppMoveA := ""
	oppMoveB := ""
	oppLastA := ""
	oppLastB := ""

	if move, ok := state.MovesThisTurn[oppSide+"a"]; ok {
		oppMoveA = move.Move
	} else if oppActiveA != "" {
		oppLastA = state.LastMoveUsed[monKey(oppSide, oppActiveA)]
	}
	if move, ok := state.MovesThisTurn[oppSide+"b"]; ok {
		oppMoveB = move.Move
	} else if oppActiveB != "" {
		oppLastB = state.LastMoveUsed[monKey(oppSide, oppActiveB)]
	}

	intoKnockOff := opponentUsedCategoryThisTurn(state, oppSide, sddata.IsKnockOff)
	if !intoKnockOff {
		intoKnockOff = opponentUsedCategoryLastTurn(state, oppSide, sddata.IsKnockOff)
	}
	intoFakeOut := opponentUsedCategoryThisTurn(state, oppSide, sddata.IsFakeOut)
	if !intoFakeOut {
		intoFakeOut = opponentUsedCategoryLastTurn(state, oppSide, sddata.IsFakeOut)
	}
	intoSpread := opponentUsedCategoryThisTurn(state, oppSide, sddata.IsSpread)
	if !intoSpread {
		intoSpread = opponentUsedCategoryLastTurn(state, oppSide, sddata.IsSpread)
	}

	intoTailwind := state.TailwindTurns[oppSide] > 0
	intoTrickRoom := state.TrickRoomTurns > 0

	var hpAfter *float64
	if len(parts) >= 5 {
		hpAfter = parseHPPercent(parts[4])
	}

	event := SwitchInEvent{
		Turn:            state.Turn,
		Side:            side,
		InMon:           incoming,
		Method:          method,
		OppActive1:      oppActiveA,
		OppActive2:      oppActiveB,
		OppMove1:        oppMoveA,
		OppMove2:        oppMoveB,
		OppLastMove1:    oppLastA,
		OppLastMove2:    oppLastB,
		IntoKnockOff:    intoKnockOff,
		IntoFakeOut:     intoFakeOut,
		IntoSpread:      intoSpread,
		IntoOppTailwind: intoTailwind,
		IntoTrickRoom:   intoTrickRoom,
		HpAfterPercent:  hpAfter,
	}
	*events = append(*events, event)

	inStats := ensureMonStats(monStats, side, incoming)
	inStats.stats.SwitchInCount++
	sideAggs[side].totalSwitchIn++
	if method == "pivot_switch" {
		inStats.stats.PivotSwitchInCount++
		sideAggs[side].pivotSwitchInCount++
	}
	if method == "forced_drag" {
		inStats.stats.ForcedSwitchInCount++
	}
	if intoKnockOff {
		inStats.stats.SwitchinIntoKnockOffCount++
		sideAggs[side].switchinsIntoKnockOff++
	}
	if intoFakeOut {
		inStats.stats.SwitchinIntoFakeOutCount++
		sideAggs[side].switchinsIntoFakeOut++
	}
	if intoSpread {
		inStats.stats.SwitchinIntoSpreadCount++
	}
	if intoTailwind {
		inStats.stats.SwitchinIntoOppTailwindCount++
		sideAggs[side].switchinsIntoOppTailwind++
	}
	if intoTrickRoom {
		inStats.stats.SwitchinIntoTrickRoomCount++
		sideAggs[side].switchinsIntoTrickRoom++
	}
	if hpAfter != nil {
		inStats.hpSum += *hpAfter
		inStats.hpCount++
	}

	if state.Active[side] == nil {
		state.Active[side] = map[string]string{}
	}
	state.Active[side][slot] = incoming

	// Leaving the field resets consecutive Protect tracking for that slot.
	state.LastProtectAttemptTurn[slotKey] = 0
	state.LastProtectAttemptMon[slotKey] = ""
}

func opponentUsedCategoryThisTurn(state *BattleState, oppSide string, check func(string) bool) bool {
	for _, slot := range []string{"a", "b"} {
		move, ok := state.MovesThisTurn[oppSide+slot]
		if ok && check(move.Move) {
			return true
		}
	}
	return false
}

func opponentUsedCategoryLastTurn(state *BattleState, oppSide string, check func(string) bool) bool {
	for _, slot := range []string{"a", "b"} {
		mon := state.Active[oppSide][slot]
		if mon == "" {
			continue
		}
		move := state.LastMoveUsed[monKey(oppSide, mon)]
		if move != "" && check(move) {
			return true
		}
	}
	return false
}

func handleMove(state *BattleState, monStats map[string]*monAgg, sideAggs map[string]*sideAgg, parts []string) {
	if len(parts) < 4 {
		return
	}
	actorToken := parts[2]
	moveName := strings.TrimSpace(parts[3])
	if moveName == "" {
		return
	}

	side, slot, fallbackName := parseSlotToken(actorToken)
	if side == "" || slot == "" {
		return
	}

	slotKey := side + slot
	state.MovesThisTurn[slotKey] = MoveUse{Move: moveName}

	monName := state.Active[side][slot]
	if monName == "" {
		monName = fallbackName
	}
	monName = strings.TrimSpace(monName)
	if monName == "" {
		return
	}

	monKeyValue := monKey(side, monName)
	state.LastMoveUsed[monKeyValue] = moveName

	stats := ensureMonStats(monStats, side, monName)
	stats.stats.MoveCount++
	sideAggs[side].totalMoves++

	if sddata.IsProtect(moveName) {
		stats.stats.ProtectCount++
		sideAggs[side].protectCount++
		state.ProtectUsersThisTurn[slotKey] = monName

		if state.LastProtectAttemptTurn[slotKey] == state.Turn-1 && state.LastProtectAttemptMon[slotKey] == monName {
			stats.stats.ProtectConsecutiveAttemptCount++
			state.ProtectConsecutiveThisTurn[slotKey] = true
		} else {
			state.ProtectConsecutiveThisTurn[slotKey] = false
		}
		state.LastProtectAttemptTurn[slotKey] = state.Turn
		state.LastProtectAttemptMon[slotKey] = monName
	} else if sddata.IsSetup(moveName) {
		stats.stats.SetupCount++
		sideAggs[side].setupCount++
	} else if sddata.IsSpeedControl(moveName) {
		stats.stats.SpeedcontrolCount++
		sideAggs[side].speedcontrolCount++
	} else {
		stats.stats.AttackCount++
		sideAggs[side].attackCount++
	}

	if sddata.IsFakeOut(moveName) {
		stats.stats.FakeOutCount++
	}

	if sddata.IsPivot(moveName) {
		state.PendingPivotSwitch[slotKey] = true
	}

	markProtectTargetsFromMove(state, side, parts)

	if strings.EqualFold(moveName, "Tailwind") {
		sideAggs[side].tailwindSetCount++
	}
	if strings.EqualFold(moveName, "Trick Room") {
		sideAggs[side].trickroomSetCount++
	}
}

func markProtectTargetsFromMove(state *BattleState, actorSide string, parts []string) {
	if len(state.ProtectUsersThisTurn) == 0 {
		return
	}

	// Standard move format: |move|pXa: Mon|Move|pYb: Target|...
	// Spread format includes: |[spread] p1a,p1b
	targetSlots := map[string]struct{}{}
	if len(parts) >= 5 {
		targetToken := strings.TrimSpace(parts[4])
		targetSide, targetSlot, _ := parseSlotToken(targetToken)
		if targetSide != "" && targetSlot != "" {
			targetSlots[targetSide+targetSlot] = struct{}{}
		}
	}

	for _, part := range parts[5:] {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, "[spread]") {
			spread := strings.TrimSpace(strings.TrimPrefix(part, "[spread]"))
			for _, slotID := range strings.Split(spread, ",") {
				slotID = strings.TrimSpace(slotID)
				if len(slotID) >= 3 {
					targetSlots[slotID[:2]+slotID[2:3]] = struct{}{}
				}
			}
		}
	}

	for targetSlotKey := range targetSlots {
		if len(targetSlotKey) < 3 {
			continue
		}
		targetSide := targetSlotKey[:2]
		if targetSide == "" || targetSide == actorSide {
			continue
		}
		if _, ok := state.ProtectUsersThisTurn[targetSlotKey]; ok {
			state.ProtectGotHitThisTurn[targetSlotKey] = true
		}
	}
}

func handleFaint(state *BattleState, parts []string) {
	if len(parts) < 3 {
		return
	}
	side, slot, _ := parseSlotToken(parts[2])
	if side == "" || slot == "" {
		return
	}
	slotKey := side + slot
	state.PendingFaint[slotKey] = true
	if state.Active[side] != nil {
		state.Active[side][slot] = ""
	}

	// Leaving the field resets consecutive Protect tracking for that slot.
	state.LastProtectAttemptTurn[slotKey] = 0
	state.LastProtectAttemptMon[slotKey] = ""
}

func handleTera(state *BattleState, monStats map[string]*monAgg, sideAggs map[string]*sideAgg, parts []string) {
	if len(parts) < 3 {
		return
	}
	side, slot, fallbackName := parseSlotToken(parts[2])
	if side == "" || slot == "" {
		return
	}
	monName := state.Active[side][slot]
	if monName == "" {
		monName = fallbackName
	}
	monName = strings.TrimSpace(monName)
	if monName == "" {
		return
	}

	monKeyValue := monKey(side, monName)
	state.TeraTurnByMon[monKeyValue] = state.Turn
	state.TeraUsedBySide[side] = true

	stats := ensureMonStats(monStats, side, monName)
	stats.stats.TeraUsed = true
	stats.stats.TeraTurn = state.Turn

	if sideAggs[side].teraTurnMin == 0 || state.Turn < sideAggs[side].teraTurnMin {
		sideAggs[side].teraTurnMin = state.Turn
	}
}

func handleSideStart(state *BattleState, parts []string) {
	if len(parts) < 4 {
		return
	}
	side := parseSideToken(parts[2])
	if side == "" {
		return
	}
	if strings.Contains(parts[3], "Tailwind") {
		state.TailwindTurns[side] = 4
	}
}

func handleSideEnd(state *BattleState, parts []string) {
	if len(parts) < 4 {
		return
	}
	side := parseSideToken(parts[2])
	if side == "" {
		return
	}
	if strings.Contains(parts[3], "Tailwind") {
		state.TailwindTurns[side] = 0
	}
}

func handleFieldStart(state *BattleState, parts []string) {
	if len(parts) < 3 {
		return
	}
	if strings.Contains(parts[2], "Trick Room") {
		state.TrickRoomTurns = 5
	}
}

func handleFieldEnd(state *BattleState, parts []string) {
	if len(parts) < 3 {
		return
	}
	if strings.Contains(parts[2], "Trick Room") {
		state.TrickRoomTurns = 0
	}
}

func handleAbility(state *BattleState, monStats map[string]*monAgg, parts []string) {
	if len(parts) < 4 {
		return
	}
	if !strings.EqualFold(strings.TrimSpace(parts[3]), "Intimidate") {
		return
	}
	side, slot, fallbackName := parseSlotToken(parts[2])
	if side == "" || slot == "" {
		return
	}
	monName := state.Active[side][slot]
	if monName == "" {
		monName = fallbackName
	}
	monName = strings.TrimSpace(monName)
	if monName == "" {
		return
	}
	stats := ensureMonStats(monStats, side, monName)
	stats.stats.IntimidateEntryCount++
}

func handleFail(state *BattleState, monStats map[string]*monAgg, parts []string) {
	// Typical Protect failure line:
	// |-fail|p1a: Foo|move: Protect
	if len(parts) < 4 {
		return
	}

	failReason := strings.TrimSpace(parts[3])
	if !strings.HasPrefix(failReason, "move:") {
		return
	}

	failedMove := strings.TrimSpace(strings.TrimPrefix(failReason, "move:"))
	if failedMove == "" || !sddata.IsProtect(failedMove) {
		return
	}

	side, slot, fallbackName := parseSlotToken(parts[2])
	if side == "" || slot == "" {
		return
	}
	slotKey := side + slot

	monName := state.ProtectUsersThisTurn[slotKey]
	if monName == "" {
		monName = state.Active[side][slot]
	}
	if monName == "" {
		monName = fallbackName
	}
	monName = strings.TrimSpace(monName)
	if monName == "" {
		return
	}

	stats := ensureMonStats(monStats, side, monName)
	stats.stats.ProtectFailedCount++
	if state.ProtectConsecutiveThisTurn[slotKey] {
		stats.stats.ProtectConsecutiveFailedCount++
	}
}

func finalizeMonStats(monStats map[string]*monAgg, out map[string]*MonReplayStats) {
	for key, agg := range monStats {
		stats := agg.stats
		if agg.hpCount > 0 {
			avg := agg.hpSum / float64(agg.hpCount)
			stats.AvgHPAfterSwitchIn = &avg
		}
		out[key] = &stats
	}
}

func finalizeSideMetrics(sideAggs map[string]*sideAgg, instr *ReplayInstrumentation) {
	for side, agg := range sideAggs {
		totalActions := agg.totalMoves + agg.switchOutCount
		if totalActions == 0 {
			totalActions = 1
		}

		teraUsedCount := 0
		if agg.teraTurnMin > 0 {
			teraUsedCount = 1
		}

		proactivity := float64(agg.attackCount+agg.setupCount+agg.speedcontrolCount+teraUsedCount) / float64(totalActions)
		aggressionDenom := agg.protectCount + agg.switchOutCount
		if aggressionDenom == 0 {
			aggressionDenom = 1
		}
		aggression := float64(agg.attackCount+agg.setupCount) / float64(aggressionDenom)
		protectRate := float64(agg.protectCount) / float64(totalActions)
		switchRate := float64(agg.switchOutCount) / float64(totalActions)

		switchInDenom := agg.totalSwitchIn
		if switchInDenom == 0 {
			switchInDenom = 1
		}
		pivotDependence := float64(agg.pivotSwitchInCount) / float64(switchInDenom)
		reactiveSwitchRate := float64(agg.switchinsIntoOppTailwind+agg.switchinsIntoTrickRoom) / float64(switchInDenom)
		intoKnockOffRate := float64(agg.switchinsIntoKnockOff) / float64(switchInDenom)
		intoFakeOutRate := float64(agg.switchinsIntoFakeOut) / float64(switchInDenom)

		speedcontrolCommitRate := 0.0
		if agg.tailwindSetCount > 0 || agg.trickroomSetCount > 0 {
			speedcontrolCommitRate = 1.0
		}

		metrics := &ReplaySideMetrics{
			Side:                   side,
			TotalTurns:             instr.TotalTurns,
			ProactivityRate:        proactivity,
			AggressionFactor:       aggression,
			ProtectRate:            protectRate,
			SwitchRate:             switchRate,
			PivotDependence:        pivotDependence,
			SpeedcontrolCommitRate: speedcontrolCommitRate,
			EarlyTera:              agg.teraTurnMin > 0 && agg.teraTurnMin <= 3,
			EarlyTeraTurn:          agg.teraTurnMin,
			TailwindSetCount:       agg.tailwindSetCount,
			TrickroomSetCount:      agg.trickroomSetCount,
			ReactiveSwitchRate:     reactiveSwitchRate,
			IntoKnockOffRate:       intoKnockOffRate,
			IntoFakeOutRate:        intoFakeOutRate,
		}

		instr.SideMetrics[side] = metrics
	}
}
