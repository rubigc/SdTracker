import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import type { LeadStat } from '../../types';

interface LeadsCardProps {
  data: LeadStat[] | undefined;
  loading: boolean;
}

export function LeadsCard({ data, loading }: LeadsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Statistics</CardTitle>
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
          <CardTitle>Lead Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Search for a player to view lead statistics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">
                  Pokemon
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
              {data.map((lead, index) => (
                <tr 
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-white font-medium">
                    {lead.pokemon}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={getWinRateColor(lead.win_rate)}>
                      {lead.win_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {lead.games_played}
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

function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return 'text-green-400 font-bold';
  if (winRate >= 50) return 'text-yellow-400 font-medium';
  return 'text-red-400 font-medium';
}
