#!/bin/bash

echo "Installing new dependencies for OllamaSSHUI..."
echo "This will add express-session for user session management"

# Install the new dependency
npm install express-session

echo "Dependencies installed successfully!"
echo ""
echo "IMPORTANT: For production deployment, set a strong SESSION_SECRET environment variable:"
echo "export SESSION_SECRET=your-very-secure-session-secret-key"
echo ""
echo "Or add it to your .env file:"
echo "SESSION_SECRET=your-very-secure-session-secret-key"
echo ""
echo "The application now supports user session isolation - each user will have their own SSH password storage." 