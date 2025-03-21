
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
  referrals_count: number;
  referrals_converted: number;
  referral_reward_earned: boolean;
  referral_reward_claimed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referrer_name: string;
  referral_email: string;
  referral_name: string;
  referral_code: string;
  status: "pending" | "purchased";
  created_at: Date;
  updated_at: Date;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: Date;
}
