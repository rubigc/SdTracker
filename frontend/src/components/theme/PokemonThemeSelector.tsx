import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getPokemonSpriteUrl, POKEMON_NAME_TO_ID } from '../../utils/pokemonSprites';
import { getPokemonColors, ExtractedColors } from '../../utils/colorExtractor';
import { Check, Shuffle, Search } from 'lucide-react';

interface PokemonInfo {
  name: string;
  id: number;
}

export function PokemonThemeSelector() {
  const { setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<string>('');
  const [extractedColors, setExtractedColors] = useState<Map<string, ExtractedColors>>(new Map());
  const [isExtracting, setIsExtracting] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);

  // Get all Pokemon names
  const allPokemon: PokemonInfo[] = useMemo(() => {
    return Object.entries(POKEMON_NAME_TO_ID).map(([name, id]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      id,
    })).sort((a, b) => a.id - b.id);
  }, []);

  // Filter Pokemon based on search
  const filteredPokemon = useMemo(() => {
    if (!searchQuery) {
      return allPokemon.slice(0, displayCount);
    }
    
    const query = searchQuery.toLowerCase();
    return allPokemon.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query) ||
      pokemon.id.toString().includes(query)
    );
  }, [allPokemon, searchQuery, displayCount]);

  // Load more Pokemon
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 50, allPokemon.length));
  };

  // Select random Pokemon
  const selectRandomPokemon = () => {
    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];
    handlePokemonSelect(randomPokemon.name.toLowerCase());
  };

  // Handle Pokemon selection
  const handlePokemonSelect = async (pokemonName: string) => {
    setSelectedPokemon(pokemonName);
    setIsExtracting(true);
    
    try {
      const spriteUrl = getPokemonSpriteUrl(pokemonName);
      const colors = await getPokemonColors(pokemonName, spriteUrl);
      
      // Update theme with extracted colors
      setTheme(pokemonName, colors);
      
      // Cache the colors
      setExtractedColors(prev => new Map(prev).set(pokemonName, colors));
    } catch (error) {
      console.error('Failed to extract colors:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Pokemon Theme</h2>
        <p className="text-gray-400">
          Select your favorite Pokemon to personalize your color theme. Colors are extracted directly from the Pokemon sprite!
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Search and Random Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Pokemon by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            />
          </div>
          <button
            onClick={selectRandomPokemon}
            disabled={isExtracting}
            className="px-4 py-2 bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-5 h-5" />
            <span className="hidden sm:inline">Random</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {filteredPokemon.length} of {allPokemon.length} Pokemon
          </span>
          {!searchQuery && filteredPokemon.length < allPokemon.length && (
            <button
              onClick={loadMore}
              className="text-[var(--theme-primary)] hover:text-[var(--theme-accent)] transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {/* Pokemon Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
        {filteredPokemon.map((pokemon) => {
          const isSelected = selectedPokemon === pokemon.name.toLowerCase();
          const colors = extractedColors.get(pokemon.name.toLowerCase());
          
          return (
            <button
              key={pokemon.name}
              onClick={() => handlePokemonSelect(pokemon.name.toLowerCase())}
              disabled={isExtracting}
              className={`
                relative p-2 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-[var(--theme-primary)] bg-[var(--theme-card)]' 
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              style={isSelected && colors ? { boxShadow: `0 0 15px ${colors.glow}` } : {}}
              title={`${pokemon.name} (#${pokemon.id})`}
            >
              {/* Pokemon Sprite */}
              <div className="relative w-12 h-12 mx-auto">
                <img
                  src={getPokemonSpriteUrl(pokemon.name.toLowerCase())}
                  alt={pokemon.name}
                  className="w-full h-full object-contain pokemon-sprite"
                  loading="lazy"
                />
                
                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--theme-primary)] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Pokemon ID */}
              <p className="text-xs text-gray-400 text-center mt-1">
                #{pokemon.id}
              </p>
            </button>
          );
        })}
      </div>

      {/* Loading Indicator */}
      {isExtracting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white">Extracting colors from sprite...</p>
          </div>
        </div>
      )}

      {/* Current Theme Preview */}
      {selectedPokemon && extractedColors.has(selectedPokemon) && (
        <div className="mt-8 p-6 rounded-xl bg-[var(--theme-card)] border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Current Theme: {selectedPokemon.charAt(0).toUpperCase() + selectedPokemon.slice(1)}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Primary</p>
              <div 
                className="w-full h-12 rounded-lg border border-gray-600"
                style={{ backgroundColor: extractedColors.get(selectedPokemon)?.primary }}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Secondary</p>
              <div 
                className="w-full h-12 rounded-lg border border-gray-600"
                style={{ backgroundColor: extractedColors.get(selectedPokemon)?.secondary }}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Accent</p>
              <div 
                className="w-full h-12 rounded-lg border border-gray-600"
                style={{ backgroundColor: extractedColors.get(selectedPokemon)?.accent }}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Card Background</p>
              <div 
                className="w-full h-12 rounded-lg border border-gray-600"
                style={{ backgroundColor: extractedColors.get(selectedPokemon)?.card }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}