import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { GuestSeat, MicRequest } from './types';

export const initializeEnhancedSeats = async (roomId: string, seatCount: number = 4) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    const data = roomSnap.data();
    if (!data.seats || data.seats.length === 0) {
      const initialSeats: GuestSeat[] = Array.from({ length: seatCount }, (_, i) => ({
        seatId: i,
        status: 'empty',
        uid: null,
        isMuted: false,
        type: 'audio',
        coinContribution: 0
      }));
      await updateDoc(roomRef, { seats: initialSeats });
    }
  }
};

export const updateSeatContribution = async (roomId: string, seatId: number, amount: number) => {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const seats = [...(roomSnap.data().seats || [])];
    if (seats[seatId]) {
      seats[seatId].coinContribution = (seats[seatId].coinContribution || 0) + amount;
      await updateDoc(roomRef, { seats });
    }
  }
};

export const requestSeat = async (roomId: string, user: { uid: string, displayName: string, photoURL?: string, level: number }, type: 'audio' | 'video' = 'audio') => {
  const requestRef = doc(db, 'rooms', roomId, 'seatRequests', user.uid);
  await setDoc(requestRef, {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL || '',
    level: user.level,
    type,
    timestamp: serverTimestamp(),
    status: 'pending'
  });
};

export const cancelSeatRequest = async (roomId: string, userId: string) => {
  const requestRef = doc(db, 'rooms', roomId, 'seatRequests', userId);
  await deleteDoc(requestRef);
};

export const approveSeatRequest = async (roomId: string, userId: string, seatId: number) => {
  const roomRef = doc(db, 'rooms', roomId);
  const requestRef = doc(db, 'rooms', roomId, 'seatRequests', userId);
  
  const [roomSnap, requestSnap] = await Promise.all([
    getDoc(roomRef),
    getDoc(requestRef)
  ]);

  if (roomSnap.exists() && requestSnap.exists()) {
    const seats = [...(roomSnap.data().seats || [])];
    const request = requestSnap.data();

    if (seats[seatId] && seats[seatId].status === 'empty') {
      seats[seatId] = {
        ...seats[seatId],
        status: 'occupied',
        uid: userId,
        type: request.type,
        isMuted: false,
        coinContribution: 0
      };

      await Promise.all([
        updateDoc(roomRef, { seats }),
        deleteDoc(requestRef)
      ]);
      return true;
    }
  }
  return false;
};
