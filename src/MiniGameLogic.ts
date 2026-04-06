import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface GameSession {
  id: string;
  gameId: string;
  hostUid: string;
  players: string[];
  status: 'waiting' | 'playing' | 'finished';
  result?: any;
  createdAt: any;
}

export async function createGameSession(gameId: string, hostUid: string) {
  try {
    const sessionRef = await addDoc(collection(db, 'game_sessions'), {
      gameId,
      hostUid,
      players: [hostUid],
      status: 'waiting',
      createdAt: serverTimestamp()
    });
    return sessionRef.id;
  } catch (error) {
    console.error("Error creating game session:", error);
    return null;
  }
}

export async function joinGameSession(sessionId: string, playerUid: string) {
  try {
    const sessionRef = doc(db, 'game_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const data = sessionDoc.data() as GameSession;
      if (data.status === 'waiting' && !data.players.includes(playerUid)) {
        await updateDoc(sessionRef, {
          players: [...data.players, playerUid]
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error joining game session:", error);
    return false;
  }
}

export async function finishGameSession(sessionId: string, result: any) {
  try {
    await updateDoc(doc(db, 'game_sessions', sessionId), {
      status: 'finished',
      result,
      finishedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error finishing game session:", error);
    return false;
  }
}
