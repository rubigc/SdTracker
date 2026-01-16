import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { WinrateStats } from '../../types';
import { getWinRateColor, getWinRateColorClass } from '../../utils/pokemonSprites';

interface WinratesCardProps {
  data: WinrateStats | undefined;
  loading: boolean;
}

export function WinratesCard({ data, loading }: WinratesCardProps) {
  if (loading) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Winrates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-24 rounded-lg" />
            <div className="skeleton h-24 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className="card-modern">
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
    <Card className="card-modern">
      <CardHeader>
        <CardTitle>Winrates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Overall Win Rate */}
          <div className="glass-dark rounded-xl p-5 text-center hover:scale-105 transition-transform">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getWinRateColor(data.overall_win_rate)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.overall_win_rate / 100) * 283} 283`}
                  className="progress-ring"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getWinRateColorClass(data.overall_win_rate)}`}>
                  {data.overall_win_rate.toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">Overall Win Rate</p>
            <p className="text-xs text-gray-500 mt-1">{data.games_played} games</p>
          </div>
          
          {/* BO3 Win Rate */}
          <div className="glass-dark rounded-xl p-5 text-center hover:scale-105 transition-transform">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={getWinRateColor(data.bo3_win_rate)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.bo3_win_rate / 100) * 283} 283`}
                  className="progress-ring"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getWinRateColorClass(data.bo3_win_rate)}`}>
                  {data.bo3_win_rate.toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">BO3 Win Rate</p>
            <p className="text-xs text-gray-500 mt-1">{data.bo3_played} matches</p>
          </div>
        </div>
        
        {Object.keys(data.bo3_game_winrates).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-pokemon-red rounded-full"></span>
              BO3 Game Winrates
            </h4>
            <div className="space-y-3">
              {Object.entries(data.bo3_game_winrates).map(([game, stats]) => (
                <div 
                  key={game}
                  className="glass-dark rounded-lg p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{game}</span>
                    <span className={`text-lg font-bold ${getWinRateColorClass(stats.win_rate)}`}>
                      {stats.win_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${stats.win_rate}%`,
                        backgroundColor: getWinRateColor(stats.win_rate),
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    {stats.games_played} games
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
