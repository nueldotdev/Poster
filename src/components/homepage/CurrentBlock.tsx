import React from 'react'

const CurrentBlock = () => {
  return (
    <div className="current-strip">
      <div className="current-thumb" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}></div>
      <div className="current-info">
        <div className="current-label">Currently Active</div>
        <div className="current-name">Midnight Gradient</div>
        <div className="current-meta">Set 2 days ago · Minimal & Dark board</div>
      </div>
      <div className="current-actions">
        <button className="chip">Change Desktop</button>
        <button className="chip">Change Lock Screen</button>
        <button className="chip filled">Set Both</button>
      </div>
    </div>
  )
}

export default CurrentBlock