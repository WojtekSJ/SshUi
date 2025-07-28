import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Play, List, Wifi, WifiOff, Loader, Terminal, Trash2, Key } from 'lucide-react';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [prompt, setPrompt] = useState('Hello, how are you?');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [sshStatus, setSshStatus] = useState({
    configured: false,
    host: '20.185.83.16',
    username: 'llama',
    port: 22
  });

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

  // Check SSH status on component mount
  useEffect(() => {
    checkSshStatus();
    fetchLogs();
  }, []);

  // Fetch logs periodically
  useEffect(() => {
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSshStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ssh-status`);
      if (response.data.success) {
        setSshStatus(response.data);
        if (response.data.configured) {
          setConnectionStatus('disconnected'); // Will be tested when user tries to connect
        }
      }
    } catch (err) {
      console.error('Error checking SSH status:', err);
    }
  };

  const setSSHPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/set-password`, { password });
      if (response.data.success) {
        setError('');
        setShowPasswordInput(false);
        setPassword('');
        await checkSshStatus();
        // Test connection after setting password
        await testConnection();
      }
    } catch (err) {
      setError('Failed to set SSH password: ' + (err.response?.data?.error || err.message));
      console.error('Error setting password:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPassword = async () => {
    try {
      await axios.post(`${API_BASE_URL}/clear-password`);
      setSshStatus(prev => ({ ...prev, configured: false }));
      setConnectionStatus('disconnected');
      setError('');
    } catch (err) {
      console.error('Error clearing password:', err);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/test-connection`);
      if (response.data.success) {
        setConnectionStatus('connected');
        setError('');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setError('Failed to connect to SSH server: ' + (err.response?.data?.error || err.message));
      console.error('Connection test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/models`);
      if (response.data.success) {
        // Use the parsed models from the server
        const modelDetails = response.data.models || [];
        setModels(modelDetails);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch models: ' + (err.response?.data?.error || err.message));
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

  const runModel = async (modelName) => {
    if (!modelName) {
      setError('Please select or enter a model name');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await axios.post(`${API_BASE_URL}/run-model`, {
        modelName: modelName,
        prompt: prompt
      });

      if (response.data.success) {
        setOutput(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to run model: ' + (err.response?.data?.error || err.message));
      console.error('Error running model:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`);
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const clearLogs = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logs/clear`);
      setLogs([]);
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model.name);
    setCustomModel(model.name);
  };

  const handleRunModel = () => {
    const modelToRun = customModel || selectedModel;
    runModel(modelToRun);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 Ollama SSH UI</h1>
        <p>Connect to your Ollama server via SSH and manage models</p>
      </div>

      {/* SSH Connection Section */}
      <div className="card">
        <div className="flex gap-4 mb-4">
          <h2>🔐 SSH Connection</h2>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowPasswordInput(!showPasswordInput)}
          >
            <Key />
            {showPasswordInput ? 'Hide Password Input' : 'Set Password'}
          </button>
        </div>

        <div className="connection-status">
          <div className="flex gap-4 items-center">
            <div className={`status-indicator ${connectionStatus === 'connected' ? 'connected' : ''}`}></div>
            <span>
              {connectionStatus === 'connected' ? 'Connected to SSH Server' : 'Disconnected from SSH Server'}
            </span>
            <button 
              className="btn btn-secondary" 
              onClick={testConnection}
              disabled={loading || !sshStatus.configured}
            >
              {loading ? <Loader className="loading" /> : <Wifi />}
              Test Connection
            </button>
            {sshStatus.configured && (
              <button 
                className="btn btn-secondary" 
                onClick={clearPassword}
              >
                <Key />
                Clear Password
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Server: {sshStatus.username}@{sshStatus.host}:{sshStatus.port}
          </div>
        </div>

        {showPasswordInput && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="mb-4">SSH Password</h3>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                className="input mt-1"
                placeholder="Enter SSH password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <button 
                className="btn" 
                onClick={setSSHPassword}
                disabled={loading || !password}
              >
                {loading ? <Loader className="loading" /> : <Key />}
                Set Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="status error">
          {error}
        </div>
      )}

      {/* Models Section */}
      <div className="card">
        <h2>📋 Available Models</h2>
        <p>Click the button below to fetch available models from the server</p>
        
        <div className="flex gap-4 mt-4">
          <button 
            className="btn" 
            onClick={fetchModels}
            disabled={loading || connectionStatus !== 'connected'}
          >
            {loading ? <Loader className="loading" /> : <List />}
            Fetch Models
          </button>
        </div>

        {models.length > 0 && (
          <div className="grid mt-4">
            {models.map((model, index) => (
              <div 
                key={index}
                className={`model-item ${selectedModel === model.name ? 'selected' : ''}`}
                onClick={() => handleModelSelect(model)}
              >
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '16px' }}>{model.name}</strong>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginLeft: '8px',
                    backgroundColor: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {model.tag}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Size: {model.size}</div>
                  {model.id && <div>ID: {model.id.substring(0, 8)}...</div>}
                  {model.modified && <div>Modified: {model.modified}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Model Section */}
      <div className="card">
        <h2>🚀 Run Model</h2>
        <p>Select a model from the list above or enter a custom model name. Enter a prompt and click Run Model to execute the ollama run command.</p>
        
        <div className="flex-column gap-4 mt-4">
          <div>
            <label htmlFor="modelInput">Model Name:</label>
            <input
              id="modelInput"
              type="text"
              className="input mt-4"
              placeholder="Enter model name (e.g., llama2, codellama)"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="promptInput">Prompt:</label>
            <textarea
              id="promptInput"
              className="input mt-4"
              placeholder="Enter your prompt for the model"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>
          
          <button 
            className="btn" 
            onClick={handleRunModel}
            disabled={loading || connectionStatus !== 'connected' || (!customModel && !selectedModel)}
          >
            {loading ? <Loader className="loading" /> : <Play />}
            Run Model
          </button>
        </div>

        {/* Output Display */}
        {output && (
          <div className="mt-4">
            <h3>Output:</h3>
            <div className="output">
              {output}
            </div>
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="card">
        <div className="flex gap-4 mb-4">
          <h2>📋 Communication Logs</h2>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowLogs(!showLogs)}
          >
            <Terminal />
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearLogs}
          >
            <Trash2 />
            Clear Logs
          </button>
        </div>
        
        {showLogs && (
          <div className="output" style={{ maxHeight: '300px', fontSize: '12px' }}>
            {logs.length === 0 ? (
              <p>No logs available</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                  <div style={{ color: '#666', fontSize: '10px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()} [{log.level.toUpperCase()}]
                  </div>
                  <div style={{ 
                    color: log.level === 'error' ? '#dc3545' : 
                           log.level === 'success' ? '#28a745' : 
                           log.level === 'output' ? '#007bff' : '#333'
                  }}>
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="card text-center">
        <h3>🔗 Server Information</h3>
        <p><strong>Host:</strong> {sshStatus.host}</p>
        <p><strong>User:</strong> {sshStatus.username}</p>
        <p><strong>Port:</strong> {sshStatus.port}</p>
        <p><strong>Status:</strong> {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}</p>
      </div>
    </div>
  );
}

export default App; 