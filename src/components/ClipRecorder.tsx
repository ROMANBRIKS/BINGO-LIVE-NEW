import React, { useState, useRef, useEffect } from 'react';
import './ClipRecorder.css';

interface Clip {
  id: string;
  blob: Blob;
  url: string;
  timestamp: number;
  duration: number;
  saved: boolean;
  thumbnail?: string;
}

interface ClipRecorderProps {
  streamerId: string;
  onClipSaved?: (clipId: string) => void;
}

export const ClipRecorder: React.FC<ClipRecorderProps> = ({ streamerId, onClipSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [selectedClips, setSelectedClips] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'gallery' | 'preview'>('gallery');
  const [previewClip, setPreviewClip] = useState<Clip | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clipDurationRef = useRef(0);

  // Load clips from IndexedDB on mount
  useEffect(() => {
    loadClipsFromDB();
  }, [streamerId]);

  const loadClipsFromDB = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('clips', 'readonly');
      const store = tx.objectStore('clips');
      
      const allClips = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      // Filter by streamerId and convert blob back to URL
      const loadedClips = allClips
        .filter((c: any) => c.streamerId === streamerId)
        .map((c: any) => ({
          ...c,
          url: URL.createObjectURL(c.blob),
          blob: c.blob
        }));
      
      setClips(loadedClips);
    } catch (error) {
      console.error('Failed to load clips from IndexedDB:', error);
    }
  };

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ClipDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('clips')) {
          const store = db.createObjectStore('clips', { keyPath: 'id' });
          store.createIndex('streamerId', 'streamerId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const saveClipToDB = async (clip: Clip) => {
    try {
      const db = await openDB();
      const tx = db.transaction('clips', 'readwrite');
      const store = tx.objectStore('clips');
      await store.put({
        ...clip,
        streamerId,
        blob: clip.blob
      });
    } catch (error) {
      console.error('Failed to save clip to IndexedDB:', error);
    }
  };

  const deleteClipFromDB = async (clipId: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction('clips', 'readwrite');
      const store = tx.objectStore('clips');
      await store.delete(clipId);
    } catch (error) {
      console.error('Failed to delete clip from IndexedDB:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Get stream from video element or canvas
      const videoElement = document.querySelector('video');
      if (!videoElement) {
        alert('No video stream found. Start your stream first.');
        return;
      }

      const stream = videoElement.srcObject as MediaStream;
      if (!stream) {
        alert('No active stream. Go live first.');
        return;
      }

      mediaStreamRef.current = stream;
      recorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      chunksRef.current = [];
      clipDurationRef.current = 0;

      recorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newClip: Clip = {
          id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          blob,
          url,
          timestamp: Date.now(),
          duration: clipDurationRef.current,
          saved: false
        };
        
        setClips(prev => [newClip, ...prev]);
        saveClipToDB(newClip);
        chunksRef.current = [];
      };

      recorderRef.current.start();
      setIsRecording(true);

      // Stop automatically after 10 seconds
      recordingTimerRef.current = setInterval(() => {
        clipDurationRef.current += 1;
        if (clipDurationRef.current >= 10) {
          stopRecording();
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not start recording. Check console for details.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleSaveClip = async (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.saved) return;

    setIsSaving(clipId);
    try {
      const formData = new FormData();
      formData.append('clip', clip.blob, `clip_${clipId}.webm`);
      formData.append('streamerId', streamerId);
      formData.append('timestamp', clip.timestamp.toString());

      const response = await fetch('/api/save-clip', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      // Update local state
      setClips(prev => prev.map(c => 
        c.id === clipId ? { ...c, saved: true, url: data.url || c.url } : c
      ));

      // Update in IndexedDB
      const updatedClip = { ...clip, saved: true };
      await saveClipToDB(updatedClip);

      if (onClipSaved) onClipSaved(clipId);
      alert('Clip saved successfully!');

    } catch (error) {
      console.error('Failed to save clip:', error);
      alert('Failed to save clip. Check console for details.');
    } finally {
      setIsSaving(null);
    }
  };

  const handleDeleteClip = async (clipId: string) => {
    if (!window.confirm('Delete this clip?')) return;
    
    const clip = clips.find(c => c.id === clipId);
    if (clip) {
      URL.revokeObjectURL(clip.url);
    }
    
    setClips(prev => prev.filter(c => c.id !== clipId));
    await deleteClipFromDB(clipId);
  };

  const handleSaveSelected = async () => {
    const toSave = clips.filter(c => selectedClips.has(c.id) && !c.saved);
    if (toSave.length === 0) {
      alert('No unsaved clips selected.');
      return;
    }

    for (const clip of toSave) {
      await handleSaveClip(clip.id);
    }
    setSelectedClips(new Set());
  };

  const handleSelectAll = () => {
    const unsavedIds = clips.filter(c => !c.saved).map(c => c.id);
    setSelectedClips(new Set(unsavedIds));
  };

  const toggleSelect = (clipId: string) => {
    setSelectedClips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clipId)) {
        newSet.delete(clipId);
      } else {
        newSet.add(clipId);
      }
      return newSet;
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="clip-recorder-container">
      <div className="clip-header">
        <h3>🎬 Clip Recorder</h3>
        <div className="clip-actions">
          <button 
            onClick={startRecording} 
            disabled={isRecording}
            className={`btn-record ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏺ Recording...' : '🎥 Record Clip'}
          </button>
          {isRecording && (
            <button onClick={stopRecording} className="btn-stop">
              ⏹ Stop
            </button>
          )}
        </div>
      </div>

      {clips.length > 0 && (
        <div className="clip-toolbar">
          <span>{clips.filter(c => !c.saved).length} unsaved clips</span>
          <button onClick={handleSelectAll} className="btn-select-all">
            Select All Unsaved
          </button>
          <button 
            onClick={handleSaveSelected} 
            className="btn-save-selected"
            disabled={selectedClips.size === 0}
          >
            💾 Save Selected ({selectedClips.size})
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'gallery' ? 'preview' : 'gallery')}
            className="btn-toggle-view"
          >
            {viewMode === 'gallery' ? '📋 Grid View' : '📷 Gallery View'}
          </button>
        </div>
      )}

      <div className={`clips-grid ${viewMode === 'preview' ? 'preview-mode' : ''}`}>
        {clips.length === 0 ? (
          <div className="empty-clips">
            <p>No clips yet. Click "Record Clip" to capture a moment.</p>
          </div>
        ) : (
          clips.map(clip => (
            <div key={clip.id} className={`clip-item ${clip.saved ? 'saved' : ''}`}>
              <div className="clip-preview">
                <video 
                  src={clip.url} 
                  controls 
                  className="clip-video"
                  onClick={() => setPreviewClip(clip)}
                />
                <div className="clip-duration">
                  {clip.duration}s
                </div>
                {clip.saved && (
                  <div className="clip-saved-badge">✅ Saved</div>
                )}
              </div>
              <div className="clip-info">
                <span className="clip-time">{formatTime(clip.timestamp)}</span>
                <div className="clip-actions-row">
                  <input
                    type="checkbox"
                    checked={selectedClips.has(clip.id)}
                    onChange={() => toggleSelect(clip.id)}
                    disabled={clip.saved}
                    className="clip-checkbox"
                  />
                  {!clip.saved ? (
                    <>
                      <button 
                        onClick={() => handleSaveClip(clip.id)}
                        disabled={isSaving === clip.id}
                        className="btn-save-clip"
                      >
                        {isSaving === clip.id ? '⏳' : '💾'}
                      </button>
                      <button 
                        onClick={() => handleDeleteClip(clip.id)}
                        className="btn-delete-clip"
                      >
                        🗑
                      </button>
                    </>
                  ) : (
                    <span className="saved-label">Saved</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewClip && (
        <div className="clip-modal" onClick={() => setPreviewClip(null)}>
          <div className="clip-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewClip(null)}>✕</button>
            <video src={previewClip.url} controls autoPlay className="modal-video" />
            <div className="modal-info">
              <p>Duration: {previewClip.duration}s</p>
              <p>Saved: {previewClip.saved ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
