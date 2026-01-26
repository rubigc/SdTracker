import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Account, Team, CreateAccountRequest, CreateTeamRequest } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Users, Plus, Trash2, Edit, Trophy, Calendar } from 'lucide-react';

export function TeamsPage() {
  const queryClient = useQueryClient();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamData, setNewTeamData] = useState('');

  // Fetch accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: api.getAccounts,
  });

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
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
      createAccountMutation.mutate({ name: newAccountName.trim() });
    }
  };

  const handleCreateTeam = () => {
    if (newTeamName.trim() && newTeamData.trim()) {
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
        <Button onClick={() => setShowCreateAccount(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts Section */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Accounts
        </h2>
        
        {accountsLoading ? (
          <div className="text-gray-400">Loading accounts...</div>
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
              placeholder="Paste your team data here (from Pokemon Showdown)"
              value={newTeamData}
              onChange={(e) => setNewTeamData(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4 min-h-[200px] resize-y"
            />
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
    </div>
  );
}
