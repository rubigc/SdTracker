import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getPokemonTheme, PokemonTheme } from '../utils/pokemonThemes';
import { ExtractedColors } from '../utils/colorExtractor';
import { getSettings, saveSettings } from '../services/settings';

interface ThemeContextType {
  theme: PokemonTheme;
  setTheme: (pokemonId: string, colors?: ExtractedColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PokemonTheme>(getPokemonTheme('lunala'));

  useEffect(() => {
    // Load theme from settings on mount
    const settings = getSettings();
    const pokemonTheme = getPokemonTheme(settings.favoritePokemon);
    setThemeState(pokemonTheme);
    applyTheme(pokemonTheme);
  }, []);

  const setTheme = (pokemonId: string, colors?: ExtractedColors) => {
    let newTheme: PokemonTheme;
    
    if (colors) {
      // Use extracted colors from sprite
      newTheme = {
        id: pokemonId,
        name: pokemonId.charAt(0).toUpperCase() + pokemonId.slice(1),
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        text: colors.text,
        card: colors.card,
        glow: colors.glow,
      };
    } else {
      // Use predefined theme
      newTheme = getPokemonTheme(pokemonId);
    }
    
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Save to settings
    const settings = getSettings();
    settings.favoritePokemon = pokemonId;
    saveSettings(settings);
  };

  const applyTheme = (pokemonTheme: PokemonTheme) => {
    const root = document.documentElement;
    
    // Set CSS custom properties for the theme
    root.style.setProperty('--theme-primary', pokemonTheme.primary);
    root.style.setProperty('--theme-secondary', pokemonTheme.secondary);
    root.style.setProperty('--theme-accent', pokemonTheme.accent);
    root.style.setProperty('--theme-background', pokemonTheme.background);
    root.style.setProperty('--theme-text', pokemonTheme.text);
    root.style.setProperty('--theme-card', pokemonTheme.card);
    root.style.setProperty('--theme-glow', pokemonTheme.glow);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}