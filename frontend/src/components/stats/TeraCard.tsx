import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { TeraStat } from '../../types';

interface TeraCardProps {
  data: TeraStat[] | undefined;
  loading: boolean;
}

export function TeraCard({ data, loading }: TeraCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tera Statistics</CardTitle>
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
          <CardTitle>Tera Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Search for a player to view Tera statistics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tera Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Tera Type
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  Win Rate
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  Games
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((tera, index) => (
                <tr 
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-white font-medium">
                    {getTeraTypeIcon(tera.tera_type)} {tera.tera_type}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={getWinRateColor(tera.win_rate)}>
                      {tera.win_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {tera.games_played}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function getTeraTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'Normal': '⚪',
    'Fire': '🔥',
    'Water': '💧',
    'Electric': '⚡',
    'Grass': '🌿',
    'Ice': '❄️',
    'Fighting': '👊',
    'Poison': '☠️',
    'Ground': '🌍',
    'Flying': '🦅',
    'Psychic': '🔮',
    'Bug': '🐛',
    'Rock': '🪨',
    'Ghost': '👻',
    'Dragon': '🐉',
    'Dark': '🌑',
    'Steel': '⚙️',
    'Fairy': '🧚',
  };
  return icons[type] || '❓';
}

function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return 'text-green-400 font-bold';
  if (winRate >= 50) return 'text-yellow-400 font-medium';
  return 'text-red-400 font-medium';
}
