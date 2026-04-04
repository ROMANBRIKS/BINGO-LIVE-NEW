import { NobleTier } from './NobleTypes';

export type UserRole = 'user' | 'host' | 'agency' | 'admin';
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
  nobleTitle: NobleTier;
  level: number;
  friends: number;
  following: number;
  fans: number;
  agencyId?: string;
  familyId?: string;
  totalDiamondsSpent: number;
  totalBeansEarned: number;
  lastNoblePurchaseDate?: any;
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
  likes: number;
  guests: string[];
  isPrivate: boolean;
  createdAt: any; // Firestore Timestamp
  pkStatus?: 'idle' | 'searching' | 'battling';
  pkOpponentUid?: string;
  pkOpponentRoomId?: string;
  pkScore?: number;
  pkOpponentScore?: number;
  pkEndTime?: string;
}

export interface Gift {
  id: string;
  name: string;
  cost: number;
  image?: string;
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

export interface PrivateCallRequest {
  id: string;
  roomId: string;
  viewerUid: string;
  viewerName: string;
  viewerPhoto: string;
  hostUid: string;
  status: 'pending' | 'accepted' | 'declined' | 'ended';
  fee: number;
  createdAt: any;
  startedAt?: any;
  endedAt?: any;
}
