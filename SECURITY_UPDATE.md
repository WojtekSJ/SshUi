# Security Update: User Session Isolation

## Overview

This update addresses the security issue where multiple users could share the same SSH password. Now each user has their own isolated session and password storage.

## What Changed

### Before
- Single global password storage (`let sshPassword = null`)
- All users shared the same SSH password
- Once one user set the password, others could use it

### After
- User-specific password storage using sessions
- Each user has their own isolated password
- Passwords are stored per user session in memory
- Session cookies expire after 24 hours

## Installation

### For Development
```bash
npm install express-session
```

### For Production (Docker)
The Docker build will automatically install the new dependency.

## Configuration

### Environment Variables
Add to your `.env` file or environment:
```env
SESSION_SECRET=your-very-secure-session-secret-key
```

**Important**: Use a strong, random secret key in production. You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Security Benefits

1. **User Isolation**: Each user's SSH password is completely isolated
2. **Session Management**: Automatic session expiration (24 hours)
3. **No Password Sharing**: Users cannot access each other's passwords
4. **Memory Cleanup**: Passwords are cleared when sessions expire

## Migration Notes

- Existing users will need to set their SSH password again
- Sessions are not persisted, so server restarts will clear all passwords
- The frontend automatically handles session cookies

## Testing

To test the isolation:
1. Open the app in two different browsers or incognito windows
2. Set different SSH passwords in each
3. Verify that each session maintains its own password
4. Test that operations work independently in each session

## Troubleshooting

### Session Issues
If users experience session problems:
1. Clear browser cookies
2. Check that `SESSION_SECRET` is set correctly
3. Verify CORS settings for your domain

### Password Not Working
If a user's password stops working:
1. Check if their session expired (24 hours)
2. Have them set the password again
3. Verify the SSH server is accessible

## Production Considerations

1. **Strong Session Secret**: Always use a strong, random session secret
2. **HTTPS**: Use HTTPS in production for secure cookie transmission
3. **Domain Configuration**: Ensure CORS is properly configured for your domain
4. **Monitoring**: Monitor session usage and SSH connection logs 