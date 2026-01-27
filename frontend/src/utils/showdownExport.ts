export type ShowdownVariant = 'OTS' | 'CTS';

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
