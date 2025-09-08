import React from 'react';
import PropTypes from 'prop-types';
import StatChart from './StatChart';
import ChartVisualization from './ChartVisualization';

const StatsOverview = ({ stats }) => {
  // Helper function to render a stat chart
  const renderStatChart = (title, value, games = null) => (
    <div className="stat-card">
      <StatChart title={title} value={value} />
      {games !== null && <div className="stat-desc">{games} games</div>}
    </div>
  );

  return (
    <div className="section">
      <h2>Overall Stats</h2>
      <div className="stats-row">
        {stats.wr !== undefined && renderStatChart('Game Win Rate', stats.wr, stats?.games_played)}
        {stats.bo3wr !== undefined && renderStatChart('BO3 Win Rate', stats.bo3wr, stats?.bo3_played)}
      </div>
      
      <div className="section">
        <h2>BO3 Game Positions</h2>
        <div className="stats-row">
          {stats.bo3games?.g1bo3wr && renderStatChart(
            'Game 1 WR',
            stats.bo3games.g1bo3wr.win_rate,
            stats.bo3games.g1bo3wr.games_played
          )}
          {stats.bo3games?.g2bo3wr && renderStatChart(
            'Game 2 WR',
            stats.bo3games.g2bo3wr.win_rate,
            stats.bo3games.g2bo3wr.games_played
          )}
          {stats.bo3games?.g3bo3wr && renderStatChart(
            'Game 3 WR',
            stats.bo3games.g3bo3wr.win_rate,
            stats.bo3games.g3bo3wr.games_played
          )}
        </div>
      </div>
      <div className="section">
        <h2>Performance Overview</h2>
        <div className="charts-row">
          <div className="chart-wrapper">
            <ChartVisualization
              data={[
                { label: 'Overall', value: stats.wr, color: '#3498db' },
                { label: 'BO3', value: stats.bo3wr, color: '#27ae60' }
              ]}
              type="bar"
              title="Win Rates Comparison"
            />
          </div>
          
          {stats.bo3games && (
            <div className="chart-wrapper">
              <ChartVisualization
                data={[
                  { label: 'Game 1', value: stats.bo3games.g1bo3wr?.win_rate || 0, color: '#9b59b6' },
                  { label: 'Game 2', value: stats.bo3games.g2bo3wr?.win_rate || 0, color: '#f1c40f' },
                  { label: 'Game 3', value: stats.bo3games.g3bo3wr?.win_rate || 0, color: '#e67e22' }
                ]}
                type="line"
                title="BO3 Game Progression"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StatsOverview.propTypes = {
  stats: PropTypes.shape({
    wr: PropTypes.number,
    games_played: PropTypes.number,
    bo3wr: PropTypes.number,
    bo3_played: PropTypes.number,
    bo3games: PropTypes.shape({
      g1bo3wr: PropTypes.shape({
        win_rate: PropTypes.number,
        games_played: PropTypes.number
      }),
      g2bo3wr: PropTypes.shape({
        win_rate: PropTypes.number,
        games_played: PropTypes.number
      }),
      g3bo3wr: PropTypes.shape({
        win_rate: PropTypes.number,
        games_played: PropTypes.number
      })
    }),
  }).isRequired
};

export default StatsOverview;