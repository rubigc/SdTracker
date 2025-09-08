import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import StatChart from './StatChart';
import PokemonFilter from './PokemonFilter';
import ChartVisualization from './ChartVisualization';

const PokemonPerformance = ({ stats }) => {
  const [pokemonFilter, setPokemonFilter] = useState({
    sortBy: 'win_rate',
    sortOrder: 'desc',
    minGames: 0
  });
  
  const [teraFilter, setTeraFilter] = useState({
    sortBy: 'win_rate',
    sortOrder: 'desc',
    minGames: 0
  });

  const handlePokemonFilterChange = (filter) => {
    setPokemonFilter(filter);
  };

  const handleTeraFilterChange = (filter) => {
    setTeraFilter(filter);
  };

  // Filter and sort pokemon stats
  const filteredPokemon = useMemo(() => {
    if (!stats.pokemon || !Array.isArray(stats.pokemon)) return [];
    
    return stats.pokemon
      .filter(poke => poke.games_played >= pokemonFilter.minGames)
      .sort((a, b) => {
        let aValue, bValue;
        
        if (pokemonFilter.sortBy === 'pokemon') {
          aValue = a.pokemon;
          bValue = b.pokemon;
        } else {
          aValue = a[pokemonFilter.sortBy];
          bValue = b[pokemonFilter.sortBy];
        }
        
        if (pokemonFilter.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [stats.pokemon, pokemonFilter]);

  // Filter and sort tera stats
  const filteredTera = useMemo(() => {
    if (!stats.tera || !Array.isArray(stats.tera)) return [];
    
    return stats.tera
      .filter(tera => tera.games_played >= teraFilter.minGames)
      .sort((a, b) => {
        let aValue, bValue;
        
        if (teraFilter.sortBy === 'tera_type') {
          aValue = a.tera_type;
          bValue = b.tera_type;
        } else {
          aValue = a[teraFilter.sortBy];
          bValue = b[teraFilter.sortBy];
        }
        
        if (teraFilter.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [stats.tera, teraFilter]);

  // Helper function to render a pokemon stat
  const renderPokemonStat = (pokemon, idx) => (
    <div key={idx} className="pokemon-stat">
      <div className="pokemon-name">{pokemon.pokemon || pokemon.tera_type}</div>
      <StatChart
        title=""
        value={pokemon.win_rate}
        max={100}
      />
      <div className="stat-count">({pokemon.games_played} games)</div>
    </div>
  );

  return (
    <div>
      <div className="section">
        <h2>Pokémon Performance</h2>
        <PokemonFilter onFilterChange={handlePokemonFilterChange} />
        <div className="pokemon-stats">
          {filteredPokemon.map((poke, idx) =>
            renderPokemonStat(poke, idx)
          )}
        </div>
      </div>

      <div className="section">
        <h2>Tera Performance</h2>
        <PokemonFilter onFilterChange={handleTeraFilterChange} />
        <div className="pokemon-stats">
          {filteredTera.map((tera, idx) =>
            renderPokemonStat(tera, idx)
          )}
        </div>
      </div>
      
      <div className="section">
        <h2>Top Pokémon Performance</h2>
        <ChartVisualization
          data={filteredPokemon
            .slice(0, 10)
            .map(poke => ({
              label: poke.pokemon,
              value: poke.win_rate,
              color: '#3498db'
            }))}
          type="bar"
          title="Top 10 Pokémon by Win Rate"
        />
      </div>
      
      <div className="section">
        <h2>Top Tera Performance</h2>
        <ChartVisualization
          data={filteredTera
            .slice(0, 10)
            .map(tera => ({
              label: tera.tera_type,
              value: tera.win_rate,
              color: '#27ae60'
            }))}
          type="bar"
          title="Top 10 Tera Types by Win Rate"
        />
      </div>
    </div>
  );
};

PokemonPerformance.propTypes = {
  stats: PropTypes.shape({
    pokemon: PropTypes.arrayOf(PropTypes.shape({
      pokemon: PropTypes.string,
      win_rate: PropTypes.number,
      games_played: PropTypes.number
    })),
    tera: PropTypes.arrayOf(PropTypes.shape({
      tera_type: PropTypes.string,
      win_rate: PropTypes.number,
      games_played: PropTypes.number
    }))
  }).isRequired
};

export default PokemonPerformance;