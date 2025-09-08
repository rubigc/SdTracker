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
          <p className="app-subtitle">Track and analyze your Pokémon battles performance</p>
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