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

  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);

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
      await client.setClientRole(role === 'host' ? "host" : "audience");

      // Configure publisher fallbacks for the streamer
      try {
        if (role === 'host') {
          await client.enableDualStream();
          // Configures uplink fallback: fall back to publishing audio-only under poor internet uplink
          await (client as any).setLocalPublishFallbackOption(1);
          console.log("[useStreaming] Configured dual-stream and publishing fallback for Host.");
        }
      } catch (err) {
        console.warn("[useStreaming] Failed to configure broadcaster fallback options:", err);
      }

      // 3. Setup event listeners
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        
        // Configures subscription fallback: prioritize audio, fallback to audio-only if connections choke
        try {
          await client.setStreamFallbackOption(user.uid, 2);
          console.log(`[useStreaming] Configured audio-priority downlink fallback for user ${user.uid}`);
        } catch (err) {
          console.warn("[useStreaming] Failed to set receiver fallback option for user:", user.uid, err);
        }

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
          
          localAudioTrackRef.current = audioTrack;
          localVideoTrackRef.current = videoTrack;
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
      // Use refs to prevent stale closure cleanups which would leave tracks alive or cause cutouts
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
        clientRef.current = null;
      }
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
