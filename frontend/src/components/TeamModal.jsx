import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const TeamModal = ({ show, onHide, player, isWinner }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {player.Name}'s Team {isWinner && '🏆'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="team-display-modal">
          {player.Team.map((pokemon, i) => (
            <div key={i} className="pokemon-modal">
              <img 
                src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.toLowerCase()}.png`}
                alt={pokemon}
                className="pokemon-img"
              />
              <span className="pokemon-name">{pokemon}</span>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={() => {
            navigator.clipboard.writeText(player.OTS);
            alert('OTS copied to clipboard!');
          }}
        >
          Copy OTS
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamModal;