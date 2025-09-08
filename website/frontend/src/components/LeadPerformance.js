import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import LeadComboAnalyzer from './LeadComboAnalyzer';
import StatChart from './StatChart';
import PokemonFilter from './PokemonFilter';
import ChartVisualization from './ChartVisualization';

const LeadPerformance = ({ stats, player }) => {
  const [analyzedStats, setAnalyzedStats] = useState(null);
  const [leadFilter, setLeadFilter] = useState({
    sortBy: 'win_rate',
    sortOrder: 'desc',
    minGames: 0
  });

  const handleAnalyze = (stats) => {
    setAnalyzedStats(stats);
  };

  const handleLeadFilterChange = (filter) => {
    setLeadFilter(filter);
  };

  // Filter and sort lead stats
  const filteredLeads = useMemo(() => {
    if (!stats.leads || !Array.isArray(stats.leads)) return [];
    
    return stats.leads
      .filter(lead => lead.games_played >= leadFilter.minGames)
      .sort((a, b) => {
        let aValue, bValue;
        
        if (leadFilter.sortBy === 'pokemon') {
          aValue = a.pokemon;
          bValue = b.pokemon;
        } else {
          aValue = a[leadFilter.sortBy];
          bValue = b[leadFilter.sortBy];
        }
        
        if (leadFilter.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [stats.leads, leadFilter]);

  // Helper function to render a pokemon stat
  const renderPokemonStat = (pokemon, idx) => (
    <div key={idx} className="pokemon-stat">
      <div className="pokemon-name">{pokemon.pokemon}</div>
      <StatChart
        title=""
        value={pokemon.win_rate}
        max={100}
      />
      <div className="stat-count">({pokemon.games_played} games)</div>
    </div>
  );

  return (
    <div className="section">
      <h2>Lead Performance</h2>
      
      <LeadComboAnalyzer player={player} onAnalyze={handleAnalyze} />
      
      <PokemonFilter onFilterChange={handleLeadFilterChange} />
      <div className="pokemon-stats">
        {filteredLeads.map((lead, idx) =>
          renderPokemonStat(lead, idx)
        )}
      </div>
      
      <div className="section">
        <h2>Top Lead Performance</h2>
        <ChartVisualization
          data={filteredLeads
            .slice(0, 10)
            .map(lead => ({
              label: lead.pokemon,
              value: lead.win_rate,
              color: '#9b59b6'
            }))}
          type="bar"
          title="Top 10 Leads by Win Rate"
        />
      </div>
    </div>
  );
};

LeadPerformance.propTypes = {
  stats: PropTypes.shape({
    leads: PropTypes.arrayOf(PropTypes.shape({
      pokemon: PropTypes.string,
      win_rate: PropTypes.number,
      games_played: PropTypes.number
    }))
  }).isRequired,
  player: PropTypes.string.isRequired
};

export default LeadPerformance;