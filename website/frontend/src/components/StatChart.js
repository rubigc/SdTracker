import React from 'react';
import PropTypes from 'prop-types';

const StatChart = ({ title, value, max = 100, color = '#3498db' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="stat-chart">
      <div className="stat-chart-header">
        <span className="stat-chart-title">{title}</span>
        <span className="stat-chart-value">{value}%</span>
      </div>
      <div className="stat-chart-bar-container">
        <div 
          className="stat-chart-bar" 
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
};

StatChart.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  color: PropTypes.string
};

StatChart.defaultProps = {
  max: 100,
  color: '#3498db'
};

export default StatChart;