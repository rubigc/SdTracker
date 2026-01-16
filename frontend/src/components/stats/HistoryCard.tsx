import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { HistoryGame } from '../../types';
import { getPokemonSpriteUrl, formatPokemonName } from '../../utils/pokemonSprites';
import { Trophy, X } from 'lucide-react';

interface HistoryCardProps {
  data: HistoryGame[] | undefined;
  loading: boolean;
}

export function HistoryCard({ data, loading }: HistoryCardProps) {
  if (loading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-lg" />
            <div className="skeleton h-48 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Search for a player to view game history</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle>Game History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {data.map((game) => {
            const isPlayerWinner = game.winner === game.player.name;
            
            return (
              <div
                key={`${game.game_id}-${game.game_number}`}
                className={`match-card p-5 ${isPlayerWinner ? 'winner' : 'loser'}`}
              >
                {/* Match Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg">
                      Game #{game.game_id} - Match {game.game_number}
                    </h4>
                    <div className={`flex items-center gap-2 mt-1 ${isPlayerWinner ? 'text-green-400' : 'text-red-400'}`}>
                      {isPlayerWinner ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span className="font-semibold">
                        {isPlayerWinner ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Winner</p>
                    <p className="text-white font-medium">{game.winner}</p>
                  </div>
                </div>
                
                {/* Teams Display */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Player Team */}
                  <div className="glass-dark rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${isPlayerWinner ? 'bg-green-400' : 'bg-red-400'}`} />
                      <p className="text-sm font-semibold text-white">{game.player.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[game.player.lead, game.player.tera].filter(Boolean).map((pokemon, idx) => (
                        <div key={idx} className="text-center">
                          <img
                            src={getPokemonSpriteUrl(pokemon)}
                            alt={pokemon}
                            className="pokemon-sprite w-12 h-12 mx-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {formatPokemonName(pokemon)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Lead</span>
                      <span className="text-white">{formatPokemonName(game.player.lead)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Tera</span>
                      <span className="text-white">{game.player.tera}</span>
                    </div>
                  </div>
                  
                  {/* Opponent Team */}
                  <div className="glass-dark rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${!isPlayerWinner ? 'bg-green-400' : 'bg-red-400'}`} />
                      <p className="text-sm font-semibold text-white">{game.opponent.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[game.opponent.lead, game.opponent.tera].filter(Boolean).map((pokemon, idx) => (
                        <div key={idx} className="text-center">
                          <img
                            src={getPokemonSpriteUrl(pokemon)}
                            alt={pokemon}
                            className="pokemon-sprite w-12 h-12 mx-auto"
                            onError={(e) => {
                              e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {formatPokemonName(pokemon)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Lead</span>
                      <span className="text-white">{formatPokemonName(game.opponent.lead)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-400">Tera</span>
                      <span className="text-white">{game.opponent.tera}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
