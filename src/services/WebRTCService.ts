import { 
  collection, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  deleteField
} from 'firebase/firestore';
import { db } from '../firebase';

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate';
  data: any;
  from: string;
  to: string;
  timestamp: any;
}

class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  /**
   * HOST: Start broadcasting a stream to a specific viewer
   */
  async createOffer(roomId: string, viewerUid: string, stream: MediaStream, hostUid: string) {
    console.log(`[WebRTC] Creating offer for viewer: ${viewerUid}`);
    
    const pc = new RTCPeerConnection(this.config);
    this.peerConnections.set(viewerUid, pc);

    // Add tracks from the processed stream
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(roomId, {
          type: 'candidate',
          data: event.candidate.toJSON(),
          from: hostUid,
          to: viewerUid,
          timestamp: new Date()
        });
      }
    };

    // Create and set local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send offer to signaling collection
    await this.sendSignal(roomId, {
      type: 'offer',
      data: { sdp: offer.sdp, type: offer.type },
      from: hostUid,
      to: viewerUid,
      timestamp: new Date()
    });

    return pc;
  }

  /**
   * VIEWER: Respond to a host's offer
   */
  async createAnswer(roomId: string, hostUid: string, viewerUid: string, offer: any, onStream: (stream: MediaStream) => void) {
    console.log(`[WebRTC] Creating answer for host: ${hostUid}`);
    
    const pc = new RTCPeerConnection(this.config);
    this.peerConnections.set(hostUid, pc);

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track');
      if (event.streams && event.streams[0]) {
        onStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(roomId, {
          type: 'candidate',
          data: event.candidate.toJSON(),
          from: viewerUid,
          to: hostUid,
          timestamp: new Date()
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await this.sendSignal(roomId, {
      type: 'answer',
      data: { sdp: answer.sdp, type: answer.type },
      from: viewerUid,
      to: hostUid,
      timestamp: new Date()
    });

    return pc;
  }

  /**
   * Handle incoming ICE candidates
   */
  async addIceCandidate(peerUid: string, candidate: any) {
    const pc = this.peerConnections.get(peerUid);
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('[WebRTC] Error adding ICE candidate:', e);
      }
    }
  }

  /**
   * Handle incoming answers (Host side)
   */
  async handleAnswer(viewerUid: string, answer: any) {
    const pc = this.peerConnections.get(viewerUid);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async sendSignal(roomId: string, signal: WebRTCSignal) {
    try {
      await addDoc(collection(db, `rooms/${roomId}/signals`), signal);
    } catch (e) {
      console.error('[WebRTC] Signaling error:', e);
    }
  }

  /**
   * Clean up connections
   */
  stop(peerUid?: string) {
    if (peerUid) {
      const pc = this.peerConnections.get(peerUid);
      if (pc) {
        pc.close();
        this.peerConnections.delete(peerUid);
      }
    } else {
      this.peerConnections.forEach(pc => pc.close());
      this.peerConnections.clear();
    }
  }
}

export const webRTCService = new WebRTCService();
