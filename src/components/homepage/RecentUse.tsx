import React from 'react';
import { Wallpaper } from '../../electron.d';
import { Skeleton } from '../objects/Skeleton';

interface Props {
  used: Wallpaper[];
  loading?: boolean;
}

const RecentUse = ({ used, loading }: Props) => {
  if (loading) {
    return (
      <div>
        <div className="section-header">
          <span className="section-title">Recently Used</span>
        </div>
        <div className="recents">
          {[...Array(4)].map((_, i) => (
            <div className="recent-card" key={i}>
              <Skeleton variant="rect" className="recent-thumb" />
              <Skeleton variant="text" style={{ width: '60%', marginTop: '8px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!used || used.length === 0) return null;

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Recently Used</span>
      </div>
      <div className="recents">
        {used.map((wallpaper, i) => (
          <div className="recent-card" key={wallpaper.id}>
            <div className={`recent-thumb ${i === 0 ? 'active' : ''}`}>
              {wallpaper.url ? (
                <img src={wallpaper.url} alt={wallpaper.filename} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }} />
              )}
              {i === 0 && <div className="active-indicator">ACTIVE</div>}
            </div>
            <div className="recent-label">{wallpaper.filename}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentUse;