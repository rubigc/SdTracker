import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ExternalLink, Play } from 'lucide-react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params?: Record<string, string>;
}

const endpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/winrates/:name',
    description: 'Get winrate statistics for a player',
    params: { name: 'Player name' },
  },
  {
    method: 'GET',
    path: '/api/leads/:name',
    description: 'Get lead Pokemon statistics for a player',
    params: { name: 'Player name' },
  },
  {
    method: 'GET',
    path: '/api/tera/:name',
    description: 'Get Terastallization type statistics for a player',
    params: { name: 'Player name' },
  },
  {
    method: 'GET',
    path: '/api/history/:name',
    description: 'Get game history for a player',
    params: { name: 'Player name' },
  },
];

export function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const handleTest = async () => {
    if (!selectedEndpoint || !playerName.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const url = `http://localhost:3001${selectedEndpoint.path.replace(':name', playerName.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenInBrowser = () => {
    if (!selectedEndpoint || !playerName.trim()) return;
    const url = `http://localhost:3001${selectedEndpoint.path.replace(':name', playerName.trim())}`;
    window.open(url, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Explorer</h1>
        <p className="text-gray-400">
          Test and explore the backend REST API endpoints
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {endpoints.map((endpoint, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedEndpoint === endpoint
                      ? 'border-pokemon-red bg-gray-700'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-white font-mono text-sm">
                      {endpoint.path}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {endpoint.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Endpoint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEndpoint ? (
              <>
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    {selectedEndpoint.method} {selectedEndpoint.path}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {selectedEndpoint.description}
                  </p>
                  
                  {selectedEndpoint.params && (
                    <div className="space-y-2">
                      {Object.entries(selectedEndpoint.params).map(([key, description]) => (
                        <Input
                          key={key}
                          label={`${key} (${description})`}
                          placeholder={`Enter ${key}`}
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleTest}
                    disabled={loading || !playerName.trim()}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {loading ? 'Loading...' : 'Test'}
                  </Button>
                  <Button
                    onClick={handleOpenInBrowser}
                    disabled={!playerName.trim()}
                    variant="secondary"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </div>
                
                {response && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Response:</p>
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                      {response}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400">
                Select an endpoint from the list to test it
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
