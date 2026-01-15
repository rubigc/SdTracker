import { useState } from 'react';
import { Input } from '../common/Input';
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Enter player name"
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !player.trim()}>
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
