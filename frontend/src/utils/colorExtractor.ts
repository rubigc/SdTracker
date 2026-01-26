/**
 * Color Extraction Utility
 * Extracts dominant colors from Pokemon sprites to create dynamic themes
 */

export interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  card: string;
  glow: string;
}

/**
 * Extract dominant colors from an image URL
 * @param imageUrl - URL of the image to extract colors from
 * @returns Promise resolving to extracted colors
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Extract colors
        const colors = extractDominantColors(pixels);
        
        // Generate theme colors
        const themeColors = generateThemeFromColors(colors);
        
        resolve(themeColors);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Extract dominant colors from pixel data
 * @param pixels - RGBA pixel data
 * @returns Array of dominant colors
 */
function extractDominantColors(pixels: Uint8ClampedArray): string[] {
  const colorMap = new Map<string, number>();
  const step = 4; // Sample every 4th pixel for performance
  
  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Skip very dark or very light pixels
    const brightness = (r + g + b) / 3;
    if (brightness < 30 || brightness > 240) continue;
    
    // Quantize colors to reduce variations, clamp to valid channel range
    const quantizedR = Math.min(255, Math.max(0, Math.round(r / 32) * 32));
    const quantizedG = Math.min(255, Math.max(0, Math.round(g / 32) * 32));
    const quantizedB = Math.min(255, Math.max(0, Math.round(b / 32) * 32));
    
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  }
  
  // Sort by frequency and get top colors
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return rgbToHex(r, g, b);
    });
  
  return sortedColors;
}

/**
 * Generate theme colors from extracted colors
 * @param colors - Array of dominant colors
 * @returns Theme color object
 */
function generateThemeFromColors(colors: string[]): ExtractedColors {
  if (colors.length === 0) {
    // Fallback to default theme
    return {
      primary: '#6A0DAD',
      secondary: '#4B0082',
      accent: '#FFD700',
      background: '#1a1a2e',
      text: '#ffffff',
      card: '#0f3460',
      glow: 'rgba(106, 13, 173, 0.3)',
    };
  }
  
  const primary = colors[0];
  const secondary = colors.length > 1 ? colors[1] : adjustColor(primary, -30);
  const accent = colors.length > 2 ? colors[2] : adjustColor(primary, 30);
  
  // Generate complementary colors
  const background = darkenColor(primary, 70);
  const card = darkenColor(primary, 50);
  const glow = hexToRgba(primary, 0.3);
  
  return {
    primary,
    secondary,
    accent,
    background,
    text: '#ffffff',
    card,
    glow,
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

/**
 * Convert hex to RGBA
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Adjust color brightness
 * @param hex - Hex color code
 * @param amount - Amount to adjust (-100 to 100)
 * @returns Adjusted hex color code
 */
function adjustColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16) + amount;
  const g = parseInt(hex.slice(3, 5), 16) + amount;
  const b = parseInt(hex.slice(5, 7), 16) + amount;
  return rgbToHex(r, g, b);
}

/**
 * Darken a color
 * @param hex - Hex color code
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color code
 */
function darkenColor(hex: string, percent: number): string {
  const factor = 1 - percent / 100;
  const r = parseInt(hex.slice(1, 3), 16) * factor;
  const g = parseInt(hex.slice(3, 5), 16) * factor;
  const b = parseInt(hex.slice(5, 7), 16) * factor;
  return rgbToHex(r, g, b);
}

function toHexChannel(value: number): string {
  if (!Number.isFinite(value)) {
    return '00';
  }
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, '0');
}

/**
 * Cache for extracted colors to avoid re-processing
 */
const colorCache = new Map<string, ExtractedColors>();

/**
 * Get colors for a Pokemon with caching
 * @param pokemonName - Name of the Pokemon
 * @param spriteUrl - URL of the Pokemon sprite
 * @returns Promise resolving to extracted colors
 */
export async function getPokemonColors(pokemonName: string, spriteUrl: string): Promise<ExtractedColors> {
  const cacheKey = pokemonName.toLowerCase();
  
  // Return cached colors if available
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }
  
  try {
    const colors = await extractColorsFromImage(spriteUrl);
    colorCache.set(cacheKey, colors);
    return colors;
  } catch (error) {
    console.error(`Failed to extract colors for ${pokemonName}:`, error);
    // Return fallback colors
    return {
      primary: '#6A0DAD',
      secondary: '#4B0082',
      accent: '#FFD700',
      background: '#1a1a2e',
      text: '#ffffff',
      card: '#0f3460',
      glow: 'rgba(106, 13, 173, 0.3)',
    };
  }
}

/**
 * Clear the color cache
 */
export function clearColorCache(): void {
  colorCache.clear();
}
