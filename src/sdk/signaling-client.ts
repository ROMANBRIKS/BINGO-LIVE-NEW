/**
 * Signaling Client - Handles signaling connections with standard socket-like abstraction
 * Supports fallback to Firebase active channels to coordinate room memberships seamlessly
 */

import { db } from '../firebase';
import { collection, onSnapshot, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';

export class SignalingClient {
  private url: string;
  private connected = false;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private activeRoomId: string | null = null;
  private currentUserId: string | null = null;
  private unsubscribeFirestore: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  async connect(userId: string) {
    this.currentUserId = userId;
    this.connected = true;
    console.log(`🔌 [SignalingClient] Connected as user ${userId}`);
    return Promise.resolve();
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    if (!this.connected) return;

    if (event === 'join') {
      this.handleJoin(data);
    } else if (event === 'leave') {
      this.handleLeave(data);
    } else if (event === 'signal') {
      this.handleSignalEmit(data);
    }
  }

  private handleJoin(data: { roomId: string; userId: string; isHost?: boolean }) {
    this.activeRoomId = data.roomId;
    console.log(`📡 [SignalingClient] Emitting join room: ${data.roomId}`);

    // Set up Firestore listener as a synchronized server-backup signaling mechanism
    if (this.unsubscribeFirestore) this.unsubscribeFirestore();

    const signalCol = collection(db, `rooms/${data.roomId}/signals`);
    this.unsubscribeFirestore = onSnapshot(signalCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const signalData = change.doc.data();
          // Filter out our own signals
          if (signalData.from !== this.currentUserId && signalData.to === this.currentUserId) {
            console.log(`📥 [SignalingClient] Received signaling signal of type: ${signalData.type}`);
            
            if (signalData.type === 'offer') {
              this.dispatchEvent('offer', { from: signalData.from, signal: signalData.data });
            } else if (signalData.type === 'answer') {
              this.dispatchEvent('answer', { from: signalData.from, signal: signalData.data });
            } else if (signalData.type === 'candidate') {
              this.dispatchEvent('ice-candidate', { from: signalData.from, signal: signalData.data });
            }
          }
        }
      });
    });

    // Notify other users that someone joined
    this.dispatchEvent('user-joined', { userId: data.userId });
  }

  private async handleLeave(data: { roomId: string; userId: string }) {
    console.log(`📡 [SignalingClient] Leaving signaling room: ${data.roomId}`);
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    this.activeRoomId = null;

    // Clear old signals in firestore
    try {
      const q = query(
        collection(db, `rooms/${data.roomId}/signals`),
        where('from', '==', data.userId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docRef) => {
        await deleteDoc(docRef.ref);
      });
    } catch (e) {
      console.warn('[SignalingClient] Non-blocking signal clean error:', e);
    }
  }

  private async handleSignalEmit(data: { to: string; from: string; roomId: string; signal: any }) {
    // Write track signal metadata into Firebase Firestore for real-time reliable negotiation fallback
    try {
      let signalType = 'offer';
      if (data.signal.type === 'offer') signalType = 'offer';
      else if (data.signal.type === 'answer') signalType = 'answer';
      else if (data.signal.candidate) signalType = 'candidate';

      await addDoc(collection(db, `rooms/${data.roomId}/signals`), {
        type: signalType,
        data: data.signal,
        from: data.from,
        to: data.to,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('[SignalingClient] Error storing fallback signal:', e);
    }
  }

  private dispatchEvent(event: string, data: any) {
    const list = this.eventHandlers.get(event);
    if (list) {
      list.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('[SignalingClient] Error in callback handler:', e);
        }
      });
    }
  }

  disconnect() {
    this.connected = false;
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    console.log('🔌 [SignalingClient] Disconnected');
  }
}
