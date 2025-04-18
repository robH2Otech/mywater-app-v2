
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface OrderData {
  order_id: string;
  email: string;
  name: string;
  products: {
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  currency: string;
  shipping_address: {
    address: string;
    city: string;
    country: string;
    postal_code: string;
  };
  discount_code?: string;
  status: string;
  created_at: string;
}

/**
 * Cloud Function to handle incoming order webhooks from Hostinger
 * This function will be triggered by an HTTP request
 */
export const onOrderCreated = functions.https.onRequest(async (request, response) => {
  try {
    // Verify webhook secret (you should set this up with Hostinger)
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

    // Parse the order data
    const orderData = request.body as OrderData;
    
    if (!orderData || !orderData.email) {
      console.error('Invalid order data received:', orderData);
      response.status(400).send('Bad Request: Invalid order data');
      return;
    }

    console.log('Received order webhook:', orderData);

    // Find the user by email
    const db = admin.firestore();
    const usersSnapshot = await db.collection('app_users_privat')
      .where('email', '==', orderData.email.toLowerCase())
      .get();

    if (usersSnapshot.empty) {
      console.log(`No existing user found for email: ${orderData.email}. Creating order record only.`);
      
      // Store the order even if we don't find a matching user
      await db.collection('orders').doc(orderData.order_id).set({
        ...orderData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        linked_to_user: false
      });
      
      response.status(200).send('Order processed successfully');
      return;
    }

    // Get the first matching user
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log(`Found user with ID: ${userId} for email: ${orderData.email}`);

    // Check if order already exists to prevent duplicates
    const existingOrder = await db.collection('orders').doc(orderData.order_id).get();
    if (existingOrder.exists) {
      console.log(`Order ${orderData.order_id} already processed`);
      response.status(200).send('Order already processed');
      return;
    }

    // Store order in Firestore
    await db.collection('orders').doc(orderData.order_id).set({
      ...orderData,
      user_id: userId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      linked_to_user: true
    });
    
    // Update user record with purchase information
    const purifierModel = orderData.products[0]?.name || 'MYWATER Tap NANO';
    const purchaseDate = new Date();
    
    // Calculate cartridge replacement date (6 months from purchase)
    const cartridgeReplacementDate = new Date(purchaseDate);
    cartridgeReplacementDate.setMonth(cartridgeReplacementDate.getMonth() + 6);

    // Update the user record with purchase information if not already set
    await userDoc.ref.update({
      purifier_model: purifierModel,
      purchase_date: purchaseDate,
      cartridge_replacement_date: cartridgeReplacementDate,
      address: `${orderData.shipping_address.address}, ${orderData.shipping_address.city}, ${orderData.shipping_address.postal_code}, ${orderData.shipping_address.country}`,
      order_history: admin.firestore.FieldValue.arrayUnion({
        order_id: orderData.order_id,
        purchase_date: purchaseDate,
        product: purifierModel,
        amount: orderData.total,
        currency: orderData.currency
      }),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // If this purchase used a referral code, update the referral status
    if (orderData.discount_code) {
      const referralCodesSnapshot = await db.collection('referral_codes')
        .where('code', '==', orderData.discount_code)
        .limit(1)
        .get();

      if (!referralCodesSnapshot.empty) {
        const referralDoc = referralCodesSnapshot.docs[0];
        const referrerId = referralDoc.data().user_id;
        
        console.log(`Found referral code used: ${orderData.discount_code} from user: ${referrerId}`);
        
        // Update the referral code document
        await referralDoc.ref.update({
          total_uses: admin.firestore.FieldValue.increment(1),
          purchases_made: admin.firestore.FieldValue.increment(1)
        });
        
        // Create a record in the referrals collection
        await db.collection('referrals').add({
          referrer_id: referrerId,
          referral_email: orderData.email,
          referral_name: orderData.name,
          referral_code: orderData.discount_code,
          status: 'purchased',
          purchase_id: orderData.order_id,
          purchase_date: purchaseDate,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update referrer's count
        const referrerDoc = await db.collection('app_users_privat').doc(referrerId).get();
        if (referrerDoc.exists) {
          await referrerDoc.ref.update({
            referrals_count: admin.firestore.FieldValue.increment(1),
            referrals_converted: admin.firestore.FieldValue.increment(1),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Check if user has earned a free cartridge (3+ successful referrals)
          const referrerData = referrerDoc.data();
          const newConvertedCount = (referrerData?.referrals_converted || 0) + 1;
          
          if (newConvertedCount >= 3 && !(referrerData?.referral_reward_earned)) {
            await referrerDoc.ref.update({
              referral_reward_earned: true,
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`User ${referrerId} has earned a free cartridge reward!`);
          }
        }
      }
    }

    console.log(`Order ${orderData.order_id} processed successfully for user ${userId}`);
    response.status(200).send('Order processed successfully');
    
  } catch (error) {
    console.error('Error processing order webhook:', error);
    response.status(500).send('Internal Server Error');
  }
});
