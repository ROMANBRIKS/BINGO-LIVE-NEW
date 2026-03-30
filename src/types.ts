export type UserRole = 'user' | 'host' | 'agency' | 'admin';
export type NobleTitle = 'none' | 'Baron' | 'Earl' | 'Duke';
export type StreamStatus = 'live' | 'ended';
export type StreamType = 'video' | 'audio';
export type TransactionType = 'purchase' | 'gift' | 'salary' | 'rebate';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  diamonds: number;
  beans: number;
  role: UserRole;
  nobleTitle: NobleTitle;
  agencyId?: string;
  familyId?: string;
  totalDiamondsSpent: number;
  totalBeansEarned: number;
  referralCode: string;
  invitedBy?: string;
}

export interface Agency {
  id: string;
  name: string;
  ownerUid: string;
  tier: number;
  commissionRate: number;
  rebateRate: number;
  totalHosts: number;
}

export interface Room {
  id: string;
  hostUid: string;
  title: string;
  status: StreamStatus;
  type: StreamType;
  currentBeans: number;
  viewerCount: number;
  guests: string[];
  isPrivate: boolean;
}

export interface Gift {
  id: string;
  name: string;
  cost: number;
  animationType: string;
}

export interface Transaction {
  id: string;
  fromUid: string;
  toUid: string;
  amount: number;
  type: TransactionType;
  timestamp: any; // Firestore Timestamp
}
