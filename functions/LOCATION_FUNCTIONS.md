
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

## Configuration Details

The TTL mechanism works as follows:

1. When location data is saved to the `locationHistory` collection, a `createdAt` timestamp is added.
2. Firestore TTL is configured to automatically delete documents after 24 hours based on this timestamp.
3. The cleanupLocationHistory function serves as a backup to ensure proper data cleanup.

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

3. **Set Up Firestore TTL Index**

Create a TTL index on the `locationHistory` collection with these settings:
- Field: `createdAt` 
- TTL Duration: 86400 (24 hours in seconds)

## Data Flow

1. **Scheduled Updates (updateAllLocations)**:
   - Runs twice daily
   - Queries all units with valid ICCIDs
   - For each unit, calls the 1oT API to get current location
   - Updates both the unit document and adds a new entry to locationHistory

2. **On-demand Updates (updateUnitLocation)**:
   - Called from the client when a specific unit's location needs updating
   - Takes unitId and ICCID as parameters
   - Updates both the unit document and adds a new entry to locationHistory

3. **Historical Data Cleanup (cleanupLocationHistory)**:
   - Runs daily
   - Finds and deletes locationHistory entries older than 24 hours
   - Acts as a backup to the Firestore TTL mechanism

## Troubleshooting

- If location updates aren't working:
  - Check API credentials in Firebase Functions configuration
  - Verify that units have valid ICCID fields
  - Check Firestore security rules allow the functions to write to both the units collection and locationHistory collection
  - Review function logs in Firebase console

## Client-Side Integration

The client application uses these custom hooks:
- `useLocationHistory`: Fetches the historical location data for a unit
- `useCloudLocationUpdate`: Provides a function to trigger on-demand location updates

These hooks are integrated with the UnitLocationDisplay component to show the current and historical locations on a map.
