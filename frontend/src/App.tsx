import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParserDashboard } from './pages/ParserDashboard';
import { StatsDashboard } from './pages/StatsDashboard';
import { ApiExplorer } from './pages/ApiExplorer';
import { BackendControlPanel } from './components/backend/BackendControlPanel';
import { Settings, Database, BarChart3, Code2, Server } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type Page = 'parser' | 'stats' | 'api' | 'backend';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('parser');
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 min-h-screen p-4 border-r border-gray-700">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-pokemon-red">SdTracker</h1>
              <p className="text-sm text-gray-400 mt-1">Pokemon Showdown Tracker</p>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentPage('parser')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'parser'
                    ? 'bg-pokemon-red text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Parser Dashboard</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('stats')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'stats'
                    ? 'bg-pokemon-red text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Statistics</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('api')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'api'
                    ? 'bg-pokemon-red text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Code2 className="w-5 h-5" />
                <span>API Explorer</span>
              </button>

              <button
                onClick={() => setCurrentPage('backend')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'backend'
                    ? 'bg-pokemon-red text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Server className="w-5 h-5" />
                <span>Backend Control</span>
              </button>
            </nav>
            
            <div className="absolute bottom-4 left-4 right-4">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 p-8">
            {currentPage === 'parser' && <ParserDashboard />}
            {currentPage === 'stats' && <StatsDashboard />}
            {currentPage === 'api' && <ApiExplorer />}
            {currentPage === 'backend' && <BackendControlPanel />}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
