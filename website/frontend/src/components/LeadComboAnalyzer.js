import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/api';
import { useToast } from './ToastProvider';

const LeadComboAnalyzer = ({ player, onAnalyze }) => {
  const [leadCombo, setLeadCombo] = useState('');
  const [comboStats, setComboStats] = useState(null);
  const [comboLoading, setComboLoading] = useState(false);

  const { showToast } = useToast();

  // Memoize leadsArray to avoid recalculating on every render
  const leadsArray = useMemo(() => leadCombo.split(';'), [leadCombo]);

  const fetchLeadComboStats = async () => {
    if (!player || !leadCombo) return;
    
    setComboLoading(true);
    setComboStats(null);
    
    try {
      if (leadsArray.length === 2 && leadsArray[0].trim() !== '' && leadsArray[1].trim() !== '') {
        // Fetch combination stats
        const data = await apiService.getPlayerLeadCombinationWinRate(player, leadCombo);
        setComboStats(data);
        onAnalyze(data);
      } else {
        // Handle single lead
        const data = await apiService.getPlayerLeadWinRate(player);
        const singleLeadStats = data.find(item => item.pokemon === leadCombo);
        
        if (singleLeadStats) {
          const result = {
            win_rate: singleLeadStats.win_rate,
            games_played: singleLeadStats.games_played
          };
          setComboStats(result);
          onAnalyze(result);
        } else {
          setComboStats(null);
          onAnalyze(null);
          showToast('No data found for this lead combination.', 'warning');
        }
      }
    } catch (err) {
      console.error('Failed to fetch lead stats:', err.message, err);
      setComboStats(null);
      onAnalyze(null);
      showToast('Failed to fetch lead combination stats. Please try again.', 'error');
    } finally {
      setComboLoading(false);
    }
  };

  // Helper function to render a stat card
  const renderStatCard = (title, value, games = null) => (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}%</div>
      {games !== null && <div className="stat-desc">{games} games</div>}
    </div>
  );

  return (
    <div className="lead-pair-section">
      <div className="lead-input">
        <input
          type="text"
          value={leadCombo}
          onChange={(e) => setLeadCombo(e.target.value)}
          placeholder="Enter lead (Pokemon1;Pokemon2)"
        />
        <button
          onClick={fetchLeadComboStats}
          disabled={comboLoading}
        >
          {comboLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      
      {comboLoading && <div className="loading">Loading lead combination stats...</div>}
      
      {comboStats && !comboLoading && (
        <div className="combo-results">
          <h3>{leadsArray.length === 2 ? `Lead Combination: ${leadCombo}` : `Lead: ${leadCombo}`}</h3>
          <div className="stats-row">
            {/* Check if it's a single lead stat or a combination stat */}
            {comboStats.win_rate !== undefined ? (
              // This is for single lead
              renderStatCard('Win Rate', comboStats.win_rate, comboStats.games_played)
            ) : comboStats.g1 !== undefined ? (
              // This is for lead combination (g1, g2, g3)
              <>
                {renderStatCard('Game 1 WR', comboStats.g1.win_rate, comboStats.g1.total)}
                {renderStatCard('Game 2 WR', comboStats.g2.win_rate, comboStats.g2.total)}
                {renderStatCard('Game 3 WR', comboStats.g3.win_rate, comboStats.g3.total)}
              </>
            ) : (
              <div>No data found for this lead combination.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

LeadComboAnalyzer.propTypes = {
  player: PropTypes.string.isRequired,
  onAnalyze: PropTypes.func.isRequired
};

export default LeadComboAnalyzer;