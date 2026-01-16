import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatsDashboard } from './pages/StatsDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { BarChart3, Settings } from 'lucide-react';
import { getPokemonSpriteUrl } from './utils/pokemonSprites';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type Page = 'stats' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('stats');
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="sidebar w-64 min-h-screen p-4 flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <img
                  src={getPokemonSpriteUrl('lunala')}
                  alt="Lunala"
                  className="w-12 h-12 pokemon-sprite animate-float"
                />
                <h1 className="text-3xl font-bold text-lunala-primary">
                  SdTracker
                </h1>
              </div>
              <p className="text-sm text-gray-400 mt-1 ml-15">Pokemon Showdown Tracker</p>
            </div>
            
            <nav className="space-y-2 flex-1">
              <button
                onClick={() => setCurrentPage('stats')}
                className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  currentPage === 'stats'
                    ? 'active text-white'
                    : 'text-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Statistics</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('settings')}
                className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  currentPage === 'settings'
                    ? 'active text-white'
                    : 'text-gray-300'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
            
            <div className="mt-auto pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                © 2024 SdTracker
              </p>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            {currentPage === 'stats' && <StatsDashboard />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
