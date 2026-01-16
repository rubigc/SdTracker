import { useState } from 'react';
import { ParserDashboard } from './ParserDashboard';
import { ApiExplorer } from './ApiExplorer';
import { BackendControlPanel } from '../components/backend/BackendControlPanel';
import { Database, Code2, Server } from 'lucide-react';

type SettingsTab = 'parser' | 'api' | 'backend';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('parser');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings & Admin Panel</h1>
        <p className="text-gray-400">
          Manage parser, API, and backend services
        </p>
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
      </div>
    </div>
  );
}