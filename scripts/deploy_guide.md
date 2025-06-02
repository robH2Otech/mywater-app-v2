
# Firebase Functions Deployment Guide

## Step 1: Deploy Functions
```bash
cd functions
npm run build
npm run deploy
```

## Step 2: Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/mywater-app-533f8/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Save the file as `service-account-key.json` in the `scripts` folder

## Step 3: Run Superadmin Claims Script
```bash
cd scripts
node set_superadmin_claims_safe.js
```

## Step 4: Test Authentication
1. Go to the app and try to log in with one of the superadmin emails:
   - rob.istria@gmail.com
   - robert.slavec@gmail.com
   - aljaz.slavec@gmail.com
2. Check if you can access the Users and Filters pages without permission errors

## Expected Results
- Functions should deploy successfully without deletions
- Only 6 functions will be deployed (removed non-existent order and referral webhooks)
- Superadmin users should have proper claims set
- Authentication should work and pages should load without Firebase permission errors

## Troubleshooting
- If build fails, check that all imported files exist
- If deployment fails, verify Firebase CLI is logged in
- If claims script fails, ensure service account key is downloaded correctly
