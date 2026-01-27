import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useBackend } from '../hooks/useBackend';
import type { Account } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusIndicator } from '../components/common/StatusIndicator';
import { Users, Plus, Trash2, Edit, Trophy, Calendar, AlertCircle, Server } from 'lucide-react';

export function TeamsPage() {
  const queryClient = useQueryClient();
  const { apiRunning, startApiServer } = useBackend();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamData, setNewTeamData] = useState('');
  const [accountCreateError, setAccountCreateError] = useState<string | null>(null);
  const [teamCreateError, setTeamCreateError] = useState<string | null>(null);
  const [apiDebugEntries, setApiDebugEntries] = useState<ApiDebugEntry[]>([]);
  const [showApiDebug, setShowApiDebug] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ApiDebugEntry>).detail;
      if (!detail) {
        return;
      }
      setApiDebugEntries((prev) => {
        const next = [...prev, detail];
        if (next.length > 200) {
          next.splice(0, next.length - 200);
        }
        return next;
      });
    };

    window.addEventListener('sdtracker-api-debug', handler as EventListener);
    return () => window.removeEventListener('sdtracker-api-debug', handler as EventListener);
  }, []);

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading, isError: accountsHasError, error: accountsError } = useQuery({
    queryKey: ['accounts'],
    queryFn: api.getAccounts,
  });

  // Fetch teams
  const { data: teams, isLoading: teamsLoading, isError: teamsHasError, error: teamsError } = useQuery({
    queryKey: ['teams'],
    queryFn: api.getTeams,
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: api.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowCreateAccount(false);
      setNewAccountName('');
      setAccountCreateError(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create account.';
      setAccountCreateError(message);
    },
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: api.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedAccount) {
        queryClient.invalidateQueries({ queryKey: ['teams', selectedAccount.id] });
      }
      setShowCreateTeam(false);
      setNewTeamName('');
      setNewTeamData('');
      setTeamCreateError(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create team.';
      setTeamCreateError(message);
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: api.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedAccount) {
        queryClient.invalidateQueries({ queryKey: ['teams', selectedAccount.id] });
      }
    },
  });

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      setAccountCreateError(null);
      createAccountMutation.mutate({ name: newAccountName.trim() });
    }
  };

  const handleStartApiServer = () => {
    startApiServer();
  };

  const handleCreateTeam = () => {
    if (newTeamName.trim() && newTeamData.trim()) {
      setTeamCreateError(null);
      createTeamMutation.mutate({
        name: newTeamName.trim(),
        account_id: selectedAccount?.id,
        team_data: newTeamData.trim(),
      });
    }
  };

  const handleDeleteTeam = (teamId: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeamMutation.mutate(teamId);
    }
  };

  const filteredTeams = selectedAccount
    ? teams?.filter(team => team.account_id === selectedAccount.id)
    : teams;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teams & Accounts</h1>
        <div className="flex items-center gap-3">
          <StatusIndicator status={apiRunning ? 'running' : 'stopped'} />
          <Button onClick={() => setShowCreateAccount(true)} disabled={!apiRunning}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* API Server Status Warning */}
      {!apiRunning && (
        <Card className="bg-yellow-900/30 border-yellow-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-400 mb-1">API Server Not Running</h3>
              <p className="text-sm text-gray-300 mb-3">
                The API server is required to create accounts and manage teams. Please start it to continue.
              </p>
              <Button onClick={handleStartApiServer} size="sm" variant="success">
                <Server className="w-4 h-4 mr-2" />
                Start API Server
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Accounts Section */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Accounts
        </h2>
        
        {accountsLoading ? (
          <div className="text-gray-400">Loading accounts...</div>
        ) : accountsHasError ? (
          <div className="text-red-400">
            Failed to load accounts: {accountsError instanceof Error ? accountsError.message : 'Unknown error'}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedAccount?.id === account.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{account.name}</span>
                  {account.is_active && (
                    <span className="text-xs bg-green-500 px-2 py-1 rounded">Active</span>
                  )}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Created: {new Date(account.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No accounts found. Create one to get started!</div>
        )}
      </Card>

      {/* Teams Section */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Teams
            {selectedAccount && <span className="ml-2 text-sm text-gray-400">({selectedAccount.name})</span>}
          </h2>
          {selectedAccount && (
            <Button onClick={() => setShowCreateTeam(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          )}
        </div>

        {teamsLoading ? (
          <div className="text-gray-400">Loading teams...</div>
        ) : teamsHasError ? (
          <div className="text-red-400">
            Failed to load teams: {teamsError instanceof Error ? teamsError.message : 'Unknown error'}
          </div>
        ) : filteredTeams && filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>{team.wins} wins / {team.games_played} games</span>
                  </div>
                  
                  {team.last_used && (
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Last used: {new Date(team.last_used).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-400">
                    <Edit className="w-4 h-4 mr-2" />
                    <span>Created: {new Date(team.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-1">Team Preview:</div>
                  <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                    {team.team_data.substring(0, 100)}...
                  </pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">
            {selectedAccount 
              ? 'No teams found for this account. Create one to get started!'
              : 'Select an account to view teams.'}
          </div>
        )}
      </Card>

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New Account</h3>
            <Input
              type="text"
              placeholder="Account name"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="mb-4"
            />
            {accountCreateError && (
              <div className="text-sm text-red-400 mb-3">{accountCreateError}</div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateAccount} disabled={createAccountMutation.isPending}>
                {createAccountMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateAccount(false);
                  setNewAccountName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New Team</h3>
            <Input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mb-4"
            />
            <textarea
              placeholder="Paste your team data here (from Pokemon Showdown) or a pokepast.es link"
              value={newTeamData}
              onChange={(e) => setNewTeamData(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4 min-h-50 resize-y"
            />
            {teamCreateError && (
              <div className="text-sm text-red-400 mb-3">{teamCreateError}</div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateTeam(false);
                  setNewTeamName('');
                  setNewTeamData('');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* API Debug Panel */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">API Debug</h2>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowApiDebug((prev) => !prev)}
            >
              {showApiDebug ? 'Hide' : 'Show'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApiDebugEntries([])}
            >
              Clear
            </Button>
          </div>
        </div>
        {showApiDebug ? (
          <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto max-h-80">
            {apiDebugEntries.length === 0
              ? 'No requests yet.'
              : apiDebugEntries
                  .map((entry) => formatApiDebugEntry(entry))
                  .join('\n')}
          </pre>
        ) : (
          <div className="text-gray-400 text-sm">Enable to view recent API requests.</div>
        )}
      </Card>
    </div>
  );
}

type ApiDebugStage = 'request' | 'response' | 'error';

interface ApiDebugEntry {
  id: number;
  stage: ApiDebugStage;
  method: string;
  url: string;
  status?: number;
  ok?: boolean;
  error?: string;
  body?: string;
  time: string;
}

function formatApiDebugEntry(entry: ApiDebugEntry) {
  const status = entry.status !== undefined ? ` ${entry.status}` : '';
  const ok = entry.ok !== undefined ? ` ${entry.ok ? 'ok' : 'fail'}` : '';
  const body = entry.body ? ` body=${entry.body}` : '';
  const error = entry.error ? ` error=${entry.error}` : '';
  return `${entry.time} [${entry.stage}] ${entry.method} ${entry.url}${status}${ok}${body}${error}`;
}
