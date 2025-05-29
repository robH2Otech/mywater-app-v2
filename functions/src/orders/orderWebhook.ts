
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from '../utils/adminInit';
import { logFunctionStart, logFunctionStep, logFunctionSuccess, logFunctionError } from '../utils/errorUtils';

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
 */
export const onOrderCreated = onRequest({
  cors: true
}, async (request, response) => {
  const functionName = 'onOrderCreated';
  
  try {
    logFunctionStart(functionName, request.body, null);
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    // Parse the order data
    const orderData = request.body as OrderData;
    
    if (!orderData || !orderData.email) {
      logFunctionError(functionName, new Error('Invalid order data'), 'input_validation');
      response.status(400).send('Bad Request: Invalid order data');
      return;
    }

    logFunctionStep('processing_order', { orderId: orderData.order_id, email: orderData.email });

    // Find the user by email
    const db = getFirestore();
    const usersSnapshot = await db.collection('app_users_privat')
      .where('email', '==', orderData.email.toLowerCase())
      .get();

    if (usersSnapshot.empty) {
      logFunctionStep('no_user_found_storing_order_only', { email: orderData.email });
      
      // Store the order even if we don't find a matching user
      await db.collection('orders').doc(orderData.order_id).set({
        ...orderData,
        created_at: new Date(),
        linked_to_user: false
      });
      
      logFunctionSuccess(functionName, { orderId: orderData.order_id, linkedToUser: false });
      response.status(200).send('Order processed successfully');
      return;
    }

    // Get the first matching user
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    logFunctionStep('user_found', { userId, email: orderData.email });

    // Check if order already exists to prevent duplicates
    const existingOrder = await db.collection('orders').doc(orderData.order_id).get();
    if (existingOrder.exists) {
      logFunctionStep('order_already_processed', { orderId: orderData.order_id });
      response.status(200).send('Order already processed');
      return;
    }

    // Store order in Firestore
    await db.collection('orders').doc(orderData.order_id).set({
      ...orderData,
      user_id: userId,
      created_at: new Date(),
      linked_to_user: true
    });
    
    // Update user record with purchase information
    const purifierModel = orderData.products[0]?.name || 'MYWATER Tap NANO';
    const purchaseDate = new Date();
    
    // Calculate cartridge replacement date (6 months from purchase)
    const cartridgeReplacementDate = new Date(purchaseDate);
    cartridgeReplacementDate.setMonth(cartridgeReplacementDate.getMonth() + 6);

    // Update the user record with purchase information
    await userDoc.ref.update({
      purifier_model: purifierModel,
      purchase_date: purchaseDate,
      cartridge_replacement_date: cartridgeReplacementDate,
      address: `${orderData.shipping_address.address}, ${orderData.shipping_address.city}, ${orderData.shipping_address.postal_code}, ${orderData.shipping_address.country}`,
      updated_at: new Date()
    });

    // Handle referral codes if present
    if (orderData.discount_code) {
      logFunctionStep('processing_referral_code', { code: orderData.discount_code });
      
      const referralCodesSnapshot = await db.collection('referral_codes')
        .where('code', '==', orderData.discount_code)
        .limit(1)
        .get();

      if (!referralCodesSnapshot.empty) {
        const referralDoc = referralCodesSnapshot.docs[0];
        const referrerId = referralDoc.data().user_id;
        
        // Update the referral code document
        await referralDoc.ref.update({
          total_uses: (referralDoc.data().total_uses || 0) + 1,
          purchases_made: (referralDoc.data().purchases_made || 0) + 1
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
          created_at: new Date()
        });
        
        // Update referrer's count
        const referrerDoc = await db.collection('app_users_privat').doc(referrerId).get();
        if (referrerDoc.exists) {
          const referrerData = referrerDoc.data();
          const newConvertedCount = (referrerData?.referrals_converted || 0) + 1;
          
          await referrerDoc.ref.update({
            referrals_count: (referrerData?.referrals_count || 0) + 1,
            referrals_converted: newConvertedCount,
            updated_at: new Date()
          });
          
          // Check if user has earned a free cartridge (3+ successful referrals)
          if (newConvertedCount >= 3 && !(referrerData?.referral_reward_earned)) {
            await referrerDoc.ref.update({
              referral_reward_earned: true,
              updated_at: new Date()
            });
            
            logFunctionStep('referral_reward_earned', { referrerId });
          }
        }
      }
    }

    const result = { orderId: orderData.order_id, userId, linkedToUser: true };
    logFunctionSuccess(functionName, result);
    
    response.status(200).send('Order processed successfully');
    
  } catch (error) {
    logFunctionError(functionName, error);
    response.status(500).send('Internal Server Error');
  }
});
