import React from 'react';
import PropTypes from 'prop-types';

const RecentPlayers = ({ players, onPlayerSelect }) => {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="recent-players">
      <h3>Recent Players</h3>
      <div className="recent-players-list">
        {players.map((player, index) => (
          <button
            key={index}
            className="recent-player-button"
            onClick={() => onPlayerSelect(player)}
          >
            {player}
          </button>
        ))}
      </div>
    </div>
  );
};

RecentPlayers.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  onPlayerSelect: PropTypes.func.isRequired
};

RecentPlayers.defaultProps = {
  players: []
};

export default RecentPlayers;