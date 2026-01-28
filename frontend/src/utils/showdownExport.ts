export type ShowdownVariant = 'OTS' | 'CTS';

function looksPackedTeamData(teamData: string): boolean {
  const trimmed = teamData.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.includes('\n') || trimmed.includes('\r')) {
    return false;
  }
  return trimmed.includes('|') && trimmed.includes(']');
}

function extractPackedTeraType(value: string): string {
  const tokens = value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length === 0) {
    return '';
  }
  return tokens[tokens.length - 1];
}

function unpackPackedTeamData(teamData: string): string {
  const blocks: string[] = [];

  for (const chunk of teamData.split(']')) {
    const trimmed = chunk.trim();
    if (!trimmed) {
      continue;
    }

    const parts = trimmed.split('|');
    if (parts.length < 5) {
      continue;
    }

    const name = (parts[0] || parts[1] || '').trim();
    if (!name) {
      continue;
    }

    const item = (parts[2] || '').trim();
    const ability = (parts[3] || '').trim();
    const moves = (parts[4] || '')
      .split(',')
      .map((move) => move.trim())
      .filter(Boolean);
    const teraType = parts[11] ? extractPackedTeraType(parts[11]) : '';

    const lines: string[] = [];
    lines.push(item ? `${name} @ ${item}` : name);
    if (ability) {
      lines.push(`Ability: ${ability}`);
    }
    if (teraType) {
      lines.push(`Tera Type: ${teraType}`);
    }
    for (const move of moves) {
      lines.push(`- ${move}`);
    }

    if (lines.length > 0) {
      blocks.push(lines.join('\n'));
    }
  }

  return blocks.join('\n\n');
}

export function normalizeOtsExport(teamData: string): string {
  const normalized = (teamData ?? '').trim();
  if (!normalized) {
    return '';
  }
  if (looksPackedTeamData(normalized)) {
    return unpackPackedTeamData(normalized);
  }
  return normalized;
}

function shouldRemoveLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (/^evs:/i.test(trimmed)) {
    return true;
  }
  if (/^ivs:/i.test(trimmed)) {
    return true;
  }
  if (/nature$/i.test(trimmed)) {
    return true;
  }
  return false;
}

export function buildShowdownExport(teamData: string, variant: ShowdownVariant): string {
  const normalized = (teamData ?? '').replace(/\r\n/g, '\n');
  if (!normalized.trim()) {
    return '';
  }
  if (variant === 'CTS') {
    return normalized.trim();
  }

  const filtered = normalized
    .split('\n')
    .filter((line) => !shouldRemoveLine(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return filtered;
}
