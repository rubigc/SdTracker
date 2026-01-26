import { useState } from 'react';
import { ParserControlPanel } from '../components/parser/ParserControlPanel';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';

export function ParserDashboard() {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Parser Dashboard</h1>
        <p className="text-gray-400">
          Manage the Pokemon Showdown replay parser and backend, monitor their status
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Parser Control</CardTitle>
        </CardHeader>
        <CardContent>
          <ParserControlPanel />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Setup Steps</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowInstructions((prev) => !prev)}
            >
              {showInstructions ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showInstructions && (
          <CardContent className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">1. Start the API Server</strong> - 
              Click "Start" to run the API server on port 3001
            </p>
            <p>
              <strong className="text-white">2. Enter your Pokemon Showdown username</strong> - 
              This is the username you use on Pokemon Showdown
            </p>
            <p>
              <strong className="text-white">3. Click "Start Parser"</strong> - 
              This will start the parser process on port 8098
            </p>
            <p>
              <strong className="text-white">4. Configure Pokemon Showdown</strong> - 
              Set the replay URL to send to http://localhost:8098/receive-logs
            </p>
            <p>
              <strong className="text-white">5. Upload manually (optional)</strong> - 
              Use the URL, file upload, or paste HTML tabs in Parser Control
            </p>
            <p>
              <strong className="text-white">6. View statistics</strong> - 
              Navigate to the Statistics Dashboard to view your game statistics
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
