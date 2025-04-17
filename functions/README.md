
# Firebase Cloud Functions for MYWATER App

This folder contains Firebase Cloud Functions for the MYWATER application, including location tracking features.

## Functions

### Location Tracking
1. `updateAllLocations` - Scheduled function that runs twice daily (6 AM and 6 PM UTC) to update all units' location data
2. `updateUnitLocation` - On-demand HTTP callable function to update location for a specific unit
3. `cleanupLocationHistory` - Daily function to remove location data older than 24 hours

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure 1oT API Credentials

```bash
firebase functions:config:set oneot.api_key="YOUR_1OT_API_KEY"
firebase functions:config:set oneot.api_secret="YOUR_1OT_API_SECRET"
firebase functions:config:set oneot.endpoint="https://api.1ot.com/v1"
```

### 3. Deploy Functions

```bash
npm run deploy
```

## Location Data Management

Location data is stored in two places:
- Current location in the unit document
- Historical data in the `locationHistory` collection with 24-hour TTL

For detailed information, see [LOCATION_FUNCTIONS.md](./LOCATION_FUNCTIONS.md)

## Usage

### Client-side Integration

The client application can call the `updateUnitLocation` function directly:

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const updateLocation = httpsCallable(functions, 'updateUnitLocation');

// Call the function
updateLocation({ unitId: 'unit123', iccid: '1234567890' })
  .then((result) => {
    console.log('Location updated:', result.data);
  })
  .catch((error) => {
    console.error('Error updating location:', error);
  });
```

### Scheduled Updates

The `updateAllLocations` function runs automatically on the configured schedule. No manual intervention is needed.

## Testing

You can test the functions locally using the Firebase Emulator:

```bash
npm run serve
```

## Notes

- Make sure your Firestore security rules allow the functions to write to the units collection
- The scheduled function uses Google Cloud Scheduler, which requires a billing account to be set up

