import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PokemonFilter = ({ onFilterChange }) => {
  const [sortBy, setSortBy] = useState('win_rate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minGames, setMinGames] = useState(0);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if clicking the same sort option
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort by and reset to descending order
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    
    // Notify parent component of filter changes
    onFilterChange({
      sortBy: newSortBy,
      sortOrder,
      minGames: parseInt(minGames, 10) || 0
    });
  };

  const handleMinGamesChange = (e) => {
    const value = e.target.value;
    setMinGames(value);
    
    // Notify parent component of filter changes
    onFilterChange({
      sortBy,
      sortOrder,
      minGames: parseInt(value, 10) || 0
    });
  };

  const getSortIndicator = (field) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div className="pokemon-filter">
      <div className="filter-row">
        <label htmlFor="minGames">Minimum Games:</label>
        <input
          type="number"
          id="minGames"
          value={minGames}
          onChange={handleMinGamesChange}
          min="0"
        />
      </div>
      
      <div className="filter-row">
        <span>Sort by:</span>
        <button 
          className={`sort-button ${sortBy === 'win_rate' ? 'active' : ''}`}
          onClick={() => handleSortChange('win_rate')}
        >
          Win Rate{getSortIndicator('win_rate')}
        </button>
        <button 
          className={`sort-button ${sortBy === 'games_played' ? 'active' : ''}`}
          onClick={() => handleSortChange('games_played')}
        >
          Games Played{getSortIndicator('games_played')}
        </button>
        <button 
          className={`sort-button ${sortBy === 'pokemon' ? 'active' : ''}`}
          onClick={() => handleSortChange('pokemon')}
        >
          Name{getSortIndicator('pokemon')}
        </button>
      </div>
    </div>
  );
};

PokemonFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired
};

export default PokemonFilter;