import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import StatsOverview from './StatsOverview';
import LeadPerformance from './LeadPerformance';
import PokemonPerformance from './PokemonPerformance';
import MatchHistory from './MatchHistory';
import { useToast } from './ToastProvider';
import PlayerAutocomplete from './PlayerAutocomplete';
import RecentPlayers from './RecentPlayers';

const PlayerStats = () => {
  const [player, setPlayer] = useState('');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const { showToast } = useToast();
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Load recent players from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('recentPlayers');
    if (savedPlayers) {
      setRecentPlayers(JSON.parse(savedPlayers));
    }
    
    // Apply dark mode to the entire app
    document.body.classList.add('dark-mode');
  }, []);

  // Save player to recent players list
  const savePlayerToRecent = (playerName) => {
    if (!playerName) return;
    
    const updatedPlayers = [
      playerName,
      ...recentPlayers.filter(name => name !== playerName)
    ].slice(0, 5); // Keep only the last 5 players
    
    setRecentPlayers(updatedPlayers);
    localStorage.setItem('recentPlayers', JSON.stringify(updatedPlayers));
  };

  // Export player stats to CSV
  const exportToCSV = (statsData, playerName) => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add player info
    csvContent += `Player,${playerName}\n\n`;
    
    // Add overall stats
    csvContent += "Category,Value,Games Played\n";
    csvContent += `Overall Win Rate,${statsData.wr},${statsData.games_played}\n`;
    csvContent += `BO3 Win Rate,${statsData.bo3wr},${statsData.bo3_played}\n\n`;
    
    // Add BO3 game positions
    if (statsData.bo3games) {
      csvContent += "Game Position,Win Rate,Games Played\n";
      csvContent += `Game 1,${statsData.bo3games.g1bo3wr?.win_rate || 0},${statsData.bo3games.g1bo3wr?.games_played || 0}\n`;
      csvContent += `Game 2,${statsData.bo3games.g2bo3wr?.win_rate || 0},${statsData.bo3games.g2bo3wr?.games_played || 0}\n`;
      csvContent += `Game 3,${statsData.bo3games.g3bo3wr?.win_rate || 0},${statsData.bo3games.g3bo3wr?.games_played || 0}\n\n`;
    }
    
    // Add lead performance
    if (statsData.leads && statsData.leads.length > 0) {
      csvContent += "Lead,Pokemon,Win Rate,Games Played\n";
      statsData.leads.forEach(lead => {
        csvContent += `Lead,${lead.pokemon},${lead.win_rate},${lead.games_played}\n`;
      });
      csvContent += "\n";
    }
    
    // Add pokemon performance
    if (statsData.pokemon && statsData.pokemon.length > 0) {
      csvContent += "Pokemon,Pokemon,Win Rate,Games Played\n";
      statsData.pokemon.forEach(poke => {
        csvContent += `Pokemon,${poke.pokemon},${poke.win_rate},${poke.games_played}\n`;
      });
      csvContent += "\n";
    }
    
    // Add tera performance
    if (statsData.tera && statsData.tera.length > 0) {
      csvContent += "Tera,Tera Type,Win Rate,Games Played\n";
      statsData.tera.forEach(tera => {
        csvContent += `Tera,${tera.tera_type},${tera.win_rate},${tera.games_played}\n`;
      });
      csvContent += "\n";
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${playerName}_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export player stats to JSON
  const exportToJSON = (statsData, playerName) => {
    // Create JSON content
    const jsonData = {
      player: playerName,
      exportedAt: new Date().toISOString(),
      stats: statsData
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Create download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${playerName}_stats.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchStats = async () => {
    if (!player.trim()) return;
    setLoading(true);
    
    // Check if player exists
    const playerExists = await checkPlayerExists(player);
    if (!playerExists) {
      showToast(`Player "${player}" not found.`, 'error');
      setLoading(false);
      return;
    }
    
    try {
      const statsData = await apiService.getAllPlayerStats(player);
      setStats(statsData);
      // Save player to recent players list
      savePlayerToRecent(player);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      showToast('Failed to fetch player stats. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if player exists
  const checkPlayerExists = async (playerName) => {
    try {
      const response = await fetch(`http://localhost:3001/api/player/${playerName}/wr`);
      if (!response.ok) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking player existence:', error);
      return false;
    }
  };

  const fetchMatches = async () => {
    if (!player.trim()) return;
    setLoading(true);
    
    try {
      const data = await apiService.getPlayerMatches(player);
      setMatches(data);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      showToast('Failed to fetch match history. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'matches') {
      fetchMatches();
    }
  };

  const renderLoading = () => (
    <div className="loading">
      <div className="spinner"></div>
      Loading...
    </div>
  );

  return (
    <div className={`player-stats ${darkMode ? 'dark-mode' : ''}`}>
      {loading && (
        <div className="global-loading-overlay">
          <div className="global-loading-content">
            <div className="spinner"></div>
            <p>Loading player data...</p>
          </div>
        </div>
      )}
      
      <div className="header">
        <div className="header-top">
          <PlayerAutocomplete
            value={player}
            onChange={setPlayer}
            placeholder="Enter player name"
          />
          <button
            className="search-button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <RecentPlayers
          players={recentPlayers}
          onPlayerSelect={setPlayer}
        />
        <div className="tabs">
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
          <button
            className={activeTab === 'matches' ? 'active' : ''}
            onClick={() => setActiveTab('matches')}
          >
            Match History
          </button>
        </div>
      </div>

      {!loading && activeTab === 'stats' && stats.wr !== undefined && (
        <div className="player-summary">
          <h2>Player Summary</h2>
          <div className="summary-stats">
            <div className="summary-stat">
              <div className="summary-label">Total Games</div>
              <div className="summary-value">{stats.games_played}</div>
            </div>
            <div className="summary-stat">
              <div className="summary-label">Win Rate</div>
              <div className="summary-value">{stats.wr}%</div>
            </div>
            <div className="summary-stat">
              <div className="summary-label">BO3 Win Rate</div>
              <div className="summary-value">{stats.bo3wr}%</div>
            </div>
          </div>
          <div className="export-buttons">
            <button
              className="export-button"
              onClick={() => exportToCSV(stats, player)}
            >
              Export Stats to CSV
            </button>
            <button
              className="export-button"
              onClick={() => exportToJSON(stats, player)}
              style={{ marginLeft: '10px' }}
            >
              Export Stats to JSON
            </button>
          </div>
        </div>
      )}

      {!loading && activeTab === 'stats' && (
        stats.wr !== undefined ? (
          <div className="stats-container">
            <StatsOverview stats={stats} />
            <LeadPerformance stats={stats} player={player} />
            <PokemonPerformance stats={stats} />
          </div>
        ) : (
          <div>Enter a player name to load stats</div>
        )
      )}

      {!loading && activeTab === 'matches' && (
        <MatchHistory matches={matches} player={player} />
      )}
    </div>
  );
};

export default PlayerStats;