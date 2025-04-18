
# Unit Location Tracking: Deployment Guide

This guide covers how to deploy and configure the location tracking functions for MYWATER units.

## Overview

The system uses Firebase Cloud Functions to:
1. Update unit locations twice daily (6 AM and 6 PM UTC)
2. Allow on-demand location updates
3. Automatically clean up location data older than 24 hours

## Deployment Steps

### 1. Set up 1oT API Credentials

Configure your 1oT API credentials in Firebase:

```bash
firebase functions:config:set oneot.api_key="YOUR_1OT_API_KEY"
firebase functions:config:set oneot.api_secret="YOUR_1OT_API_SECRET"
firebase functions:config:set oneot.endpoint="https://api.1ot.com/v1"
```

### 2. Deploy the Functions

Deploy all location-related functions:

```bash
firebase deploy --only functions:updateAllLocations,functions:updateUnitLocation,functions:cleanupLocationHistory
```

### 3. Set Up Firestore TTL Index

For automatic data cleanup, create a TTL index in Firestore:

1. Go to Firebase Console > Firestore Database
2. Navigate to the Indexes tab
3. Click "Add Index"
4. Configure the index:
   - Collection ID: `locationHistory`
   - Fields to index: `createdAt` (with TTL enabled)
   - TTL Duration: 86400 (24 hours in seconds)
5. Create the index and wait for it to build

## Verifying Deployment

1. Check function deployment status in Firebase console
2. Verify scheduled functions in the Cloud Scheduler section
3. Test the on-demand location update function through the app

## How It Works

### Scheduled Updates (updateAllLocations)
- Runs at 6 AM and 6 PM UTC daily
- Fetches all units with ICCID values
- Connects to 1oT API to get location data for each unit
- Updates unit documents and location history collection

### On-demand Updates (updateUnitLocation)
- Triggered by user request from the app
- Updates a single unit's location
- Requires authentication

### Data Cleanup (cleanupLocationHistory)
- Runs daily at 3 AM UTC
- Removes location history records older than 24 hours
- Works alongside the Firestore TTL index for redundancy

## Troubleshooting

If location updates aren't working:

1. Check Firebase Function logs for errors
2. Verify 1oT API credentials are correct
3. Ensure units have valid ICCID values in Firestore
4. Test the 1oT API connection separately

## Security Considerations

- Location updates require authentication
- Historical data is automatically deleted after 24 hours
- API credentials are securely stored in Firebase Config
