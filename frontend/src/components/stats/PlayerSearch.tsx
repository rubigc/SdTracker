import { useState } from 'react';
import { Button } from '../common/Button';
import { Search } from 'lucide-react';

interface PlayerSearchProps {
  onSearch: (player: string) => void;
  loading?: boolean;
}

export function PlayerSearch({ onSearch, loading }: PlayerSearchProps) {
  const [player, setPlayer] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player.trim()) {
      onSearch(player.trim());
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="glass rounded-2xl p-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
        <div className="pl-4">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a player..."
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none py-3 px-2 text-lg"
        />
        <Button
          type="submit"
          disabled={loading || !player.trim()}
          className="px-6 py-3 rounded-xl"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
