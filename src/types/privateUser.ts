
export interface PrivateUser {
  id: string;
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  purifier_model: string;
  purchase_date: Date;
  cartridge_replacement_date: Date;
  referral_code: string;
  referrals_count: number;         // Total referrals sent
  referrals_converted: number;     // Referrals that resulted in purchase
  referral_reward_earned: boolean; // Whether 3 successful referrals have been achieved
  referral_reward_claimed: boolean; // Whether the free cartridge has been claimed
  user_rank: string;               // User's referral rank
  order_history?: OrderHistoryItem[]; // User's order history
  created_at: Date;
  updated_at: Date;
}

export interface OrderHistoryItem {
  order_id: string;
  purchase_date: Date;
  product: string;
  amount: number;
  currency: string;
}

export interface Referral {
  id: string;
  referrer_id: string;       // ID of the user who referred
  referrer_name: string;     // Name of the user who referred
  referral_email: string;    // Email of the person being referred
  referral_name: string;     // Name of the person being referred
  referral_code: string;     // The code used for the referral
  status: "pending" | "purchased"; // Whether the referred person has made a purchase
  purchase_id?: string;      // If purchased, the ID of the purchase
  purchase_date?: Date;      // If purchased, when the purchase was made
  created_at: Date;
  updated_at: Date;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: Date;
  total_uses: number;        // How many times this code has been used
  purchases_made: number;    // How many purchases have been made with this code
}

export interface ReferralRank {
  level: number;             // Numerical representation of rank (1, 2, 3, 4)
  title: string;             // Display name of rank (e.g., "Water Saver Starter")
  min_referrals: number;     // Min referrals needed for this rank
  next_rank_title: string;   // Title of the next rank
  next_rank_referrals: number; // Referrals needed for next rank
  color_class: string;       // CSS color class for styling
}

export interface Order {
  order_id: string;
  user_id?: string;
  email: string;
  name: string;
  products: OrderProduct[];
  total: number;
  currency: string;
  shipping_address: ShippingAddress;
  discount_code?: string;
  status: string;
  created_at: Date;
  linked_to_user: boolean;
}

export interface OrderProduct {
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  country: string;
  postal_code: string;
}
