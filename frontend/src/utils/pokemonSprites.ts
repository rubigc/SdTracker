import pokemonHomeSpriteIds from './pokemonHomeSpriteIds.json';

/**
 * Pokemon Sprite Utilities
 * Provides functions to get Pokemon sprite URLs and type colors
 */

// Pokemon name to Pokemon Home sprite ID mapping
export const POKEMON_NAME_TO_ID: Record<string, number> = (() => {
  const POKEMON_HOME_SPRITE_IDS = pokemonHomeSpriteIds as Record<string, number>;
  const POKEMON_NAME_ALIASES: Record<string, string> = {
    'farfetch\'d': 'farfetchd',
    'sirfetch\'d': 'sirfetchd',
    'mr. mime': 'mr-mime',
    'mr mime': 'mr-mime',
    'mr. rime': 'mr-rime',
    'mr rime': 'mr-rime',
    'mime jr.': 'mime-jr',
    'mime jr': 'mime-jr',
    'nidoran♀': 'nidoran-f',
    'nidoran♂': 'nidoran-m',
    'flabébé': 'flabebe',
    'type: null': 'type-null',
  };
  const aliasEntries = Object.entries(POKEMON_NAME_ALIASES)
    .map(([alias, canonical]) => {
      const id = POKEMON_HOME_SPRITE_IDS[canonical];
      return id ? [alias, id] : null;
    })
    .filter((entry): entry is [string, number] => entry !== null);

  return {
    ...POKEMON_HOME_SPRITE_IDS,
    ...Object.fromEntries(aliasEntries),
  } as Record<string, number>;
})();

// Type color mapping
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
  stellar: '#4C6CB3',
  unknown: '#68A090',
};

/**
 * Normalize Pokemon name for lookup
 * Handles various formats like "Ursaluna-Bloodmoon", "Flutter Mane", "Urshifu-Rapid-Strike"
 */
function normalizePokemonName(name: string): string {
  let normalized = name
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens for form names
    .replace(/\s+/g, '-')
    // Handle common naming patterns
    .replace(/^([a-z]+) ?[-–] ?([a-z]+)$/i, '$1-$2')
    // Remove extra hyphens
    .replace(/-+/g, '-');
  
  // Try the exact name first
  if (POKEMON_NAME_TO_ID[normalized]) {
    return normalized;
  }
  
  // Try with spaces instead of hyphens
  const withSpaces = normalized.replace(/-/g, ' ');
  if (POKEMON_NAME_TO_ID[withSpaces]) {
    return withSpaces;
  }
  
  // Try without hyphens (base form)
  const baseName = normalized.split('-')[0];
  if (POKEMON_NAME_TO_ID[baseName]) {
    return baseName;
  }
  
  return normalized;
}

/**
 * Get Pokemon sprite URL from Pokemon name
 * @param pokemonName - The name of the Pokemon (case-insensitive)
 * @param shiny - Whether to get the shiny sprite (default: false)
 * @returns The URL to the Pokemon sprite image
 */
export function getPokemonSpriteUrl(pokemonName: string, shiny: boolean = false): string {
  const normalizedName = normalizePokemonName(pokemonName);
  const pokemonId = POKEMON_NAME_TO_ID[normalizedName];
  
  if (!pokemonId) {
    // Return a placeholder if Pokemon not found
    console.warn(`Pokemon sprite not found for: ${pokemonName} (normalized: ${normalizedName})`);
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
  }
  
  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';
  return shiny
    ? `${baseUrl}/shiny/${pokemonId}.png`
    : `${baseUrl}/${pokemonId}.png`;
}

/**
 * Get Pokemon official artwork URL (higher quality)
 * @param pokemonName - The name of the Pokemon (case-insensitive)
 * @returns The URL to the Pokemon official artwork
 */
export function getPokemonArtworkUrl(pokemonName: string): string {
  const normalizedName = normalizePokemonName(pokemonName);
  const pokemonId = POKEMON_NAME_TO_ID[normalizedName];
  
  if (!pokemonId) {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png';
  }
  
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

/**
 * Get Pokemon ID from name
 * @param pokemonName - The name of the Pokemon (case-insensitive)
 * @returns The Pokemon ID or 0 if not found
 */
export function getPokemonIdFromName(pokemonName: string): number {
  const normalizedName = normalizePokemonName(pokemonName);
  return POKEMON_NAME_TO_ID[normalizedName] || 0;
}

/**
 * Get type color for a Pokemon type
 * @param type - The Pokemon type (case-insensitive)
 * @returns The hex color code for the type
 */
export function getPokemonTypeColor(type: string): string {
  const normalizedType = type.toLowerCase().trim();
  return TYPE_COLORS[normalizedType] || '#888888';
}

/**
 * Get type background style with gradient
 * @param type - The Pokemon type (case-insensitive)
 * @returns CSS style object with gradient background
 */
export function getTypeGradientStyle(type: string): React.CSSProperties {
  const color = getPokemonTypeColor(type);
  return {
    background: `linear-gradient(135deg, ${color} 0%, ${adjustColorBrightness(color, -20)} 100%)`,
  };
}

/**
 * Adjust color brightness
 * @param color - Hex color code
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color code
 */
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get win rate color class
 * @param winRate - The win rate percentage (0-100)
 * @returns Tailwind color class for the win rate
 */
export function getWinRateColorClass(winRate: number): string {
  if (winRate >= 60) return 'text-green-400';
  if (winRate >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Get win rate background color
 * @param winRate - The win rate percentage (0-100)
 * @returns Hex color code for the win rate
 */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return '#4ade80';
  if (winRate >= 50) return '#facc15';
  return '#f87171';
}

/**
 * Format Pokemon name for display (capitalize first letter)
 * @param pokemonName - The Pokemon name
 * @returns Formatted Pokemon name
 */
export function formatPokemonName(pokemonName: string): string {
  return pokemonName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a Pokemon name exists in the database
 * @param pokemonName - The Pokemon name to check
 * @returns True if the Pokemon exists
 */
export function pokemonExists(pokemonName: string): boolean {
  const normalizedName = normalizePokemonName(pokemonName);
  return POKEMON_NAME_TO_ID[normalizedName] !== undefined;
}

/**
 * Get all Pokemon names that match a search term
 * @param searchTerm - The search term
 * @returns Array of matching Pokemon names
 */
export function searchPokemon(searchTerm: string): string[] {
  const term = searchTerm.toLowerCase().trim();
  return Object.keys(POKEMON_NAME_TO_ID)
    .filter(name => name.includes(term))
    .map(name => formatPokemonName(name))
    .sort();
}
