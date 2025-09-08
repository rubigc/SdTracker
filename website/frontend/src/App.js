import React, { useEffect } from 'react';
import PlayerStats from './components/PlayerStats';
import { ToastProvider } from './components/ToastProvider';

function App() {
  useEffect(() => {
    // Apply dark mode to the entire app
    document.body.classList.add('dark-mode');
  }, []);

  return (
    <ToastProvider>
      <div className="App" id="app">
        <header>
          <h1>Pokémon Player Statistics</h1>
          <p>Track and analyze your Pokémon battles performance</p>
          <div className="welcome-message">
            <p>Welcome to the Pokémon Player Statistics Tracker!</p>
            <p>Enter a player name above to get started.</p>
          </div>
        </header>
        <PlayerStats />
        <footer className="app-footer">
          <p>Pokémon Player Statistics Tracker &copy; 2025</p>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;