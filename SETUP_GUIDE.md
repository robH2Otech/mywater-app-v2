
# MYWATER App Setup Guide

This guide will help you set up and run your MYWATER app with your Firebase project.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to your Firebase project

## Step 1: Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
# or
yarn install
```

## Step 2: Firebase Configuration

The Firebase configuration has already been updated to use your project credentials in `src/integrations/firebase/client.ts`.

### Firebase Authentication Setup:

1. Go to Firebase Console > Authentication > Sign-in methods
2. Enable Email/Password authentication
3. Add your domains to the authorized domains list (including localhost for development)
4. For social logins (Google, Facebook), make sure to configure the respective providers

### Firestore Database Setup:

Ensure your Firestore database has the following collections:
- `app_users_business` - Business users
- `app_users_privat` - Private users (consumer)
- `units` - Water purification units
- `alerts` - System alerts
- `filters` - Water filters data
- `referral_codes` - Referral program codes

## Step 3: Running the App

### Development Mode

To run the app in development mode:

```bash
npm run dev
# or
yarn dev
```

This will start the development server, typically on http://localhost:5173

### Production Build

To build the app for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` folder and can be deployed to any static hosting service.

## Step 4: Testing

After launching the app:

1. Try signing in with an existing account or creating a new one
2. Verify data is loading from your Firestore database
3. Check that all app features (units, filters, analytics) work as expected

## Troubleshooting

- If authentication isn't working, verify the Firebase Authentication configuration
- If data isn't loading, check the Firestore collection names and structure
- For local development issues, check console errors in the browser developer tools

## Firebase Functions

If the app uses Firebase Functions, make sure they're properly deployed to your Firebase project:

```bash
cd functions
npm install
firebase deploy --only functions
```

Key functions to check:
- `onOrderCreated` - Handles new orders
- `manualLocationUpdate` - Updates unit locations
- `scheduledLocationUpdate` - Periodically updates unit locations
