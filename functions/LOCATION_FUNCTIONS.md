
# Location Tracking Cloud Functions

This document describes the Cloud Functions implementation for tracking and updating unit locations in the MYWATER app.

## Overview

The solution consists of three main Firebase Cloud Functions:

1. `updateAllLocations`: A scheduled function that runs twice daily (6 AM and 6 PM UTC) to update all units' location data
2. `updateUnitLocation`: An on-demand function that updates a specific unit's location
3. `cleanupLocationHistory`: A daily function that removes location data older than 24 hours

## Data Management

- Location data is stored in two places:
  1. On the unit document itself (most recent location)
  2. In a separate `locationHistory` collection with TTL (Time To Live)

- Historical data is automatically deleted after 24 hours to:
  - Comply with data minimization principles
  - Prevent unnecessary database growth
  - Ensure data freshness

## Setting Up

1. **Configure API Credentials**

```bash
firebase functions:config:set oneot.api_key="YOUR_1OT_API_KEY"
firebase functions:config:set oneot.api_secret="YOUR_1OT_API_SECRET" 
firebase functions:config:set oneot.endpoint="https://api.1ot.com/v1"
```

2. **Deploy Functions**

```bash
cd functions
npm install
npm run deploy
```

3. **Set Up Firestore Indexes** (if needed)

Create an index on the `locationHistory` collection with these fields:
- `unitId` (Ascending)
- `createdAt` (Descending)

## Frontend Integration

The client application can:

1. Request on-demand location updates using `useCloudLocationUpdate` hook
2. Access historical location data using `useLocationHistory` hook
3. View current location data in the UnitLocationDisplay component

## Security

- Functions are secured with Firebase Authentication
- Only authenticated users can request location updates
- Data is stored securely in Firestore with appropriate security rules

## Troubleshooting

If location updates aren't working:

1. Check that API credentials are configured correctly
2. Verify that the ICCID format matches what the 1oT API expects
3. Check Firebase function logs for detailed error information
4. Ensure units have a valid ICCID field in Firestore

## Monitoring & Maintenance

- Monitor function execution in the Firebase console
- Check logs for any authentication or API errors
- The system is designed to be self-maintaining with automatic cleanup
