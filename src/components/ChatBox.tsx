import React, { useState, useEffect, useRef } from 'react';
import { useChannel, useChatClient } from '../hooks/useStreamChat';
import './Chat.css';

export const ChatBox = ({ channelId }: { channelId: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { client } = useChatClient();
  const channel = useChannel(channelId);

  // Load messages on mount
  useEffect(() => {
    if (!channel) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await channel.query({ messages: { limit: 50 } });
        setMessages(response.messages.reverse());
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [channel]);

  // Listen for new messages
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = (event: any) => {
      setMessages(prev => [...prev, event.message]);
    };

    channel.on('message.new', handleNewMessage);
    return () => channel.off('message.new', handleNewMessage);
  }, [channel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !channel) return;

    try {
      await channel.sendMessage({
        text: input.trim(),
      });
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Check console for details.');
    }
  };

  if (!client || !channel) {
    return <div className="chat-loading">Connecting to chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="messages-container">
        {isLoading && <div className="loading-indicator">Loading messages...</div>}
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">No messages yet. Say hi!</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.user?.id === client.userID ? 'own' : 'other'}`}>
            <span className="username">{msg.user?.name || msg.user?.id || 'Unknown'}</span>
            <span className="text">{msg.text}</span>
            <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={!channel}
        />
        <button onClick={sendMessage} disabled={!input.trim() || !channel}>
          Send
        </button>
      </div>
    </div>
  );
};
