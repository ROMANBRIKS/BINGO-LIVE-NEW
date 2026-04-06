import { NobleTier } from './NobleTypes';

export type UserRole = 'user' | 'host' | 'agency' | 'admin';
export type StreamStatus = 'live' | 'ended';
export type StreamType = 'video' | 'audio' | 'virtual';
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

export interface Family {
  id: string;
  name: string;
  badge: string;
  ownerUid: string;
  description: string;
  memberCount: number;
  totalDiamondsSpent: number;
  level: number;
  ranking?: number;
  announcement?: string;
}

export interface FamilyMember {
  uid: string;
  displayName: string;
  photoURL: string;
  role: 'leader' | 'co-leader' | 'member';
  joinedAt: any;
  contributionPoints: number;
}

export interface GuestSeat {
  seatId: number;
  uid: string | null;
  status: 'empty' | 'occupied' | 'locked';
  type: 'audio' | 'video';
  isMuted: boolean;
}

export interface MicRequest {
  uid: string;
  displayName: string;
  photoURL: string;
  timestamp: number;
  type: 'audio' | 'video';
  nobleTier?: NobleTier;
}

export type ForfeitType = 
  | 'Pushups' 
  | 'Sing a Song' 
  | 'Dance' 
  | 'Shoutout' 
  | 'Funny Face' 
  | 'Custom';

export interface PKForfeit {
  id: string;
  type: ForfeitType;
  description: string;
  duration: number; // in seconds
}

export type ShieldTier = 'Light' | 'Standard' | 'Heavy' | 'Emergency';

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
  seats?: GuestSeat[];
  micQueue?: MicRequest[];
  isPrivate: boolean;
  createdAt: any; // Firestore Timestamp
  pkStatus?: 'idle' | 'searching' | 'battling';
  pkOpponentUid?: string;
  pkOpponentRoomId?: string;
  pkScore?: number;
  pkOpponentScore?: number;
  pkEndTime?: string;
  pkForfeit?: PKForfeit;
  pkWinnerUid?: string | null;
  pkShieldTier?: ShieldTier;
  pkShieldAbsorbed?: number;
  pkShieldEndTime?: string;
  pkOpponentShieldTier?: ShieldTier;
  pkOpponentShieldAbsorbed?: number;
  pkOpponentShieldEndTime?: string;
  latitude?: number;
  longitude?: number;
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

export interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: any;
  type?: 'text' | 'gift' | 'system';
}
