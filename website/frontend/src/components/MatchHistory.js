import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import MatchCard from './MatchCard';

const MatchHistory = ({ matches, player }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonFilter, setPokemonFilter] = useState('');
  const [winLossFilter, setWinLossFilter] = useState('all'); // 'all', 'wins', 'losses'
  const matchesPerPage = 5;

  // Export matches to CSV
  const exportMatchesToCSV = (matchesData, playerName) => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "Match ID,Player 1,Player 2,Winner,Match Date\n";
    
    // Add matches data
    matchesData.forEach(match => {
      csvContent += `${match.id},${match.player1},${match.player2},${match.winner_name},${match.match_date}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${playerName}_matches.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter matches based on opponent Pokémon and win/loss
  const filteredMatches = useMemo(() => {
    let filtered = matches;
    
    
    // Apply Pokémon filter
    if (pokemonFilter) {
      filtered = filtered.filter(match => {
        // Check if any game in the match has the specified Pokémon
        if (!match.games || !Array.isArray(match.games) || match.games.length === 0) {
          return false;
        }
        
        return match.games.some(game => {
          try {
            const opponentTeam = game.opponent.team;
            
            // Check if the opponent's team contains the specified Pokémon
            if (opponentTeam && typeof opponentTeam === 'string' && opponentTeam.trim() !== '') {
              const opponentPokemonList = opponentTeam.split(';');
              if (opponentPokemonList.some(pokemon =>
                pokemon.toLowerCase().trim().includes(pokemonFilter.toLowerCase().trim())
              )) {
                return true;
              }
            }
          } catch (error) {
            console.error(`Error filtering match ${match.id}:`, error);
          }
          return false;
        });
      });
    }
    
    // Apply win/loss filter
    if (winLossFilter !== 'all') {
      filtered = filtered.filter(match => {
        if (winLossFilter === 'wins') {
          return match.winner_name === player;
        } else if (winLossFilter === 'losses') {
          return match.winner_name !== player;
        }
        return true;
      });
    }
    
    return filtered;
  }, [matches, pokemonFilter, winLossFilter, player]);

  // Calculate pagination based on filtered matches
  const totalPages = useMemo(() => {
    return Math.ceil(filteredMatches.length / matchesPerPage);
  }, [filteredMatches.length]);

  // Get matches for current page from filtered matches
  const currentMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    return filteredMatches.slice(startIndex, endIndex);
  }, [filteredMatches, currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="matches-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Filter by Pokémon..."
          value={pokemonFilter}
          onChange={(e) => setPokemonFilter(e.target.value)}
          className="opponent-pokemon-filter-input"
        />
        <select
          value={winLossFilter}
          onChange={(e) => setWinLossFilter(e.target.value)}
          className="win-loss-filter-select"
        >
          <option value="all">All Matches</option>
          <option value="wins">Wins Only</option>
          <option value="losses">Losses Only</option>
        </select>
        <div className="export-buttons">
          <button
            className="export-button"
            onClick={() => exportMatchesToCSV(filteredMatches, player)}
          >
            Export Matches to CSV
          </button>
        </div>
      </div>
      
      {filteredMatches.length > 0 ? (
        <>
          {pokemonFilter && (
            <div className="filter-active-message">
              Showing matches with Pokémon: {pokemonFilter}
            </div>
          )}
          {currentMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : pokemonFilter ? (
        <div className="no-matches-message">
          No matches found with Pokémon: {pokemonFilter}
        </div>
      ) : player ? (
        <div className="no-matches-message">
          No match history found for {player}
        </div>
      ) : (
        <div className="no-matches-message">
          Enter a player name to see matches
        </div>
      )}
    </div>
  );
};

MatchHistory.propTypes = {
  matches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    player1: PropTypes.string.isRequired,
    player2: PropTypes.string.isRequired,
    winner_name: PropTypes.string.isRequired,
    match_date: PropTypes.string.isRequired,
    games: PropTypes.arrayOf(PropTypes.shape({
      game_id: PropTypes.number.isRequired,
      game_number: PropTypes.number.isRequired,
      player: PropTypes.shape({
        name: PropTypes.string.isRequired,
        team: PropTypes.string,
        lead: PropTypes.string,
        tera: PropTypes.string
      }).isRequired,
      opponent: PropTypes.shape({
        name: PropTypes.string.isRequired,
        team: PropTypes.string,
        lead: PropTypes.string,
        tera: PropTypes.string
      }).isRequired,
      winner: PropTypes.string.isRequired
    }))
  })).isRequired,
  player: PropTypes.string.isRequired
};

export default MatchHistory;