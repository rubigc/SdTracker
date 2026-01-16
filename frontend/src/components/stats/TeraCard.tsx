import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { TeraStat } from '../../types';
import { getPokemonTypeColor, getWinRateColor, getWinRateColorClass } from '../../utils/pokemonSprites';

interface TeraCardProps {
  data: TeraStat[] | undefined;
  loading: boolean;
}

export function TeraCard({ data, loading }: TeraCardProps) {
  if (loading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Tera Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Tera Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Search for a player to view Tera statistics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle>Tera Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((tera, index) => (
            <div
              key={index}
              className="glass-dark rounded-lg p-4 hover:bg-white/5 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="type-badge px-3 py-1.5 text-white font-semibold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${getPokemonTypeColor(tera.tera_type)} 0%, ${adjustColorBrightness(getPokemonTypeColor(tera.tera_type), -20)} 100%)`,
                    }}
                  >
                    {tera.tera_type}
                  </div>
                </div>
                <span className={`text-xl font-bold ${getWinRateColorClass(tera.win_rate)}`}>
                  {tera.win_rate.toFixed(1)}%
                </span>
              </div>
              
              <div className="progress-bar h-2 mb-2">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${tera.win_rate}%`,
                    backgroundColor: getWinRateColor(tera.win_rate),
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Games Used</span>
                <span className="text-white font-medium">{tera.games_played}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
