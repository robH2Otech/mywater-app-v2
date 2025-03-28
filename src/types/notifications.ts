
export interface Notification {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  time: string;
  read: boolean;
  link?: string;
  platform?: 'instagram' | 'facebook' | 'linkedin';
  type: 'system' | 'social' | 'referral';
}
