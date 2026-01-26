import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayerSearch } from '../components/stats/PlayerSearch';
import { WinratesCard } from '../components/stats/WinratesCard';
import { LeadsCard } from '../components/stats/LeadsCard';
import { TeraCard } from '../components/stats/TeraCard';
import { HistoryCard } from '../components/stats/HistoryCard';
import { MoveStatsCard } from '../components/stats/MoveStatsCard';
import { usePlayerStats, useLeadStats, useTeraStats, useGameHistory } from '../hooks/usePlayerStats';
import { api } from '../services/api';
import type { Account, Team } from '../types';
import { BarChart3, History, Zap, Filter } from 'lucide-react';

type StatsTab = 'stats' | 'history' | 'moves';

export function StatsDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [activeTab, setActiveTab] = useState<StatsTab>('stats');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const { data: winrates, isLoading: winratesLoading } = usePlayerStats(selectedPlayer);
  const { data: leads, isLoading: leadsLoading } = useLeadStats(selectedPlayer);
  const { data: tera, isLoading: teraLoading } = useTeraStats(selectedPlayer);
  const { data: history, isLoading: historyLoading } = useGameHistory(selectedPlayer);
  
  // Fetch accounts for filtering
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: api.getAccounts,
  });

  // Fetch teams for selected account
  const { data: teams } = useQuery({
    queryKey: ['teams', selectedAccount?.id],
    queryFn: () => selectedAccount ? api.getTeamsByAccount(selectedAccount.id) : Promise.resolve([]),
    enabled: !!selectedAccount,
  });
  
  const isLoading = winratesLoading || leadsLoading || teraLoading || historyLoading;
  
  const handleClearFilters = () => {
    setSelectedAccount(null);
    setSelectedTeam(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Statistics Dashboard</h1>
        <p className="text-gray-400">
          View detailed statistics and game history for any player
        </p>
      </div>
      
      {/* Account/Team Filter */}
      {(accounts && accounts.length > 0) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">Filter by Account/Team</h3>
            {(selectedAccount || selectedTeam) && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-sm text-blue-400 hover:text-blue-300"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Account</label>
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const account = accounts?.find(a => a.id === Number(e.target.value));
                  setSelectedAccount(account || null);
                  setSelectedTeam(null);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Accounts</option>
                {accounts?.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} {account.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Team</label>
              <select
                value={selectedTeam?.id || ''}
                onChange={(e) => {
                  const team = teams?.find(t => t.id === Number(e.target.value));
                  setSelectedTeam(team || null);
                }}
                disabled={!selectedAccount}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
              >
                <option value="">All Teams</option>
                {teams?.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.wins}/{team.games_played})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
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
            
            {selectedAccount && (
              <button
                onClick={() => setActiveTab('moves')}
                className={`tab-button ${activeTab === 'moves' ? 'active' : ''}`}
              >
                <Zap className="w-4 h-4 mr-2 inline" />
                Move Usage
              </button>
            )}
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
            
            {activeTab === 'moves' && selectedAccount && (
              <MoveStatsCard 
                accountId={selectedAccount.id} 
                teamId={selectedTeam?.id}
              />
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
