import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { WinrateStats } from '../../types';

interface WinratesCardProps {
  data: WinrateStats | undefined;
  loading: boolean;
}

export function WinratesCard({ data, loading }: WinratesCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Winrates</CardTitle>
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
  
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Winrates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Search for a player to view winrates</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Winrates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Overall Win Rate</p>
            <p className="text-2xl font-bold text-white">
              {data.overall_win_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">
              {data.games_played} games
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">BO3 Win Rate</p>
            <p className="text-2xl font-bold text-white">
              {data.bo3_win_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">
              {data.bo3_played} BO3 matches
            </p>
          </div>
        </div>
        
        {Object.keys(data.bo3_game_winrates).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              BO3 Game Winrates
            </h4>
            <div className="space-y-2">
              {Object.entries(data.bo3_game_winrates).map(([game, stats]) => (
                <div 
                  key={game}
                  className="flex justify-between items-center bg-gray-700 rounded-lg p-3"
                >
                  <span className="text-white font-medium">{game}</span>
                  <div className="text-right">
                    <span className="text-white font-bold">
                      {stats.win_rate.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({stats.games_played} games)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
