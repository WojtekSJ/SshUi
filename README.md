# 🤖 Ollama SSH UI

A modern React web application that connects to an Ollama server via SSH and provides a user-friendly interface to manage and run Ollama models.

## Features

- 🔐 **SSH Connection**: Secure connection to remote Ollama server
- 📋 **Model Listing**: View all available models on the server
- 🚀 **Model Execution**: Run any model with a simple click
- 🎨 **Modern UI**: Beautiful, responsive interface with real-time status updates
- ⚡ **Real-time Feedback**: Live connection status and command output

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Access to the SSH server with Ollama installed

## Installation

1. **Clone or download this project**

2. **Install dependencies for both server and client:**
   ```bash
   npm run install-all
   ```

   Or install them separately:
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

## Configuration

The SSH connection is configured in `server/index.js`:

```javascript
const sshConfig = {
  host: '20.185.83.16',
  username: 'llama',
  password: 'Capadmin@024',
  port: 22
};
```

You can modify these settings to match your server configuration.

## Running the Application

### Development Mode (Recommended)

Run both server and client simultaneously:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

### Running Separately

**Backend Server:**
```bash
npm run server
```

**Frontend Client:**
```bash
npm run client
```

## Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Test Connection**: The app will automatically test the SSH connection on load. You can also manually test it using the "Test Connection" button.

3. **Fetch Models**: Click "Fetch Models" to retrieve all available models from the Ollama server.

4. **Run Models**: 
   - Select a model from the list, or
   - Enter a custom model name in the input field
   - Click "Run Model" to execute the model

5. **View Output**: The model output will be displayed in the output section.

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/health` - Server health check
- `GET /api/test-connection` - Test SSH connection
- `GET /api/models` - Get list of available models
- `POST /api/run-model` - Run a specific model

## Project Structure

```
OllamaSSHUI/
├── server/
│   └── index.js          # Express server with SSH functionality
├── client/
│   ├── public/
│   │   └── index.html    # Main HTML file
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Styles
│   └── package.json      # Client dependencies
├── package.json          # Server dependencies and scripts
└── README.md            # This file
```

## Troubleshooting

### Connection Issues
- Ensure the SSH server is accessible from your machine
- Verify the SSH credentials are correct
- Check if the server allows password authentication
- Ensure port 22 is open on the server

### Model Issues
- Make sure Ollama is installed and running on the server
- Verify the model names are correct
- Check server resources (some models require significant RAM/GPU)

### Development Issues
- Make sure all dependencies are installed
- Check that ports 3000 and 5000 are available
- Ensure Node.js version is 14 or higher

## Security Notes

- The SSH password is currently hardcoded in the server configuration
- For production use, consider using SSH keys instead of passwords
- Store sensitive configuration in environment variables
- Implement proper authentication for the web interface

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own purposes. 