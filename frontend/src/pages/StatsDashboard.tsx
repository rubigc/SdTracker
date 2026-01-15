import { useState } from 'react';
import { PlayerSearch } from '../components/stats/PlayerSearch';
import { WinratesCard } from '../components/stats/WinratesCard';
import { LeadsCard } from '../components/stats/LeadsCard';
import { TeraCard } from '../components/stats/TeraCard';
import { HistoryCard } from '../components/stats/HistoryCard';
import { usePlayerStats, useLeadStats, useTeraStats, useGameHistory } from '../hooks/usePlayerStats';

export function StatsDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  
  const { data: winrates, isLoading: winratesLoading } = usePlayerStats(selectedPlayer);
  const { data: leads, isLoading: leadsLoading } = useLeadStats(selectedPlayer);
  const { data: tera, isLoading: teraLoading } = useTeraStats(selectedPlayer);
  const { data: history, isLoading: historyLoading } = useGameHistory(selectedPlayer);
  
  const isLoading = winratesLoading || leadsLoading || teraLoading || historyLoading;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Statistics Dashboard</h1>
        <p className="text-gray-400">
          View detailed statistics and game history for any player
        </p>
      </div>
      
      <PlayerSearch 
        onSearch={setSelectedPlayer}
        loading={isLoading}
      />
      
      {selectedPlayer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WinratesCard data={winrates} loading={winratesLoading} />
          <LeadsCard data={leads} loading={leadsLoading} />
          <TeraCard data={tera} loading={teraLoading} />
          <HistoryCard data={history} loading={historyLoading} />
        </div>
      )}
    </div>
  );
}
