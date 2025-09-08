import React, { useState } from 'react';
import PropTypes from 'prop-types';
import OTSModal from './OTSModal';

const GameDetails = ({ game }) => {
  // State for OTS modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOtsData, setModalOtsData] = useState('');

  // Helper function to get pokemon image URL
  const getPokemonImageUrl = (pokemonName) => {
    let formattedName = pokemonName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    const hyphenCount = (formattedName.match(/-/g) || []).length;

    if (hyphenCount > 1) {
      const firstHyphenIndex = formattedName.indexOf('-');
      formattedName = formattedName.substring(0, firstHyphenIndex + 1) + formattedName.substring(firstHyphenIndex + 1).replace(/-/g, '');
    }

    if (formattedName.includes('-')) {
      const nameWithoutHyphen = formattedName.replace(/-/g, '');
      if (nameWithoutHyphen.length <= 9) {
        formattedName = nameWithoutHyphen;
      }
    }
    
    return `https://play.pokemonshowdown.com/sprites/gen5/${formattedName}.png`;
  };

  // Helper function to render a team
  const renderTeam = (teamString) => {
    if (!teamString) return null;
    const pokemon = teamString.split(';');
    return (
      <div className="team-display">
        {pokemon.map((poke, index) => (
          <div key={index} className="pokemon-team-item">
            <img
              src={getPokemonImageUrl(poke.trim())}
              alt={poke.trim()}
              className="pokemon-image-small"
            />
            <span className="pokemon-name-small">{poke.trim()}</span>
          </div>
        ))}
      </div>
    );
  };

  // Function to open replay in popup
  const openReplay = () => {
    if (game.replay) {
      // Open a new window/popup
      const replayWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (replayWindow) {
        // Create a complete HTML document with the replay content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Pokémon Showdown Replay</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${game.replay}
          </body>
          </html>
        `;
        
        // Write the HTML content to the new window
        replayWindow.document.write(htmlContent);
        replayWindow.document.close();
      } else {
        // If popup is blocked, show an alert
        alert('Popup blocked. Please allow popups for this site to view the replay.');
      }
    }
  };

  // Function to display open team sheets in modal
  const displayOTS = (otsData, playerName) => {
    if (otsData) {
      setModalTitle(`${playerName}'s Open Team Sheets`);
      setModalOtsData(otsData);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="game">
      <div className="game-header">Game {game.game_number}</div>
      <div className="game-players">
        <div className="player-info">
          <div><strong>{game.player.name}</strong></div>
          {renderTeam(game.player.team)}
          <div>Lead: {game.player.lead}</div>
          <div>Tera: {game.player.tera}</div>
        </div>
        <div className="vs">vs</div>
        <div className="player-info">
          <div><strong>{game.opponent.name}</strong></div>
          {renderTeam(game.opponent.team)}
          <div>Lead: {game.opponent.lead}</div>
          <div>Tera: {game.opponent.tera}</div>
        </div>
      </div>
      <div className="game-winner">
        Winner: <span className="winner">{game.winner}</span>
      </div>
      <div className="game-actions">
        <button onClick={openReplay} disabled={!game.replay}>
          {game.replay ? 'View Replay' : 'No Replay Available'}
        </button>
        <button onClick={() => displayOTS(game.player.ots, game.player.name)} disabled={!game.player.ots}>
          {game.player.ots ? `${game.player.name}'s OTS` : `No OTS for ${game.player.name}`}
        </button>
        <button onClick={() => displayOTS(game.opponent.ots, game.opponent.name)} disabled={!game.opponent.ots}>
          {game.opponent.ots ? `${game.opponent.name}'s OTS` : `No OTS for ${game.opponent.name}`}
        </button>
      </div>
      
      <OTSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        otsData={modalOtsData}
      />
    </div>
  );
};

GameDetails.propTypes = {
  game: PropTypes.shape({
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
    winner: PropTypes.string.isRequired,
    replay: PropTypes.string,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
      team: PropTypes.string,
      lead: PropTypes.string,
      tera: PropTypes.string,
      ots: PropTypes.string
    }).isRequired,
    opponent: PropTypes.shape({
      name: PropTypes.string.isRequired,
      team: PropTypes.string,
      lead: PropTypes.string,
      tera: PropTypes.string,
      ots: PropTypes.string
    }).isRequired
  }).isRequired
};

export default GameDetails;