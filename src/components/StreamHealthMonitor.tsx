import React, { useState, useEffect, useRef } from 'react';
import { StreamHealthMonitor as HealthMonitor, StreamHealthData } from '../services/streamHealthService';
import './StreamHealthMonitor.css';

interface StreamHealthMonitorProps {
  peerConnection?: RTCPeerConnection | null;
  mediaStream?: MediaStream | null;
}

export const StreamHealthMonitor: React.FC<StreamHealthMonitorProps> = ({ peerConnection, mediaStream }) => {
  const [healthData, setHealthData] = useState<StreamHealthData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const monitorRef = useRef<HealthMonitor | null>(null);

  useEffect(() => {
    const monitor = new HealthMonitor(peerConnection || null);
    if (mediaStream) monitor.setMediaStream(mediaStream);
    
    monitorRef.current = monitor;

    monitor.onHealthData((data) => {
      setHealthData(data);
    });

    monitor.startMonitoring(2000);

    return () => {
      monitor.stopMonitoring();
    };
  }, [peerConnection, mediaStream]);

  const getBitrateColor = (bitrate: number): string => {
    if (bitrate >= 500) return '#2ecc71';
    if (bitrate >= 200) return '#f39c12';
    return '#e74c3c';
  };

  const getLatencyColor = (latency: number): string => {
    if (latency <= 100) return '#2ecc71';
    if (latency <= 300) return '#f39c12';
    return '#e74c3c';
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 24) return '#2ecc71';
    if (fps >= 15) return '#f39c12';
    return '#e74c3c';
  };

  if (!healthData) {
    return (
      <div className="health-monitor-container">
        <div className="health-loading">⏳ Monitoring stream health...</div>
      </div>
    );
  }

  const criticalErrors = healthData.errors.filter(e => e.severity === 'critical' || e.severity === 'high');

  return (
    <div className="health-monitor-container">
      <div className="health-header" onClick={() => setShowDetails(!showDetails)}>
        <span className="health-title">📊 Stream Health</span>
        {criticalErrors.length > 0 && (
          <span className="health-alert">⚠️ {criticalErrors.length} critical issues</span>
        )}
        <span className="health-toggle">{showDetails ? '▲' : '▼'}</span>
      </div>

      <div className="health-metrics">
        <div className="health-metric">
          <span className="metric-label">Bitrate</span>
          <span className="metric-value" style={{ color: getBitrateColor(healthData.bitrate) }}>
            {healthData.bitrate} kbps
          </span>
        </div>
        <div className="health-metric">
          <span className="metric-label">Latency</span>
          <span className="metric-value" style={{ color: getLatencyColor(healthData.latency) }}>
            {healthData.latency} ms
          </span>
        </div>
        <div className="health-metric">
          <span className="metric-label">FPS</span>
          <span className="metric-value" style={{ color: getFPSColor(healthData.fps) }}>
            {healthData.fps}
          </span>
        </div>
        <div className="health-metric">
          <span className="metric-label">Dropped</span>
          <span className="metric-value" style={{ color: healthData.droppedFrames > 10 ? '#e74c3c' : '#2ecc71' }}>
            {healthData.droppedFrames} frames
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="health-details">
          <div className="health-detail-row">
            <span>Resolution:</span>
            <span>{healthData.resolution}</span>
          </div>
          <div className="health-detail-row">
            <span>Connection:</span>
            <span>{healthData.connectionType}</span>
          </div>
          <div className="health-detail-row">
            <span>Signal Strength:</span>
            <span>{Math.round(healthData.signalStrength)}%</span>
          </div>
          <div className="health-detail-row">
            <span>Audio Level:</span>
            <span>{Math.round(healthData.audioLevel * 100)}%</span>
          </div>

          {healthData.errors.length > 0 && (
            <div className="health-errors">
              <h4>Errors</h4>
              {healthData.errors.map((error, idx) => (
                <div key={idx} className={`health-error ${error.severity}`}>
                  <span className="error-severity">
                    {error.severity === 'critical' && '🔴'}
                    {error.severity === 'high' && '🟠'}
                    {error.severity === 'medium' && '🟡'}
                    {error.severity === 'low' && '🟢'}
                  </span>
                  <span className="error-message">{error.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="health-advice">
            <h4>💡 Tips</h4>
            {healthData.bitrate < 300 && <p>• Increase your upload speed or lower stream quality</p>}
            {healthData.latency > 300 && <p>• Check your network connection, try using wired ethernet</p>}
            {healthData.fps < 24 && <p>• Reduce CPU load, close other applications</p>}
            {healthData.droppedFrames > 10 && <p>• Consider lowering resolution or frame rate</p>}
            {healthData.errors.length === 0 && <p>✅ Stream health looks good!</p>}
          </div>
        </div>
      )}
    </div>
  );
};
