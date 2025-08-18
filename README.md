# Ollama SSH UI

A modern web interface for managing Ollama models via SSH connection. This application provides a user-friendly way to interact with Ollama servers running on remote machines through SSH.

## Features

- 🔐 **Secure SSH Connection**: Connect to remote Ollama servers via SSH
- 📋 **Model Management**: List and view available Ollama models
- 🚀 **Model Execution**: Run models with custom prompts
- 📊 **Real-time Logs**: Monitor SSH communication and model execution
- 🎨 **Modern UI**: Clean, responsive interface built with React
- 🐳 **Docker Support**: Easy deployment with Docker and Docker Compose

## Screenshots

*Screenshots will be added here*

## Prerequisites

- Node.js 18+ (for development)
- Docker (for production deployment)
- SSH access to a server running Ollama

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/WojtekSJ/SshUi.git
   cd SshUi
   ```

2. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`
   - Set your SSH password in the interface
   - Test the connection and start using Ollama models

### Manual Setup (Development)

1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Start the development server**
   ```bash
   # Terminal 1: Start backend server
   npm start
   
   # Terminal 2: Start React development server
   cd client && npm start
   ```

3. **Access the application**
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

## Configuration

### SSH Settings

The application uses the following hardcoded SSH settings:
- **Host**: `20.185.83.16`
- **Username**: `llama`
- **Port**: `22`

To change these settings, modify the `sshConfig` object in `server/index.js`:

```javascript
const sshConfig = {
  host: 'your-server-ip',
  username: 'your-username',
  port: 22
};
```

### Environment Variables

Create a `.env` file in the root directory for environment-specific settings:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-very-secure-session-secret-key
```

## Usage

1. **Set SSH Password**: Click "Set Password" and enter your SSH password
2. **Test Connection**: Click "Test Connection" to verify SSH connectivity
3. **Fetch Models**: Click "Fetch Models" to retrieve available Ollama models
4. **Run Models**: Select a model and enter a prompt to execute it
5. **View Logs**: Monitor real-time communication logs

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/set-password` - Set SSH password
- `GET /api/ssh-status` - Get SSH configuration status
- `POST /api/clear-password` - Clear stored password
- `GET /api/models` - Fetch available Ollama models
- `POST /api/run-model` - Execute a model with a prompt
- `POST /api/test-connection` - Test SSH connection
- `GET /api/logs` - Get communication logs
- `POST /api/logs/clear` - Clear logs

## Security Considerations

- **User Session Isolation**: Each user has their own session and password storage
- SSH passwords are stored in memory per user session (not persisted)
- Passwords are cleared when the server restarts or user session expires
- Session cookies expire after 24 hours of inactivity
- Consider using SSH keys for production deployments
- The application runs in production mode when deployed with Docker
- Set a strong `SESSION_SECRET` environment variable in production

## Development

### Project Structure

```
OllamaSSHUI/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.css      # Styles
│   │   └── index.js       # React entry point
│   └── package.json
├── server/                 # Express.js backend
│   └── index.js           # Main server file
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── package.json
```

### Building for Production

```bash
# Build the React app
cd client && npm run build

# Start production server
npm start
```

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build manually
docker build -t ollama-ssh-ui .
docker run -d -p 5000:5000 ollama-ssh-ui
```

### Production Considerations

- Use environment variables for sensitive configuration
- Consider using a reverse proxy (nginx) for production
- Implement proper SSL/TLS encryption
- Use SSH keys instead of passwords for better security
- Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) - The AI model server
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [SSH2](https://github.com/mscdex/ssh2) - SSH client library

## Support

### Session Issues
If you get "SSH password not configured" errors:

1. **Check session debugging**: Visit `/api/debug-session` to see session information
2. **Clear browser cookies**: Session cookies might be corrupted
3. **Check CORS settings**: Ensure your domain is allowed in CORS configuration
4. **Verify HTTPS**: If using HTTPS, ensure `secure: true` in session config
5. **Check server logs**: Look for session-related console output

### Common Issues

- **Password not persisting**: Session cookies might be blocked by browser
- **Multiple users sharing password**: Ensure session management is working
- **Connection timeouts**: Check SSH server accessibility and firewall settings

If you encounter any other issues or have questions, please open an issue on GitHub or contact the maintainer.

## 🔧 **Troubleshooting Steps**

I've made several fixes to address the session issue. Here's what to do:

### **1. Deploy the Updated Code**
```bash
docker-compose up --build
```

### **2. Test Session Debugging**
Visit your app and go to: `http://your-domain/api/debug-session`

This will show you:
- Session ID
- User ID  
- Whether password is stored
- Total number of users

### **3. Check Browser Console**
Open browser developer tools and look for:
- CORS errors
- Cookie-related errors
- Network request failures

### **4. Clear Browser Data**
Try clearing cookies and cache for your domain, then:
1. Set the SSH password again
2. Check if it persists

### **5. Check Server Logs**
Look for these debug messages in your server logs:
```
Setting password for user: [session-id]
Session ID: [session-id]
Checking SSH status for user: [session-id]
```

### **Most Likely Causes:**

1. **Cookie Security**: The main fix was changing `secure: true` to `secure: false` for HTTP
2. **CORS Issues**: Updated CORS to allow all origins for debugging
3. **Session Not Persisting**: Browser might be blocking cookies

### **Quick Test:**
1. Open your app in a new incognito/private window
2. Set the SSH password
3. Check `/api/debug-session` to see if the session is working
4. Try to fetch models or test connection

If you're still having issues, please share:
1. The output from `/api/debug-session`
2. Any errors in browser console
3. Server logs when you try to set the password

The main fix was the cookie security setting - since you're likely running on HTTP (not HTTPS), the secure cookies weren't being sent by the browser.