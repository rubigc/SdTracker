export interface ParsedTeamMember {
  pokemon: string;
  item?: string;
}

function extractPokemonName(rawName: string): string {
  let name = rawName.trim();
  // Strip trailing gender markers like "(M)" or "(F)".
  name = name.replace(/\s*\((?:M|F|N)\)\s*$/i, '').trim();

  const lastOpen = name.lastIndexOf('(');
  const lastClose = name.lastIndexOf(')');
  if (lastOpen !== -1 && lastClose > lastOpen) {
    const within = name.slice(lastOpen + 1, lastClose).trim();
    if (within) {
      return within;
    }
  }

  return name;
}

function extractItemFromLines(lines: string[]): string | undefined {
  for (const line of lines) {
    const match = /^item:\s*(.+)$/i.exec(line);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export function parseTeamData(teamData: string): ParsedTeamMember[] {
  if (!teamData) {
    return [];
  }

  const blocks = teamData
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const members: ParsedTeamMember[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      continue;
    }

    const firstLine = lines[0];
    const atIndex = firstLine.indexOf('@');

    let namePart = firstLine;
    let itemPart: string | undefined;

    if (atIndex !== -1) {
      namePart = firstLine.slice(0, atIndex).trim();
      itemPart = firstLine.slice(atIndex + 1).trim();
    } else {
      itemPart = extractItemFromLines(lines);
    }

    const pokemon = extractPokemonName(namePart);
    if (!pokemon) {
      continue;
    }

    members.push({ pokemon, item: itemPart });
  }

  return members;
}

function normalizeItemNameForSprite(itemName: string): string {
  return itemName
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\./g, '')
    .replace(/é/g, 'e')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getItemSpriteUrl(itemName?: string): string | null {
  if (!itemName) {
    return null;
  }

  const cleaned = itemName.trim();
  if (!cleaned || cleaned === '-' || cleaned.toLowerCase() === 'none') {
    return null;
  }

  const normalized = normalizeItemNameForSprite(cleaned);
  if (!normalized) {
    return null;
  }

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;
}
