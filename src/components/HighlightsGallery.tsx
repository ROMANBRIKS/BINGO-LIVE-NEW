import React, { useState, useEffect } from 'react';
import './HighlightsGallery.css';

interface Highlight {
  id: string;
  streamerId: string;
  url: string;
  timestamp: number;
  duration: number;
}

export const HighlightsGallery = ({ streamerId }: { streamerId: string }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, [streamerId]);

  const fetchHighlights = async () => {
    try {
      const response = await fetch(`/api/highlights/${streamerId}`);
      if (!response.ok) throw new Error('Failed to load highlights');
      const data = await response.json();
      setHighlights(data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-slate-400 text-xs">Loading highlights...</div>;

  return (
    <div className="highlights-gallery">
      <h3>🌟 Highlights</h3>
      {highlights.length === 0 ? (
        <p className="empty">No highlights yet.</p>
      ) : (
        <div className="highlights-grid">
          {highlights.map(h => (
            <div key={h.id} className="highlight-item">
              <video src={h.url} controls className="highlight-video" />
              <span className="highlight-time">
                {new Date(h.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
