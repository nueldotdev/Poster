import React from 'react';
import { Wallpaper } from '../../electron.d';
import { Skeleton } from '../objects/Skeleton';

interface Props {
  wallpaper: Wallpaper | null;
  loading?: boolean;
}

const formatTimeAgo = (ts: number): string => {
  if (!ts) return 'Not set yet';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const CurrentBlock = ({ wallpaper, loading }: Props) => {
  if (loading) {
    return (
      <div className="current-strip">
        <Skeleton variant="rect" className="current-thumb" />
        <div className="current-info flex flex-col" style={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="text" style={{ width: '80px', marginBottom: '8px' }} />
          <Skeleton variant="title" style={{ width: '150px' }} />
          <Skeleton variant="text" style={{ width: '100px', marginTop: '4px' }} />
        </div>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="current-strip">
        <div className="current-thumb" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
        <div className="current-info">
          <div className="current-label">Currently Active</div>
          <div className="current-name" style={{ color: 'var(--text-muted)' }}>No wallpaper set yet</div>
          <div className="current-meta">Set a wallpaper from your collection below</div>
        </div>
      </div>
    );
  }

  return (
    <div className="current-strip">
      {wallpaper.url ? (
        <img className="current-thumb" src={wallpaper.url} alt={wallpaper.filename} style={{ objectFit: 'cover' }} />
      ) : (
        <div className="current-thumb" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }} />
      )}
      <div className="current-info flex flex-col" style={{ minWidth: 0, flex: 1 }}>
        <div className="current-label">Currently Active</div>
        <div className="current-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {wallpaper.filename.replace(/\.[^/.]+$/, "")}
        </div>
        <div className="current-meta">Set {formatTimeAgo(wallpaper.addedAt)}</div>
      </div>
      <div className="current-actions">
        <button className="chip filled">Set Again</button>
      </div>
    </div>
  );
};

export default CurrentBlock;