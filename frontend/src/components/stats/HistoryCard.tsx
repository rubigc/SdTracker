import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import type { HistoryGame } from '../../types';
import { getPokemonSpriteUrl, formatPokemonName } from '../../utils/pokemonSprites';
import { buildShowdownExport } from '../../utils/showdownExport';
import { createPokepast } from '../../services/api';
import { openExternal } from '../../utils/openExternal';
import { useToast } from '../../hooks/useToast';
import { Trophy, X } from 'lucide-react';

interface HistoryCardProps {
  data: HistoryGame[] | undefined;
  loading: boolean;
}

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const splitList = (value?: string | null) =>
  value?.split(';').map((entry) => entry.trim()).filter(Boolean) ?? [];

const dedupeByKey = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const parseOtsTeam = (ots?: string | null) => {
  if (!ots) {
    return [];
  }

  const names = ots
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('@'))
    .map((line) => line.split('@')[0].trim())
    .filter(Boolean);

  return dedupeByKey(names);
};

const TeraIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    role="img"
    aria-label="Terastalized"
  >
    <polygon points="12 2 21 9 12 22 3 9" fill="currentColor" />
    <polygon points="12 2 18.5 9 12 16 5.5 9" fill="currentColor" opacity="0.45" />
  </svg>
);

const TeamPanel = ({
  player,
  statusDotClass,
  onCreateOts,
  isCreating,
  isDisabled,
}: {
  player: HistoryGame['player'];
  statusDotClass: string;
  onCreateOts: () => void;
  isCreating: boolean;
  isDisabled: boolean;
}) => {
  const leadList = splitList(player.lead).slice(0, 2);
  const playedList = splitList(player.team);
  const otsList = parseOtsTeam(player.ots);
  const teamList = (otsList.length > 0 ? otsList.slice(0, 6) : playedList.length > 0 ? playedList : leadList) as string[];

  const playedSet = new Set(playedList.map(normalizeKey));
  const teraName = player.tera && player.tera !== '-' ? player.tera : '';
  const teraKey = teraName ? normalizeKey(teraName) : '';

  return (
    <div className="glass-dark rounded-lg p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <p className="text-sm font-semibold text-white">{player.name}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={isCreating || isDisabled}
          onClick={onCreateOts}
        >
          {isCreating ? 'Creating...' : 'Get OTS'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[auto,1fr,auto]">
        <div className="rounded-lg border border-sky-400/40 bg-sky-500/10 p-2">
          <p className="text-[9px] uppercase tracking-wide text-sky-200/80 mb-2">Lead</p>
          {leadList.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {leadList.map((pokemon, idx) => (
                <div
                  key={`${pokemon}-${idx}`}
                  className="rounded-md border border-sky-300/30 bg-sky-500/10 px-2 py-1 text-center"
                >
                  <img
                    src={getPokemonSpriteUrl(pokemon)}
                    alt={pokemon}
                    className="pokemon-sprite w-12 h-12 mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                    }}
                  />
                  <p className="text-[10px] text-sky-100 mt-1 truncate">
                    {formatPokemonName(pokemon)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-sky-100/70">No lead data</p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase text-gray-400">Team</span>
            <span className="text-[9px] text-gray-500">Shown highlighted</span>
          </div>
          {teamList.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {teamList.map((pokemon, idx) => {
                const pokemonKey = normalizeKey(pokemon);
                const isPlayed = playedSet.has(pokemonKey);
                const isTera = teraKey !== '' && teraKey === pokemonKey;

                return (
                  <div
                    key={`${pokemon}-${idx}`}
                    className={`rounded-md px-1 py-1 text-center ring-1 ${
                      isPlayed
                        ? 'bg-emerald-500/15 ring-emerald-400/60'
                        : 'bg-slate-900/40 ring-white/10'
                    }`}
                  >
                    <img
                      src={getPokemonSpriteUrl(pokemon)}
                      alt={pokemon}
                      className={`pokemon-sprite w-10 h-10 mx-auto ${
                        isPlayed ? 'opacity-100' : 'opacity-60'
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                      }}
                    />
                    <div className="mt-1 h-3 flex items-center justify-center">
                      {isTera ? <TeraIcon className="w-3 h-3 text-cyan-300" /> : null}
                    </div>
                    <p className={`text-[10px] mt-1 truncate ${isPlayed ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {formatPokemonName(pokemon)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500">No team data</p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-[9px] uppercase text-gray-400 mb-2">Highlights</p>
          <div className="flex items-center gap-2 text-[10px] text-gray-300">
            <span className="inline-block h-2 w-2 rounded bg-emerald-400/80" />
            <span>In battle</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-2">
            <TeraIcon className="w-3 h-3 text-cyan-300" />
            <span>Terastalized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function HistoryCard({ data, loading }: HistoryCardProps) {
  const [creatingMap, setCreatingMap] = useState<Record<string, boolean>>({});
  const toast = useToast();

  const handleCreatePokepast = async (game: HistoryGame, side: 'player' | 'opponent') => {
    const key = `${game.game_id}-${game.game_number}-${side}`;
    if (creatingMap[key]) {
      return;
    }

    const ots = side === 'player' ? game.player.ots : game.opponent.ots;
    const teamText = buildShowdownExport(ots ?? '', 'OTS');
    if (!teamText.trim()) {
      toast.show('Could not create Pokepast. Please try again.');
      return;
    }

    setCreatingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const playerName = side === 'player' ? game.player.name : game.opponent.name;
      const title = `${playerName} - Game ${game.game_id} Match ${game.game_number}`;
      const url = await createPokepast(teamText, title);
      await openExternal(url);
    } catch (error) {
      toast.show('Could not create Pokepast. Please try again.');
    } finally {
      setCreatingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

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
          <p className="text-gray-400">No game history available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {toast.message ? <Toast message={toast.message} onClose={toast.clear} /> : null}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
            {data.map((game) => {
              const isPlayerWinner = game.winner === game.player.name;
              const playerKey = `${game.game_id}-${game.game_number}-player`;
              const opponentKey = `${game.game_id}-${game.game_number}-opponent`;
              const isCreatingPlayer = Boolean(creatingMap[playerKey]);
              const isCreatingOpponent = Boolean(creatingMap[opponentKey]);
              const playerDisabled = !(game.player.ots ?? '').trim();
              const opponentDisabled = !(game.opponent.ots ?? '').trim();

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
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <TeamPanel
                      player={game.player}
                      statusDotClass={isPlayerWinner ? 'bg-green-400' : 'bg-red-400'}
                      onCreateOts={() => handleCreatePokepast(game, 'player')}
                      isCreating={isCreatingPlayer}
                      isDisabled={playerDisabled}
                    />
                    <TeamPanel
                      player={game.opponent}
                      statusDotClass={!isPlayerWinner ? 'bg-green-400' : 'bg-red-400'}
                      onCreateOts={() => handleCreatePokepast(game, 'opponent')}
                      isCreating={isCreatingOpponent}
                      isDisabled={opponentDisabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
