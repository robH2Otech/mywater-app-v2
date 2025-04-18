
# Hostinger Webhook Integration

This document provides instructions for integrating the Hostinger online shop with the MYWATER app using webhooks.

## Overview

When a customer purchases a product from your Hostinger shop, the order data is automatically sent to your Firebase backend. This integration enables:

- Storing order data in Firestore
- Linking orders to user accounts
- Updating user profiles with purchase information
- Tracking referral code usage

## Setup Instructions

### 1. Configure Firebase Environment Variables

First, set up the webhook secret in Firebase:

```bash
firebase functions:config:set hostinger.webhook_secret="YOUR_SECRET_KEY"
```

Choose a strong secret key that will be shared with Hostinger.

### 2. Deploy the Function

Make sure the `onOrderCreated` function is deployed:

```bash
firebase deploy --only functions:onOrderCreated
```

### 3. Configure Webhook in Hostinger

Log into your Hostinger account and navigate to your shop settings:

1. Go to Website > Online Store > Settings > Advanced > Webhooks
2. Click "Add Webhook"
3. Set these values:
   - **URL**: `https://[your-firebase-project-id].cloudfunctions.net/onOrderCreated`
   - **Secret**: Enter the same secret key you set in Firebase
   - **Events**: Select "Order Created" (or equivalent)
4. Save the webhook configuration

### 4. Test the Integration

Place a test order in your shop to verify the integration is working:

1. Make a purchase using a test account
2. Check the Firebase Function logs for successful execution
3. Verify that the order appears in your Firestore `orders` collection
4. If you used an email that matches an existing user, verify that the user's profile was updated

## Troubleshooting

If the integration isn't working:

- Check Firebase Function logs for errors
- Verify the webhook URL and secret key match
- Ensure your Hostinger shop is correctly configured to send webhooks
- Test with a simple webhook receiver like webhook.site to debug payload issues

## Data Flow

1. Customer places order on Hostinger shop
2. Hostinger sends webhook with order data
3. `onOrderCreated` function validates the webhook secret
4. Function processes the order data:
   - Saves order to Firestore
   - Finds matching user by email (if any)
   - Updates user profile with purchase details
   - Handles referral code redemption (if applicable)
5. Function returns success/failure response

## Security Considerations

- The webhook secret prevents unauthorized requests
- Only process orders from authenticated Hostinger webhooks
- Validate all incoming data before storing in Firestore
