import React, { useState } from 'react';
import { StreamHealthMonitor } from './StreamHealthMonitor';

interface StreamHealthToggleProps {
  peerConnection?: RTCPeerConnection | null;
  mediaStream?: MediaStream | null;
}

export const StreamHealthToggle: React.FC<StreamHealthToggleProps> = ({ peerConnection, mediaStream }) => {
  const [showMonitor, setShowMonitor] = useState(false);

  return (
    <div className="health-toggle-container">
      <button 
        onClick={() => setShowMonitor(!showMonitor)}
        className="health-toggle-btn px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2 mb-4"
      >
        <span>📊</span> {showMonitor ? 'Hide Stream Health' : 'Show Stream Health'}
      </button>
      {showMonitor && (
        <StreamHealthMonitor peerConnection={peerConnection} mediaStream={mediaStream} />
      )}
    </div>
  );
};
