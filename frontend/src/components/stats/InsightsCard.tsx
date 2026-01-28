import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { useInsights } from '../../hooks/usePlayerStats';
import type { InsightStat } from '../../types';
import { getWinRateColorClass } from '../../utils/pokemonSprites';

interface InsightsCardProps {
  accountId: number;
  teamId?: number;
}

function groupInsights(data: InsightStat[] | undefined) {
  const grouped = new Map<string, InsightStat[]>();
  (data ?? []).forEach((item) => {
    const list = grouped.get(item.label) ?? [];
    list.push(item);
    grouped.set(item.label, list);
  });
  grouped.forEach((list) => {
    list.sort((a, b) => b.occurrences - a.occurrences);
  });
  return grouped;
}

export function InsightsCard({ accountId, teamId }: InsightsCardProps) {
  const [pokemonFilter, setPokemonFilter] = useState('');
  const { data, isLoading } = useInsights(
    accountId,
    teamId,
    pokemonFilter.trim() ? pokemonFilter.trim() : undefined,
  );

  const grouped = useMemo(() => groupInsights(data), [data]);

  if (isLoading) {
    return (
      <Card className="card-modern lg:col-span-2">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
            <div className="skeleton h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="card-modern lg:col-span-2">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={pokemonFilter}
                onChange={(event) => setPokemonFilter(event.target.value)}
                placeholder="Filter by Pokemon (optional)"
                className="w-full sm:max-w-xs bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
              {pokemonFilter && (
                <button
                  onClick={() => setPokemonFilter('')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-gray-400">No insight data yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern lg:col-span-2">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={pokemonFilter}
            onChange={(event) => setPokemonFilter(event.target.value)}
            placeholder="Filter by Pokemon (optional)"
            className="w-full sm:max-w-xs bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          />
          {pokemonFilter && (
            <button
              onClick={() => setPokemonFilter('')}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Clear
            </button>
          )}
        </div>

        {[...grouped.entries()].map(([label, items]) => (
          <div key={label} className="glass-dark rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">{label}</h4>
              <span className="text-xs text-gray-400">{items.length} mons</span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.insight_id}-${item.pokemon ?? 'all'}`}
                  className="flex flex-col gap-1 rounded-lg bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-medium">
                      {item.pokemon ?? 'All Pokemon'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.occurrences} games · {item.wins} wins
                    </span>
                  </div>
                  <span className={`text-lg font-semibold ${getWinRateColorClass(item.win_rate)}`}>
                    {item.win_rate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
