# Firebase Authentication Setup

This project now includes Firebase Authentication integration. Here's what has been implemented:

## Features Added

### 1. Firebase Configuration
- **File**: `src/firebase/config.ts`
- Contains Firebase project configuration
- Initializes Firebase app and authentication service

### 2. Authentication Service
- **File**: `src/services/auth.ts`
- Provides methods for:
  - Sign in with email/password
  - Sign up with email/password
  - Sign out
  - Password reset
  - Auth state monitoring
  - User-friendly error messages

### 3. Updated SignIn Component
- **File**: `src/views/SignIn.vue`
- Features:
  - Email/password authentication
  - Loading states with spinner
  - Error and success message display
  - Forgot password functionality
  - Demo account button
  - Form validation

### 4. Analytics Landing (Protected)
- **File**: `src/views/DescriptiveAnalytics.vue`
- Route: `/dashboard` and `/analytics` both render this page
- Shown after successful authentication
- Displays crime analytics overview and metrics

### 5. Authentication Store
- **File**: `src/stores/auth.ts`
- Global state management for authentication
- Uses Pinia for state management

## How to Use

### 1. Create User Accounts
You can create user accounts in two ways:

#### Option A: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `project-crime-prevention`
3. Navigate to Authentication > Users
4. Click "Add user" to create accounts manually

#### Option B: Programmatically (Sign Up)
The authentication service includes a `signUp` method that you can use to create accounts programmatically.

### 2. Test Authentication
1. Start the development server: `npm run dev`
2. Navigate to the sign-in page
3. Use the "Try Demo Account" button to auto-fill demo credentials
4. Or create a real account and sign in

### 3. Demo Account
The demo account button fills in:
- Email: `demo@crimeprevention.com`
- Password: `demo123`

**Note**: You'll need to create this account in Firebase Console first.

## Firebase Console Setup

### Enable Authentication
1. Go to Firebase Console
2. Select your project
3. Navigate to Authentication
4. Click "Get started"
5. Go to "Sign-in method" tab
6. Enable "Email/Password" provider

### Security Rules (Optional)
You can add security rules in Firebase Console > Firestore Database > Rules if you plan to use Firestore for user data.

## Environment Variables (Optional)

For better security, you can move Firebase config to environment variables:

1. Create `.env.local` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `src/firebase/config.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Next Steps

1. Create user accounts in Firebase Console
2. Test the authentication flow
3. Customize the dashboard based on your needs
4. Add more protected routes as needed
5. Implement role-based access control if required

## Troubleshooting

### Common Issues
1. **"Firebase: Error (auth/user-not-found)"**: User account doesn't exist
2. **"Firebase: Error (auth/wrong-password)"**: Incorrect password
3. **"Firebase: Error (auth/too-many-requests)"**: Too many failed attempts

### Solutions
- Check Firebase Console for user accounts
- Verify email/password combinations
- Wait a few minutes if rate limited
- Check browser console for detailed error messages
