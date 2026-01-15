import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { HistoryGame } from '../../types';

interface HistoryCardProps {
  data: HistoryGame[] | undefined;
  loading: boolean;
}

export function HistoryCard({ data, loading }: HistoryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded" />
            <div className="h-4 bg-gray-700 rounded" />
            <div className="h-4 bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Game History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {data.map((game) => (
            <div 
              key={`${game.game_id}-${game.game_number}`}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">
                    Game #{game.game_id} - Match {game.game_number}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Winner: <span className="text-green-400 font-medium">{game.winner}</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Player</p>
                  <p className="text-white font-medium">{game.player.name}</p>
                  <p className="text-gray-400 text-xs">
                    Lead: {game.player.lead} | Tera: {game.player.tera}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Opponent</p>
                  <p className="text-white font-medium">{game.opponent.name}</p>
                  <p className="text-gray-400 text-xs">
                    Lead: {game.opponent.lead} | Tera: {game.opponent.tera}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
