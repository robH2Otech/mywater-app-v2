
# Firebase Function Setup Guide: createBusinessUser

## Step 1: Verify Function Deployment Status

### Check if Function is Deployed
1. Open Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to "Functions" in the left sidebar
4. Look for `createBusinessUser` in the functions list

### If Function is NOT Deployed:
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy the function
firebase deploy --only functions:createBusinessUser
```

## Step 2: Test Function from Frontend

### Current Integration Status
The function is already integrated in:
- `src/utils/admin/userInvitationService.ts` (calls the function)
- `src/components/users/AddUserDialog.tsx` (uses the service)

### Test the Integration
1. Go to Users page in your app
2. Click "Add User" button
3. Fill out the form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Company: Your Company
   - Role: user
4. Click "Create User & Send Invitation"

### Expected Behavior
- User should be created in Firebase Auth
- User should be added to `app_users_business` collection
- Invitation email should be sent with login credentials
- Success message should appear

## Step 3: Function Configuration

### Required Environment Variables
Make sure these are set in Firebase Functions config:
```bash
firebase functions:config:set somekey.somevalue="somevalue"
```

### Function Permissions
The function needs these Firebase permissions:
- Firebase Auth Admin SDK
- Firestore write access
- Email sending (via EmailJS)

## Step 4: Troubleshooting

### Common Issues:

1. **Function not found error**
   - Deploy the function: `firebase deploy --only functions:createBusinessUser`

2. **Permission denied**
   - Check Firebase rules for `app_users_business` collection
   - Verify function has admin privileges

3. **Email not sending**
   - Check EmailJS configuration in `src/utils/email/config.ts`
   - Verify EmailJS service is active

4. **CORS errors**
   - Function should handle CORS automatically
   - Check browser console for detailed errors

### Debug Steps:
1. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only createBusinessUser
   ```

2. Test function directly in Firebase Console:
   - Go to Functions → createBusinessUser
   - Use "Test" tab with sample data

3. Monitor browser network tab for HTTP requests

## Step 5: Security Considerations

### Function Security Features:
- Validates user permissions (superadmin only)
- Sanitizes input data
- Generates secure passwords
- Sends credentials via encrypted email

### Best Practices:
- Regular password rotation reminders
- Monitor failed login attempts
- Review user creation logs periodically

## Function is Ready!
The `createBusinessUser` function is already implemented and should work with your current setup. Follow the testing steps above to verify everything is working correctly.
