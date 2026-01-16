import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { TeraStat } from '../../types';
import { getPokemonSpriteUrl, getWinRateColor, getWinRateColorClass, formatPokemonName } from '../../utils/pokemonSprites';

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
        <div className="pokemon-grid">
          {data.map((tera, index) => (
            <div key={index} className="pokemon-card">
              <div className="relative mb-3">
                <img
                  src={getPokemonSpriteUrl(tera.pokemon)}
                  alt={tera.pokemon}
                  className="pokemon-sprite w-20 h-20 mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                  }}
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{ backgroundColor: getWinRateColor(tera.win_rate) }}>
                  {tera.win_rate.toFixed(0)}
                </div>
              </div>
              
              <h4 className="text-white font-semibold text-sm mb-2 truncate">
                {formatPokemonName(tera.pokemon)}
              </h4>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Win Rate</span>
                    <span className={getWinRateColorClass(tera.win_rate)}>
                      {tera.win_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${tera.win_rate}%`,
                        backgroundColor: getWinRateColor(tera.win_rate),
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Games</span>
                  <span className="text-white font-medium">{tera.games_played}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
