import { ParserControlPanel } from '../components/parser/ParserControlPanel';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';

export function ParserDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Parser Dashboard</h1>
        <p className="text-gray-400">
          Manage the Pokemon Showdown replay parser and monitor its status
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
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-300">
          <p>
            <strong className="text-white">1. Enter your Pokemon Showdown username</strong> - 
            This is the username you use on Pokemon Showdown
          </p>
          <p>
            <strong className="text-white">2. Click "Start Parser"</strong> - 
            This will start the parser process on port 8098
          </p>
          <p>
            <strong className="text-white">3. Configure Pokemon Showdown</strong> - 
            Set the replay URL to send to http://localhost:8098/receive-logs
          </p>
          <p>
            <strong className="text-white">4. Monitor the parser</strong> - 
            Watch the status and logs to ensure it's working correctly
          </p>
          <p>
            <strong className="text-white">5. View statistics</strong> - 
            Navigate to the Statistics Dashboard to view your game statistics
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
