import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import type { MoveStats } from '../../types';
import { Card } from '../common/Card';
import { Zap, TrendingUp } from 'lucide-react';

interface MoveStatsCardProps {
  accountId: number;
  teamId?: number;
  pokemonName?: string;
}

export function MoveStatsCard({ accountId, teamId, pokemonName }: MoveStatsCardProps) {
  const { data: moveStats, isLoading, error } = useQuery({
    queryKey: ['moveStats', accountId, teamId, pokemonName],
    queryFn: () => pokemonName 
      ? api.getMoveStatsByPokemon(accountId, pokemonName)
      : api.getMoveStats(accountId, teamId),
  });

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Move Usage Statistics
        </h2>
        <div className="text-gray-400">Loading move statistics...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Move Usage Statistics
        </h2>
        <div className="text-red-400">Error loading move statistics</div>
      </Card>
    );
  }

  // Group moves by Pokemon
  const movesByPokemon = moveStats?.reduce((acc, stat) => {
    if (!acc[stat.pokemon_name]) {
      acc[stat.pokemon_name] = [];
    }
    acc[stat.pokemon_name].push(stat);
    return acc;
  }, {} as Record<string, MoveStats[]>) || {};

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Move Usage Statistics
        {pokemonName && <span className="ml-2 text-sm text-gray-400">({pokemonName})</span>}
      </h2>

      {!moveStats || moveStats.length === 0 ? (
        <div className="text-gray-400">No move usage data available</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(movesByPokemon).map(([pokemonName, moves]) => (
            <div key={pokemonName}>
              <h3 className="text-lg font-medium mb-3 text-blue-400">{pokemonName}</h3>
              <div className="space-y-2">
                {moves
                  .sort((a, b) => b.total_usage - a.total_usage)
                  .map((move) => (
                    <div
                      key={move.move_name}
                      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{move.move_name}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-400">
                            {move.total_usage} uses
                          </span>
                          <span className="text-gray-400">
                            {move.games_played} games
                          </span>
                          <span
                            className={`flex items-center ${
                              move.win_rate >= 50 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {move.win_rate.toFixed(1)}% WR
                          </span>
                        </div>
                      </div>
                      
                      {/* Usage bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((move.total_usage / Math.max(...moves.map(m => m.total_usage))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
