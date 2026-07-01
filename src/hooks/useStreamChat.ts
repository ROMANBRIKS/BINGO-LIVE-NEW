import { useEffect, useState, useRef } from 'react';
import { StreamChat, Channel } from 'stream-chat';
import { useAuth } from '../context/AuthContext';

export function useChatClient() {
  const { profile } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_STREAM_API_KEY || 'dummy_api_key';
    const chatClient = StreamChat.getInstance(apiKey);
    
    const connectUser = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      const userId = profile?.uid || 'anonymous-user';
      const userName = profile?.displayName || 'Anonymous';
      const userImage = profile?.photoURL || '';

      try {
        // Generate a development token for local sandbox/testing environments
        const userToken = chatClient.devToken(userId);
        
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          userToken
        );
        
        setClient(chatClient);
      } catch (error) {
        console.error('Failed to connect Stream Chat user:', error);
        initializedRef.current = false;
      }
    };

    if (profile) {
      connectUser();
    }

    return () => {
      if (chatClient && chatClient.userID) {
        chatClient.disconnectUser().then(() => {
          initializedRef.current = false;
          setClient(null);
        });
      }
    };
  }, [profile]);

  return { client };
}

export function useChannel(channelId: string) {
  const { client } = useChatClient();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!client || !channelId) return;

    const initChannel = async () => {
      try {
        const activeChannel = client.channel('messaging', channelId, {
          name: `Room Channel ${channelId}`,
        } as any);
        
        await activeChannel.watch();
        setChannel(activeChannel);
      } catch (error) {
        console.error('Failed to watch Stream Chat channel:', error);
      }
    };

    initChannel();
  }, [client, channelId]);

  return channel;
}
