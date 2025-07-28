const express = require('express');
const cors = require('cors');
const { Client } = require('ssh2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

// Store logs for the frontend
let serverLogs = [];

// SSH Configuration (hardcoded except password)
const sshConfig = {
  host: '20.185.83.16',
  username: 'llama',
  port: 22
};

// Store password in memory (in production, consider using a more secure method)
let sshPassword = null;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Function to add log entry
function addLog(level, message, data = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  serverLogs.push(logEntry);
  
  // Keep only last 100 logs
  if (serverLogs.length > 100) {
    serverLogs = serverLogs.slice(-100);
  }
  
  console.log(`[${level.toUpperCase()}] ${message}`, data || '');
}

// Helper function to execute SSH command with timeout and logging
function executeSSHCommand(command, timeout = 30000) {
  return new Promise((resolve, reject) => {
    if (!sshPassword) {
      reject(new Error('SSH password not configured. Please set password first.'));
      return;
    }

    const conn = new Client();
    let timeoutId;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      conn.end();
    };
    
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);
    
    conn.on('ready', () => {
      addLog('info', `Executing SSH command: ${command}`);
      conn.exec(command, (err, stream) => {
        if (err) {
          cleanup();
          reject(err);
          return;
        }
        
        let data = '';
        let error = '';
        
        stream.on('close', (code, signal) => {
          cleanup();
          addLog('info', `Command completed with code: ${code}`);
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}: ${error}`));
          } else {
            resolve(data.trim());
          }
        }).on('data', (chunk) => {
          const chunkStr = chunk.toString();
          data += chunkStr;
          addLog('output', `Command output: ${chunkStr}`);
        }).stderr.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          error += chunkStr;
          addLog('error', `Command error: ${chunkStr}`);
        });
      });
    }).on('error', (err) => {
      cleanup();
      addLog('error', `SSH connection error: ${err.message}`);
      reject(err);
    }).connect({
      ...sshConfig,
      password: sshPassword
    });
  });
}

// Helper function to execute interactive command (like ollama run)
function executeInteractiveCommand(command, input = '', timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (!sshPassword) {
      reject(new Error('SSH password not configured. Please set password first.'));
      return;
    }

    const conn = new Client();
    let timeoutId;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      conn.end();
    };
    
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Interactive command timed out after ${timeout}ms`));
    }, timeout);
    
    conn.on('ready', () => {
      addLog('info', `Executing interactive command: ${command}`);
      conn.shell((err, stream) => {
        if (err) {
          cleanup();
          reject(err);
          return;
        }
        
        let data = '';
        let isComplete = false;
        
        stream.on('close', () => {
          cleanup();
          if (!isComplete) {
            addLog('info', `Interactive command completed`);
            resolve(data.trim());
          }
        }).on('data', (chunk) => {
          const chunkStr = chunk.toString();
          data += chunkStr;
          addLog('output', `Interactive output: ${chunkStr}`);
          
          // If we see a prompt or specific output, we can consider it complete
          if (chunkStr.includes('>>>') || chunkStr.includes('$') || chunkStr.includes('>')) {
            isComplete = true;
            cleanup();
            resolve(data.trim());
          }
        });
        
        // Send the command
        stream.write(command + '\n');
        
        // If there's input to send, send it after a short delay
        if (input) {
          setTimeout(() => {
            stream.write(input + '\n');
          }, 1000);
        }
      });
    }).on('error', (err) => {
      cleanup();
      addLog('error', `SSH connection error: ${err.message}`);
      reject(err);
    }).connect({
      ...sshConfig,
      password: sshPassword
    });
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Set SSH password
app.post('/api/set-password', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    sshPassword = password;
    addLog('info', `SSH password set for ${sshConfig.username}@${sshConfig.host}`);
    
    res.json({
      success: true,
      message: 'SSH password set successfully'
    });
  } catch (error) {
    addLog('error', `Error setting password: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current SSH configuration status (without exposing password)
app.get('/api/ssh-status', (req, res) => {
  res.json({
    success: true,
    configured: sshPassword !== null,
    host: sshConfig.host,
    username: sshConfig.username,
    port: sshConfig.port
  });
});

// Clear SSH password
app.post('/api/clear-password', (req, res) => {
  sshPassword = null;
  addLog('info', 'SSH password cleared');
  res.json({
    success: true,
    message: 'SSH password cleared successfully'
  });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    if (!sshPassword) {
      return res.status(400).json({
        success: false,
        error: 'SSH password not configured. Please set password first.'
      });
    }

    const result = await executeSSHCommand('ollama ls');
    
    // Parse the ollama ls output to extract model details
    const modelLines = result.split('\n').filter(line => line.trim());
    
    // Skip header line and parse model information
    const models = modelLines
      .slice(1) // Skip header line
      .map(line => {
        const parts = line.split(/\s+/).filter(part => part.trim());
        if (parts.length >= 3) {
          return {
            name: parts[0],
            tag: parts[1],
            size: parts[2],
            id: parts[3] || '',
            modified: parts[4] || ''
          };
        }
        return null;
      })
      .filter(model => model !== null)
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    
    addLog('info', `Fetched ${models.length} models`);
    
    res.json({ 
      success: true, 
      data: result,
      models: models
    });
  } catch (error) {
    addLog('error', `Error fetching models: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Run a specific model
app.post('/api/run-model', async (req, res) => {
  try {
    if (!sshPassword) {
      return res.status(400).json({
        success: false,
        error: 'SSH password not configured. Please set password first.'
      });
    }

    const { modelName, prompt = "Hello, how are you?" } = req.body;
    
    if (!modelName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Model name is required' 
      });
    }
    
    addLog('info', `Running model: ${modelName} with prompt: "${prompt}"`);
    
    // Escape the prompt for shell safety
    const escapedPrompt = prompt.replace(/'/g, "'\"'\"'");
    
    // Use echo to provide input and pipe to ollama run to avoid interactive mode
    const command = `echo '${escapedPrompt}' | ollama run ${modelName}`;
    const result = await executeSSHCommand(command, 30000); // 30 second timeout
    
    res.json({ 
      success: true, 
      data: result,
      modelName,
      prompt
    });
  } catch (error) {
    console.error('Error running model:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test SSH connection
app.post('/api/test-connection', async (req, res) => {
  try {
    if (!sshPassword) {
      return res.status(400).json({
        success: false,
        error: 'SSH password not configured. Please set password first.'
      });
    }

    addLog('info', 'Testing SSH connection');
    const result = await executeSSHCommand('echo "SSH connection successful"');
    addLog('success', 'SSH connection test successful');
    res.json({ 
      success: true, 
      message: 'SSH connection successful',
      data: result 
    });
  } catch (error) {
    addLog('error', `SSH connection test failed: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get server logs
app.get('/api/logs', (req, res) => {
  res.json({ 
    success: true, 
    logs: serverLogs 
  });
});

// Clear server logs
app.post('/api/logs/clear', (req, res) => {
  serverLogs = [];
  addLog('info', 'Logs cleared');
  res.json({ 
    success: true, 
    message: 'Logs cleared' 
  });
});

// Serve React app for any non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SSH configured for: ${sshConfig.username}@${sshConfig.host}:${sshConfig.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('SSH password must be set via API before use');
}); 