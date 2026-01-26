import { useEffect, useRef, useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StatusIndicator } from '../common/StatusIndicator';
import { useParser } from '../../hooks/useParser';
import { useAutoStartEnabled } from '../../hooks/useAutoStartEnabled';
import { getStoredUsername, setStoredUsername } from '../../utils/autostart';
import { Upload, FileText, Link } from 'lucide-react';

type InputMethod = 'url' | 'file' | 'paste';

export function ParserControlPanel() {
  const [username, setUsername] = useState('');
  const [inputMethod, setInputMethod] = useState<InputMethod>('url');
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { status, isLoading, startParser, stopParser, isStarting, isStopping } = useParser();
  const autoStartEnabled = useAutoStartEnabled();
  
  useEffect(() => {
    const savedUsername = getStoredUsername();
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleStart = () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      setStoredUsername(trimmedUsername);
      startParser(trimmedUsername);
    }
  };
  
  const handleStop = () => {
    stopParser();
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    
    setUploadStatus('uploading');
    setUploadError('');
    
    try {
      const response = await fetch('http://localhost:8098/receive-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message ? `Failed to process URL: ${message}` : 'Failed to process URL');
      }

      setUploadStatus('success');
      setUrl('');
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePasteSubmit = async () => {
    if (!htmlContent.trim()) return;
    
    setUploadStatus('uploading');
    setUploadError('');
    
    try {
      const response = await fetch('http://localhost:8098/paste-replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent.trim() }),
      });
      
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message ? `Failed to process HTML: ${message}` : 'Failed to process HTML');
      }

      setUploadStatus('success');
      setHtmlContent('');
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setUploadStatus('uploading');
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('replay', selectedFile);
      
      const response = await fetch('http://localhost:8098/upload-replay', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message ? `Failed to upload file: ${message}` : 'Failed to upload file');
      }

      setUploadStatus('success');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  const isRunning = status?.running ?? false;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Parser Control</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <StatusIndicator 
            status={isLoading ? 'loading' : (isRunning ? 'running' : 'stopped')} 
          />
        </div>
      </div>
      
      {/* Input Method Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setInputMethod('url')}
          className={`px-4 py-2 transition-colors ${
            inputMethod === 'url' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Link className="w-4 h-4 inline mr-2" />
          URL
        </button>
        <button
          onClick={() => setInputMethod('file')}
          className={`px-4 py-2 transition-colors ${
            inputMethod === 'file' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setInputMethod('paste')}
          className={`px-4 py-2 transition-colors ${
            inputMethod === 'paste' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Paste HTML
        </button>
      </div>

      {/* Input Method Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {inputMethod === 'url' && (
          <div className="space-y-4">
            <Input
              label="Replay URL"
              placeholder="https://replay.pokemonshowdown.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={uploadStatus === 'uploading'}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={!url.trim() || uploadStatus === 'uploading'}
              variant="success"
              className="w-full"
            >
              {uploadStatus === 'uploading' ? 'Processing...' : 'Process URL'}
            </Button>
          </div>
        )}

        {inputMethod === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Select HTML Replay File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html"
                onChange={handleFileSelect}
                disabled={uploadStatus === 'uploading'}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white file:mr-4"
              />
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
              variant="success"
              className="w-full"
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        )}

        {inputMethod === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Paste Replay HTML
              </label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                disabled={uploadStatus === 'uploading'}
                placeholder="Paste HTML content of your replay here..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white min-h-[300px] resize-y"
              />
            </div>
            <Button
              onClick={handlePasteSubmit}
              disabled={!htmlContent.trim() || uploadStatus === 'uploading'}
              variant="success"
              className="w-full"
            >
              {uploadStatus === 'uploading' ? 'Processing...' : 'Process HTML'}
            </Button>
          </div>
        )}

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-4 text-green-300">
            ✓ Replay processed successfully!
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-300">
            ✗ Error: {uploadError}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Pokemon Showdown Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isRunning}
        />
        
        <div className="flex items-end gap-2">
          {isRunning ? (
            <Button
              onClick={handleStop}
              disabled={isStopping}
              className="w-full"
              variant="danger"
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </Button>
          ) : !autoStartEnabled || !username.trim() ? (
            <Button
              onClick={handleStart}
              disabled={!username.trim() || isStarting}
              className="w-full"
              variant="success"
            >
              {isStarting ? 'Starting...' : 'Start'}
            </Button>
          ) : null}
        </div>
      </div>
      
      {autoStartEnabled && !isRunning && username.trim() && (
        <p className="text-sm text-gray-400">
          Auto-start enabled. The parser will start when the app launches.
        </p>
      )}
      
      {status && showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Username</p>
            <p className="text-lg font-semibold text-white">
              {status.username || 'Not set'}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Port</p>
            <p className="text-lg font-semibold text-white">
              {status.port}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-lg font-semibold text-white">
              {formatUptime(status.uptime)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Logs Received</p>
            <p className="text-lg font-semibold text-white">
              {status.logs_received}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
