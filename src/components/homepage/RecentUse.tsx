import React from 'react'

const RecentUse = () => {
  return (
    <div>
      <div className="section-header">
      <span className="section-title">Recently Used</span>
    </div>
    <div className="recents">
      <div className="recent-card">
        <div className="recent-thumb active" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }} >
          <div className="active-indicator">ACTIVE</div>
        </div>
        <div className="recent-label">Midnight</div>
      </div>
      <div className="recent-card">
        <div className="recent-thumb" style={{ background: "linear-gradient(135deg, #134e4a, #065f46)" }}></div>
        <div className="recent-label">Forest Deep</div>
      </div>
      <div className="recent-card">
        <div className="recent-thumb" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}></div>
        <div className="recent-label">Violet Storm</div>
      </div>
      <div className="recent-card">
        <div className="recent-thumb" style={{ background: "linear-gradient(135deg, #92400e, #78350f)" }}></div>
        <div className="recent-label">Amber Dusk</div>
      </div>
      <div className="recent-card">
        <div className="recent-thumb" style={{ background: "linear-gradient(135deg, #831843, #9d174d)" }}></div>
        <div className="recent-label">Rose Night</div>
      </div>
      <div className="recent-card">
        <div className="recent-thumb" style={{ background: "linear-gradient(135deg, #164e63, #0e7490)" }}></div>
        <div className="recent-label">Ocean Floor</div>
      </div>
    </div>
    </div>
  )
}


export default RecentUse