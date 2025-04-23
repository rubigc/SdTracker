import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import * as Wails from '../../wailsjs/runtime/runtime';
import TeamModal from './TeamModal';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // This will call the backend GetMatchHistories function
    window.backend.App.GetMatchHistories().then(data => {
      setMatches(JSON.parse(data));
    });
  }, []);

  const handleOpenReplay = (replayFile) => {
    window.backend.App.OpenReplay(replayFile);
  };

  const [showModal, setShowModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isWinner, setIsWinner] = useState(false);

  const handleShowTeam = (player, winner) => {
    setCurrentPlayer(player);
    setIsWinner(winner);
    setShowModal(true);
  };

  const handleGetOTS = async (playerName) => {
    const otsCode = await window.backend.App.GetOTS(playerName);
    await navigator.clipboard.writeText(otsCode);
    alert('OTS copied to clipboard!');
  };

  return (
    <div className="match-history">
      <h2>Match History</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th colSpan="2">Player 1</th>
            <th colSpan="2">Player 2</th>
            <th>Replay</th>
          </tr>
          <tr>
            <th></th>
            <th>Team & Leads</th>
            <th>Actions</th>
            <th>Team & Leads</th>
            <th>Actions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td>{match.Timestamp}</td>
              
              {/* Player 1 */}
              <td>
                <Button
                  variant="outline-primary"
                  onClick={() => handleShowTeam(match.Player1, match.Winner === match.Player1.Name)}
                >
                  {match.Player1.Name} {match.Winner === match.Player1.Name && '🏆'}
                </Button>
              </td>
              <td>
                <button onClick={() => handleGetOTS(match.Player1.Name)}>
                  Get OTS
                </button>
              </td>
              
              {/* Player 2 */}
              <td>
                <Button
                  variant="outline-primary"
                  onClick={() => handleShowTeam(match.Player2, match.Winner === match.Player2.Name)}
                >
                  {match.Player2.Name} {match.Winner === match.Player2.Name && '🏆'}
                </Button>
              </td>
              <td>
                <button onClick={() => handleGetOTS(match.Player2.Name)}>
                  Get OTS
                </button>
              </td>
              
              {/* Replay */}
              <td>
                <button onClick={() => handleOpenReplay(match.ReplayFile)}>
                  Open Replay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <TeamModal
        show={showModal}
        onHide={() => setShowModal(false)}
        player={currentPlayer}
        isWinner={isWinner}
      />
    </div>
  );
};

export default MatchHistory;