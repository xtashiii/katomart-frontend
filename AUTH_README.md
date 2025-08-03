# Authentication System

This document describes the authentication system implemented in the Katomart frontend application.

## Overview

The application uses a JWT-based authentication system with the following features:

- **Protected Routes**: Admin Panel, Scrappers, Cognitahz, and Backups require authentication
- **Public Routes**: Documentation is accessible without authentication
- **Modern Login Modal**: Appears when users try to access protected routes
- **Multi-language Support**: Login modal supports English, Spanish, and Portuguese
- **Token Management**: Automatic token refresh and storage
- **Mock API**: Includes mock API for testing purposes

## Test Credentials

For development and testing, use these credentials:

| Username | Password    |
|----------|-------------|
| admin    | password123 |
| user     | userpass    |
| test     | test123     |

## Authentication Flow

1. User clicks on any of the 4 main buttons (Admin Panel, Scrappers, Cognitahz, Backups)
2. System checks if user is authenticated
3. If not authenticated, a login modal appears
4. User enters credentials and submits
5. System validates credentials against the backend (or mock API)
6. On success, user receives JWT tokens and is redirected to the requested page
7. Tokens are stored in localStorage for subsequent requests

## API Endpoints

The system expects the following backend endpoints:

### Authentication Endpoints

- `POST /api/auth/login` - Login with username/password
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
  
  Response:
  ```json
  {
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com"
    }
  }
  ```

- `POST /api/auth/logout` - Logout (optional, used for cleanup)

- `GET /api/auth/verify` - Verify current token validity

- `GET /api/auth/user` - Get current user information

- `POST /api/auth/refresh` - Refresh expired token
  ```json
  {
    "refreshToken": "refresh-token-here"
  }
  ```

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production, update the URL to your actual backend API.

### Axios Configuration

The auth system uses Axios with automatic:
- Token injection in request headers
- Token refresh on 401 responses
- Error handling for network issues

## Components

### AuthProvider
- Context provider for authentication state
- Manages user data and login status
- Handles token persistence

### LoginModal
- Modern, responsive login form
- Multi-language support
- Loading states and error handling
- Form validation

### AppButton (Protected)
- Checks authentication before navigation
- Shows login modal if needed
- Supports both protected and public routes

## Usage

### Protecting Routes

By default, all main navigation buttons require authentication. To make a route public:

```tsx
<AppButton icon={faIcon} href="/path" requiresAuth={false}>
  Public Route
</AppButton>
```

### Using Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (isLoggedIn) {
    return <div>Welcome, {user?.username}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

### Manual Login/Logout

```tsx
import { login, logout } from '@/lib/auth';

// Login
try {
  const tokens = await login({ username: 'admin', password: 'password123' });
  // Handle success
} catch (error) {
  // Handle error
}

// Logout
await logout();
```

## Customization

### Styling

All styles are in `src/app/globals.css` under the "Login Modal Styles" section. The modal uses CSS custom properties for consistent theming.

### Languages

Add new languages by:
1. Adding translation files in `/messages/[locale].json`
2. Including the `auth` section with required translations
3. Updating the i18n configuration

### API Integration

Replace the mock API calls in `src/lib/auth.ts` with your actual backend integration. The mock system is automatically disabled in production builds.

## Security Considerations

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- HTTPS should be used in production
- Implement proper token expiration and refresh logic
- Validate all user inputs on the backend
- Use CORS configuration to restrict API access

## Development

The system includes a development mode with:
- Mock API responses
- Test credentials display in login modal
- Console logging for debugging
- Automatic token refresh simulation

## Troubleshooting

### Common Issues

1. **Login modal doesn't appear**: Check if `requiresAuth` is set to `true`
2. **Authentication fails**: Verify backend is running and endpoints are correct
3. **Token refresh fails**: Check refresh token implementation on backend
4. **Styling issues**: Ensure CSS is properly imported

### Debug Mode

Set `NODE_ENV=development` to enable:
- Mock API responses
- Test credentials in login modal
- Additional console logging
