import { useState } from 'react';
import { PlayerSearch } from '../components/stats/PlayerSearch';
import { WinratesCard } from '../components/stats/WinratesCard';
import { LeadsCard } from '../components/stats/LeadsCard';
import { TeraCard } from '../components/stats/TeraCard';
import { HistoryCard } from '../components/stats/HistoryCard';
import { usePlayerStats, useLeadStats, useTeraStats, useGameHistory } from '../hooks/usePlayerStats';
import { BarChart3, History } from 'lucide-react';

type StatsTab = 'stats' | 'history';

export function StatsDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [activeTab, setActiveTab] = useState<StatsTab>('stats');
  
  const { data: winrates, isLoading: winratesLoading } = usePlayerStats(selectedPlayer);
  const { data: leads, isLoading: leadsLoading } = useLeadStats(selectedPlayer);
  const { data: tera, isLoading: teraLoading } = useTeraStats(selectedPlayer);
  const { data: history, isLoading: historyLoading } = useGameHistory(selectedPlayer);
  
  const isLoading = winratesLoading || leadsLoading || teraLoading || historyLoading;
  
  return (
    <div className="space-y-6 animate-fade-in">
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
        <>
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Stats
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History className="w-4 h-4 mr-2 inline" />
              Match History
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="animate-slide-up">
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WinratesCard data={winrates} loading={winratesLoading} />
                <LeadsCard data={leads} loading={leadsLoading} />
                <TeraCard data={tera} loading={teraLoading} />
              </div>
            )}
            
            {activeTab === 'history' && (
              <HistoryCard data={history} loading={historyLoading} />
            )}
          </div>
        </>
      )}
      
      {!selectedPlayer && (
        <div className="card-modern p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Search for a Player</h3>
          <p className="text-gray-400">
            Enter a player name above to view their statistics and match history
          </p>
        </div>
      )}
    </div>
  );
}
