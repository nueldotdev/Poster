import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Check, X } from "lucide-react";
import { Wallpaper, OptimizeOptions } from "../electron.d";
import { Button } from "../components/objects/Button";
import { WallpaperPreview } from "../components/WallpaperPreview";
import { toast } from "sonner";
import { Skeleton } from "../components/objects/Skeleton";
import "../styles/pages/wallpaperdetail.css";

export default function WallpaperDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      window.api.getWallpaper(id).then((res) => {
        setWallpaper(res);
        setEditName(res?.filename.replace(/\.[^/.]+$/, "") || "");
        setLoading(false);
      });
    }
  }, [id]);

  const handleSet = async () => {
    if (!wallpaper) return;
    setSetting(true);
    const result = await window.api.setWallpaper(wallpaper);
    if (result.success) {
      toast.success(`${wallpaper.filename} set as wallpaper`);
    } else {
      toast.error("Failed to set wallpaper");
    }
    setSetting(false);
  };

  const handleOptimize = async (options?: OptimizeOptions) => {
    if (!id) return;
    setOptimizing(true);
    setShowPreview(false);
    setShowConfirm(false);
    const result = await window.api.optimizeWallpaper(id, options);
    if (result.success) {
      toast.success("Wallpaper optimized for your monitor!");
      // Refresh wallpaper data
      const updated = await window.api.getWallpaper(id);
      setWallpaper(updated);
    } else {
      toast.error("Optimization failed");
    }
    setOptimizing(false);
  };

  const startEnhancement = () => {
    setShowConfirm(true);
  };

  const handleRename = async () => {
    if (!wallpaper || !id) return;
    const newName = editName.trim() ? editName.trim() : wallpaper.filename;
    
    // Attempt to keep extension
    const ext = wallpaper.filename.includes('.') ? '.' + wallpaper.filename.split('.').pop() : '';
    const nameWithExt = newName.endsWith(ext) ? newName : newName + ext;

    const result = await window.api.renameWallpaper(id, nameWithExt);
    if (result.success) {
      setWallpaper({ ...wallpaper, filename: nameWithExt });
      setIsEditing(false);
      toast.success("Wallpaper renamed");
    } else {
      toast.error("Failed to rename wallpaper");
    }
  };

  if (loading) {
    return (
      <div className="page-container wallpaper-detail-page">
        <div className="detail-header" style={{ marginBottom: '24px' }}>
          <Skeleton variant="circle" style={{ width: '40px', height: '40px' }} />
        </div>
        <div className="detail-content">
          <div className="detail-image-col">
            <Skeleton variant="rect" className="detail-image-wrapper" style={{ height: '500px' }} />
          </div>
          <div className="detail-info-col">
            <Skeleton variant="title" style={{ width: '70%', height: '40px', marginBottom: '16px' }} />
            <Skeleton variant="text" style={{ width: '40%', marginBottom: '32px' }} />
            <Skeleton variant="rect" style={{ width: '100%', height: '56px', borderRadius: '12px', marginBottom: '24px' }} />
            <div className="detail-enhancement-box">
              <Skeleton variant="title" style={{ width: '50%', marginBottom: '12px' }} />
              <Skeleton variant="text" style={{ width: '90%' }} />
              <Skeleton variant="text" style={{ width: '80%', marginBottom: '20px' }} />
              <Skeleton variant="rect" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="page-container flex flex-col items-center justify-center gap-12">
        <p style={{ color: "var(--text-muted)" }}>Wallpaper not found</p>
        <Button className="secondary rounded-sm" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="page-container wallpaper-detail-page slide-up fade-in">
      {showPreview && id && (
        <WallpaperPreview 
          id={id} 
          onSave={(options) => handleOptimize(options)} 
          onCancel={() => setShowPreview(false)} 
        />
      )}

      {showConfirm && (
        <div 
          className="fade-in" 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 
          }}
        >
          <div 
            className="slide-up" 
            style={{ 
              background: 'var(--surface)', padding: '40px', borderRadius: '24px', 
              maxWidth: '400px', width: '90%', textAlign: 'center', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)' 
            }}
          >
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>Enhance Image?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Would you like to preview the enhancement and adjust settings before saving?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                className="primary rounded-sm" 
                style={{ padding: '16px' }}
                onClick={() => {
                  setShowConfirm(false);
                  setShowPreview(true);
                }}
              >
                Yes, Preview & Customize
              </Button>
              <Button 
                className="secondary rounded-sm" 
                style={{ padding: '16px' }}
                onClick={() => handleOptimize()}
              >
                No, Just Auto-Enhance
              </Button>
              <button 
                className="btn-transparent"
                style={{ marginTop: '8px', color: 'var(--text-muted)', fontWeight: 500 }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="detail-header" style={{ display: 'flex', width: '100%', marginBottom: '24px' }}>
        <button 
          className="btn-transparent" 
          onClick={() => navigate(-1)} 
          style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={24} color="var(--text-primary)" />
        </button>
      </div>

      <div className="detail-content">
        {/* Left Side: Image */}
        <div className="detail-image-col">
          <div className="detail-image-wrapper">
            <img src={wallpaper.url} alt={wallpaper.filename} />
          </div>
        </div>

        {/* Right Side: Info & Actions */}
        <div className="detail-info-col">
          <div className="detail-info-header">
            
            <div className="detail-info-row">
              {isEditing ? (
                <div className="detail-edit-group">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="detail-title-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") {
                        setIsEditing(false);
                        setEditName(wallpaper.filename.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                  />
                  <div className="btn-transparent" onClick={handleRename}>
                    <Check size={20} style={{ margin: 2 }} color="var(--text-primary)" />
                  </div>
                  <div className="btn-transparent" onClick={() => {
                        setIsEditing(false);
                        setEditName(wallpaper.filename.replace(/\.[^/.]+$/, ""));
                  }}>
                    <X size={20} style={{ margin: 2 }} color="var(--text-muted)" />
                  </div>
                </div>
              ) : (
                <div className="detail-info-row group" style={{ cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
                  <h1 className="detail-name-display">
                     {wallpaper.filename.replace(/\.[^/.]+$/, "")}
                  </h1>
                  <div className="btn-transparent hover-show" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}>
                    <Edit3 size={18} color="var(--text-muted)" />
                  </div>
                </div>
              )}
            </div>
            <span className="detail-meta-text">Uploaded on {new Date(wallpaper.addedAt).toLocaleDateString()}</span>
          </div>

            <Button
              className="primary detail-set-btn"
              onClick={handleSet}
              disabled={setting}
            >
              {setting ? "Setting Wallpaper..." : "Set as Wallpaper"}
            </Button>

            <div className="detail-enhancement-box">
              <div className="enhancement-info">
                <h3>Image Enhancement</h3>
                <p>Resize and sharpen this image for your monitor's resolution.</p>
              </div>
              <Button
                className={`secondary rounded-sm ${wallpaper.optimizedFile ? 'optimized' : ''}`}
                onClick={startEnhancement}
                disabled={optimizing}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {optimizing ? "Optimizing..." : wallpaper.optimizedFile ? "Optimized ✨ Refresh" : "✨ Enhance & Optimize"}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
