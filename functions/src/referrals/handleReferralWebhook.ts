
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface ReferralWebhookData {
  referral_code: string;
  buyer_email: string;
  buyer_name: string;
  order_total: number;
  order_id: string;
  timestamp: string;
}

/**
 * Cloud Function to handle incoming referral webhooks from Hostinger
 * This function will be triggered by an HTTP request
 */
export const onReferralUsed = functions.https.onRequest(async (request, response) => {
  try {
    // Verify webhook secret
    const webhookSecret = functions.config().hostinger?.webhook_secret;
    const providedSecret = request.headers['x-webhook-secret'];
    
    if (webhookSecret && providedSecret !== webhookSecret) {
      console.error('Invalid webhook secret');
      response.status(401).send('Unauthorized');
      return;
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    // Parse the referral data
    const referralData = request.body as ReferralWebhookData;
    
    if (!referralData || !referralData.referral_code || !referralData.buyer_email) {
      console.error('Invalid referral data received:', referralData);
      response.status(400).send('Bad Request: Invalid referral data');
      return;
    }

    console.log('Received referral webhook:', referralData);

    const db = admin.firestore();
    
    // Find the referral code in the database
    const referralCodesSnapshot = await db.collection('referral_codes')
      .where('code', '==', referralData.referral_code)
      .limit(1)
      .get();

    if (referralCodesSnapshot.empty) {
      console.error(`No referral code found matching: ${referralData.referral_code}`);
      response.status(404).send('Referral code not found');
      return;
    }

    // Get referrer's user ID
    const referralDoc = referralCodesSnapshot.docs[0];
    const referralData = referralDoc.data();
    const referrerId = referralData.user_id;
    
    console.log(`Found referral code ${referralData.referral_code} belonging to user ${referrerId}`);
    
    // Get referrer's information
    const userDoc = await db.collection('app_users_privat').doc(referrerId).get();
    if (!userDoc.exists) {
      console.error(`User not found for ID: ${referrerId}`);
      response.status(404).send('Referrer not found');
      return;
    }
    
    const userData = userDoc.data();
    const referrerName = `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim();
    
    // Update the referral code stats
    await referralDoc.ref.update({
      total_uses: admin.firestore.FieldValue.increment(1),
      purchases_made: admin.firestore.FieldValue.increment(1),
      last_used: new Date()
    });
    
    // Create a record in the referrals collection
    await db.collection('referrals').add({
      referrer_id: referrerId,
      referrer_name: referrerName,
      referral_email: referralData.buyer_email,
      referral_name: referralData.buyer_name,
      referral_code: referralData.referral_code,
      status: 'purchased',
      purchase_id: referralData.order_id,
      purchase_amount: referralData.order_total,
      purchase_date: new Date(referralData.timestamp || Date.now()),
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update referrer's counts
    await userDoc.ref.update({
      referrals_count: admin.firestore.FieldValue.increment(1),
      referrals_converted: admin.firestore.FieldValue.increment(1),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Check if user has earned a free cartridge (3+ successful referrals)
    const updatedUserDoc = await db.collection('app_users_privat').doc(referrerId).get();
    const updatedUserData = updatedUserDoc.data();
    const referralsConverted = updatedUserData?.referrals_converted || 0;
    
    if (referralsConverted >= 3 && !(updatedUserData?.referral_reward_earned)) {
      await updatedUserDoc.ref.update({
        referral_reward_earned: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`User ${referrerId} has earned a free cartridge reward!`);
      
      // Trigger notification event in the database
      await db.collection('notifications').add({
        user_id: referrerId,
        title: 'Congratulations!',
        message: 'You've earned a free €150 replacement cartridge! Visit the shop to claim your reward.',
        type: 'reward',
        read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    response.status(200).send('Referral processed successfully');
    
  } catch (error) {
    console.error('Error processing referral webhook:', error);
    response.status(500).send('Internal Server Error');
  }
});
