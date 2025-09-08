import React from 'react';
import PropTypes from 'prop-types';
import GameDetails from './GameDetails';

const MatchCard = ({ match }) => {
  return (
    <div key={match.id} className="match-card">
      <div className="match-header">
        <div className={`player ${match.winner_name === match.player1 ? 'winner' : ''}`}>
          {match.player1}
        </div>
        <div className="vs">vs</div>
        <div className={`player ${match.winner_name === match.player2 ? 'winner' : ''}`}>
          {match.player2}
        </div>
      </div>
      <div className="match-date">
        {new Date(match.match_date).toLocaleDateString()}
      </div>
      <div className="results">
        Winner: {match.winner_name}
      </div>
      
      <div className="games">
        {match.games && match.games.map((game) => (
          <GameDetails key={game.game_id} game={game} />
        ))}
      </div>
    </div>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
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
  }).isRequired
};

export default MatchCard;