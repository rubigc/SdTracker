package parsereplay

import (
	"os"
	"path/filepath"
	"testing"
)

func TestExtractBattleLogLines(t *testing.T) {
	html := `<html><script type="text/plain" class="battle-log-data">|turn|1
|move|p1a: Foo|Protect|p1a: Foo   
</script></html>`

	lines, err := ExtractBattleLogLines(html)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(lines) < 2 {
		t.Fatalf("expected at least 2 lines, got %d", len(lines))
	}
	if lines[1] != "|move|p1a: Foo|Protect|p1a: Foo" {
		t.Fatalf("expected trimmed line, got %q", lines[1])
	}
}

func TestAnalyzeBattleLogLines_Minimal(t *testing.T) {
	lines := []string{
		"|switch|p1a: Incineroar|Incineroar, L50, M|100/100",
		"|switch|p1b: Amoonguss|Amoonguss, L50, M|100/100",
		"|switch|p2a: Incineroar|Incineroar, L50, M|100/100",
		"|switch|p2b: Tornadus|Tornadus, L50, M|100/100",
		"|turn|1",
		"|move|p2a: Incineroar|Fake Out|p1a: Incineroar",
		"|move|p2b: Tornadus|U-turn|p1a: Incineroar",
		"|switch|p2b: Rillaboom|Rillaboom, L50, M|100/100",
		"|turn|2",
		"|switch|p1a: Gholdengo|Gholdengo, L50, M|100/100",
		"|move|p1a: Gholdengo|Protect|p1a: Gholdengo",
		"|-terastallize|p1a: Gholdengo|Steel",
	}

	instr, err := AnalyzeBattleLogLines(lines)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(instr.SwitchIns) != 6 {
		t.Fatalf("expected 6 switch-ins, got %d", len(instr.SwitchIns))
	}
	if instr.SwitchIns[0].Method != "lead" {
		t.Fatalf("expected lead method for first switch, got %q", instr.SwitchIns[0].Method)
	}

	foundPivot := false
	var gholdEvent *SwitchInEvent
	for i := range instr.SwitchIns {
		event := &instr.SwitchIns[i]
		if event.Method == "pivot_switch" && event.Side == "p2" {
			foundPivot = true
		}
		if event.InMon == "Gholdengo" && event.Side == "p1" {
			gholdEvent = event
		}
	}
	if !foundPivot {
		t.Fatalf("expected a pivot switch event")
	}
	if gholdEvent == nil {
		t.Fatalf("expected switch-in event for Gholdengo")
	}
	if !gholdEvent.IntoFakeOut {
		t.Fatalf("expected Gholdengo switch-in to be into Fake Out")
	}

	stats := instr.MonStats[monKey("p1", "Gholdengo")]
	if stats == nil {
		t.Fatalf("expected mon stats for Gholdengo")
	}
	if !stats.TeraUsed || stats.TeraTurn != 2 {
		t.Fatalf("expected tera used on turn 2, got used=%v turn=%d", stats.TeraUsed, stats.TeraTurn)
	}
	if stats.ProtectCount != 1 {
		t.Fatalf("expected protect count 1, got %d", stats.ProtectCount)
	}
	if stats.ProtectUselessCount != 1 {
		t.Fatalf("expected useless protect count 1, got %d", stats.ProtectUselessCount)
	}
	if stats.ProtectConsecutiveAttemptCount != 0 {
		t.Fatalf("expected consecutive protect attempt count 0, got %d", stats.ProtectConsecutiveAttemptCount)
	}
	if stats.ProtectFailedCount != 0 {
		t.Fatalf("expected protect failed count 0, got %d", stats.ProtectFailedCount)
	}
}

func TestReplayInstrumentationFixtureReal(t *testing.T) {
	replay := loadFixture(t, "real_gen9vgc2026_regf.html")
	instr, err := ParseReplayInstrumentation(replay)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(instr.SwitchIns) != 5 {
		t.Fatalf("expected 5 switch-ins, got %d", len(instr.SwitchIns))
	}

	p1 := instr.SideMetrics["p1"]
	if p1 == nil || !p1.EarlyTera || p1.EarlyTeraTurn != 1 {
		t.Fatalf("expected p1 early tera on turn 1")
	}
	p2 := instr.SideMetrics["p2"]
	if p2 == nil || !p2.EarlyTera || p2.EarlyTeraTurn != 1 {
		t.Fatalf("expected p2 early tera on turn 1")
	}

	foundSpread := false
	for _, event := range instr.SwitchIns {
		if event.IntoSpread {
			foundSpread = true
			break
		}
	}
	if !foundSpread {
		t.Fatalf("expected at least one switch-in into spread move")
	}
}

func TestReplayInstrumentationFixtureFakeOut(t *testing.T) {
	replay := loadFixture(t, "fixture_fakeout.html")
	instr, err := ParseReplayInstrumentation(replay)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(instr.SwitchIns) != 5 {
		t.Fatalf("expected 5 switch-ins, got %d", len(instr.SwitchIns))
	}

	stats := instr.MonStats[monKey("p1", "Gholdengo")]
	if stats == nil {
		t.Fatalf("expected mon stats for Gholdengo")
	}
	if stats.SwitchinIntoFakeOutCount != 1 {
		t.Fatalf("expected Fake Out switch-in count 1, got %d", stats.SwitchinIntoFakeOutCount)
	}
	if stats.SwitchinIntoOppTailwindCount != 1 {
		t.Fatalf("expected opp Tailwind switch-in count 1, got %d", stats.SwitchinIntoOppTailwindCount)
	}
	if stats.ProtectCount != 1 {
		t.Fatalf("expected protect count 1, got %d", stats.ProtectCount)
	}
	if stats.ProtectBaitedCount != 1 {
		t.Fatalf("expected baited protect count 1, got %d", stats.ProtectBaitedCount)
	}
	if stats.ProtectUselessCount != 0 {
		t.Fatalf("expected useless protect count 0, got %d", stats.ProtectUselessCount)
	}
	if stats.ProtectConsecutiveAttemptCount != 0 {
		t.Fatalf("expected consecutive protect attempt count 0, got %d", stats.ProtectConsecutiveAttemptCount)
	}
	if stats.ProtectFailedCount != 0 {
		t.Fatalf("expected protect failed count 0, got %d", stats.ProtectFailedCount)
	}

	p1 := instr.SideMetrics["p1"]
	if p1 == nil || !p1.EarlyTera || p1.EarlyTeraTurn != 2 {
		t.Fatalf("expected p1 early tera on turn 2")
	}
}

func TestReplayInstrumentationFixtureDoubleProtect(t *testing.T) {
	replay := loadFixture(t, "fixture_double_protect.html")
	instr, err := ParseReplayInstrumentation(replay)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	stats := instr.MonStats[monKey("p1", "Gholdengo")]
	if stats == nil {
		t.Fatalf("expected mon stats for Gholdengo")
	}
	if stats.ProtectCount != 2 {
		t.Fatalf("expected protect count 2, got %d", stats.ProtectCount)
	}
	if stats.ProtectBaitedCount != 2 {
		t.Fatalf("expected baited protect count 2, got %d", stats.ProtectBaitedCount)
	}
	if stats.ProtectUselessCount != 0 {
		t.Fatalf("expected useless protect count 0, got %d", stats.ProtectUselessCount)
	}
	if stats.ProtectConsecutiveAttemptCount != 1 {
		t.Fatalf("expected consecutive protect attempt count 1, got %d", stats.ProtectConsecutiveAttemptCount)
	}
	if stats.ProtectFailedCount != 1 {
		t.Fatalf("expected protect failed count 1, got %d", stats.ProtectFailedCount)
	}
	if stats.ProtectConsecutiveFailedCount != 1 {
		t.Fatalf("expected consecutive protect failed count 1, got %d", stats.ProtectConsecutiveFailedCount)
	}
}

func TestReplayInstrumentationFixtureKnockOff(t *testing.T) {
	replay := loadFixture(t, "fixture_knockoff.html")
	instr, err := ParseReplayInstrumentation(replay)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(instr.SwitchIns) != 6 {
		t.Fatalf("expected 6 switch-ins, got %d", len(instr.SwitchIns))
	}

	stats := instr.MonStats[monKey("p1", "Heatran")]
	if stats == nil {
		t.Fatalf("expected mon stats for Heatran")
	}
	if stats.SwitchinIntoKnockOffCount != 1 {
		t.Fatalf("expected Knock Off switch-in count 1, got %d", stats.SwitchinIntoKnockOffCount)
	}
	if stats.PivotSwitchInCount != 1 {
		t.Fatalf("expected pivot switch-in count 1, got %d", stats.PivotSwitchInCount)
	}

	foundForced := false
	for _, event := range instr.SwitchIns {
		if event.Method == "forced_drag" {
			foundForced = true
			break
		}
	}
	if !foundForced {
		t.Fatalf("expected a forced drag switch-in")
	}
}

func loadFixture(t *testing.T, name string) string {
	t.Helper()
	path := filepath.Join("testdata", "replays", name)
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("failed to read fixture %s: %v", name, err)
	}
	return string(data)
}
