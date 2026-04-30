import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";

const AGORA_APP_ID = (import.meta as any).env.VITE_AGORA_APP_ID || "";

interface UseStreamingProps {
  channelName: string;
  uid?: string | number;
  token?: string;
  role: 'host' | 'audience';
}

export function useStreaming({ channelName, uid, token, role }: UseStreamingProps) {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    if (!AGORA_APP_ID) {
      console.warn("VITE_AGORA_APP_ID is missing in environment variables.");
      return;
    }

    const init = async () => {
      // 1. Create client
      // For Viewers (Audience), we can use the 'live' mode which supports massive scaling
      const client = AgoraRTC.createClient({ 
        mode: "live", 
        codec: "vp8" 
      });
      clientRef.current = client;

      // 2. Set Role
      // Host uses RTC (Real-Time Communication)
      // Audience uses HLS if latency is not a factor, but here we setup the RTC Audience role
      await client.setClientRole(role === 'host' ? "host" : "audience");

      // 3. Setup event listeners
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUsers((prev) => [...prev.filter(u => u.uid !== user.uid), user]);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // 4. Join Channel
      try {
        await client.join(AGORA_APP_ID, channelName, token || null, uid || null);
        setIsJoined(true);

        if (role === 'host') {
          // 5. Publish Tracks for Host
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          await client.publish([audioTrack, videoTrack]);
        }
      } catch (error) {
        console.error("Agora Join Error:", error);
      }
    };

    init();

    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
      clientRef.current?.leave();
      clientRef.current = null;
    };
  }, [channelName, role]);

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    // HLS Support: If viewer and we have an HLS URL, they would use a standard <video> tag
    // For now, we return the RTC tracks for "Real-time viewer" capability as requested
  };
}
