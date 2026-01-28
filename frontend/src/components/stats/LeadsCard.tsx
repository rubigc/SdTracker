import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { LeadComboStat, LeadStat } from '../../types';
import { getPokemonSpriteUrl, getWinRateColor, getWinRateColorClass, formatPokemonName } from '../../utils/pokemonSprites';

interface LeadsCardProps {
  data: LeadStat[] | undefined;
  comboData?: LeadComboStat[] | undefined;
  loading: boolean;
  comboLoading?: boolean;
}

export function LeadsCard({ data, comboData, loading, comboLoading }: LeadsCardProps) {
  const hasSingles = Boolean(data && data.length > 0);
  const hasCombos = Boolean(comboData && comboData.length > 0);
  const topCombos = comboData?.slice(0, 4) ?? [];

  if (loading && !hasSingles) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Lead Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-32 rounded-lg" />
            <div className="skeleton h-32 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!hasSingles && !hasCombos && !loading && !comboLoading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Lead Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No lead statistics available yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle>Lead Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Single Leads</h4>
              <span className="text-xs text-gray-400">Each of the 6 Pokemon</span>
            </div>
            {hasSingles ? (
              <div className="pokemon-grid">
                {data?.map((lead, index) => (
                  <div key={index} className="pokemon-card">
                    <div className="relative mb-3">
                      <img
                        src={getPokemonSpriteUrl(lead.pokemon)}
                        alt={lead.pokemon}
                        className="pokemon-sprite w-20 h-20 mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                        }}
                      />
                      <div
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: getWinRateColor(lead.win_rate) }}
                      >
                        {lead.win_rate.toFixed(0)}
                      </div>
                    </div>
                    
                    <h4 className="text-white font-semibold text-sm mb-2 truncate">
                      {formatPokemonName(lead.pokemon)}
                    </h4>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Win Rate</span>
                          <span className={getWinRateColorClass(lead.win_rate)}>
                            {lead.win_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${lead.win_rate}%`,
                              backgroundColor: getWinRateColor(lead.win_rate),
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Games</span>
                        <span className="text-white font-medium">{lead.games_played}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No single lead data yet</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Lead Combos</h4>
              <span className="text-xs text-gray-400">Top 4 combos</span>
            </div>
            {comboLoading && !hasCombos ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : topCombos.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {topCombos.map((combo, index) => {
                  const comboPokemon = combo.pokemon.slice(0, 2);
                  const comboLabel = comboPokemon.map(formatPokemonName).join(' + ');
                  return (
                    <div
                      key={`${comboPokemon.join('-')}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {comboPokemon.map((pokemon) => (
                            <img
                              key={pokemon}
                              src={getPokemonSpriteUrl(pokemon)}
                              alt={pokemon}
                              className="pokemon-sprite h-10 w-10 rounded-full bg-black/40 ring-1 ring-white/10"
                              onError={(e) => {
                                e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                              }}
                            />
                          ))}
                        </div>
                        <div>
                          <p className="text-sm text-white truncate max-w-[160px]">{comboLabel}</p>
                          <p className="text-xs text-gray-400">{combo.games_played} games</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${getWinRateColorClass(combo.win_rate)}`}>
                        {combo.win_rate.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No lead combo data yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
