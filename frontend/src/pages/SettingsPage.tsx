import { useState } from 'react';
import { ParserDashboard } from './ParserDashboard';
import { ApiExplorer } from './ApiExplorer';
import { BackendControlPanel } from '../components/backend/BackendControlPanel';
import { Button } from '../components/common/Button';
import { PokemonThemeSelector } from '../components/theme/PokemonThemeSelector';
import { useAutoStartEnabled } from '../hooks/useAutoStartEnabled';
import { setAutoStartEnabled } from '../utils/autostart';
import { Database, Code2, Server, Palette } from 'lucide-react';

type SettingsTab = 'parser' | 'api' | 'backend' | 'theme';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('parser');
  const autoStartEnabled = useAutoStartEnabled();
  const handleToggleAutoStart = () => {
    setAutoStartEnabled(!autoStartEnabled);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings & Admin Panel</h1>
        <p className="text-gray-400">
          Manage parser, API, and backend services
        </p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-sm text-gray-400">
            Auto-start: <span className="text-white">{autoStartEnabled ? 'Enabled' : 'Disabled'}</span>
          </p>
          <Button
            onClick={handleToggleAutoStart}
            size="sm"
            variant="secondary"
          >
            {autoStartEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('parser')}
          className={`tab-button ${activeTab === 'parser' ? 'active' : ''}`}
        >
          <Database className="w-4 h-4 mr-2 inline" />
          Parser
        </button>
        
        <button
          onClick={() => setActiveTab('api')}
          className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
        >
          <Code2 className="w-4 h-4 mr-2 inline" />
          API Explorer
        </button>
        
        <button
          onClick={() => setActiveTab('backend')}
          className={`tab-button ${activeTab === 'backend' ? 'active' : ''}`}
        >
          <Server className="w-4 h-4 mr-2 inline" />
          Backend Control
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`tab-button ${activeTab === 'theme' ? 'active' : ''}`}
        >
          <Palette className="w-4 h-4 mr-2 inline" />
          Theme
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === 'parser' && <ParserDashboard />}
        {activeTab === 'api' && <ApiExplorer />}
        {activeTab === 'backend' && (
          <div className="card-modern p-6">
            <BackendControlPanel />
          </div>
        )}
        {activeTab === 'theme' && (
          <div className="card-modern p-6">
            <PokemonThemeSelector />
          </div>
        )}
      </div>
    </div>
  );
}
