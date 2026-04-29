import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Check, X, Sparkles, Play } from "lucide-react";
import { Wallpaper, SlideshowSettings } from "../electron.d";
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
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [enhancementCount, setEnhancementCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isInSlideshow, setIsInSlideshow] = useState(false);

  useEffect(() => {
    if (id) {
      window.api.getWallpaper(id).then((res) => {
        setWallpaper(res);
        setEditName(res?.filename.replace(/\.[^/.]+$/, "") || "");
        setLoading(false);
      });
      window.api.getEnhancementCount().then((count: number) => {
        setEnhancementCount(count);
      });
      window.api.getSlideshowSettings().then((s: SlideshowSettings) => {
        setIsInSlideshow(s.selectedIds.includes(id));
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

  const toggleSlideshow = async () => {
    if (!id) return;
    if (isInSlideshow) {
      const res = await window.api.removeFromSlideshow(id);
      if (res.success) {
        setIsInSlideshow(false);
        toast.success("Removed from slideshow");
      }
    } else {
      // Check limit
      const s = await window.api.getSlideshowSettings();
      if (s.selectedIds.length >= 5) {
        toast.error("You can only have up to 5 wallpapers in your slideshow.");
        return;
      }
      const res = await window.api.addToSlideshow(id);
      if (res.success) {
        setIsInSlideshow(true);
        toast.success("Added to slideshow");
      }
    }
  };

  /* const handleAIEnhance = async () => {
    if (!id) return;
    if (enhancementCount >= 5) {
      toast.error("Enhancement limit (5) reached.");
      return;
    }
    
    setAiEnhancing(true);
    try {
      const result = await window.api.enhanceWallpaper(id);
      if (result.success) {
        toast.success("AI Analysis complete! ✨");
        // We update the local count if returned, or just increment
        setEnhancementCount(prev => result.count || prev + 1);
        setShowPreview(true);
      } else {
        toast.error(result.error || "AI Enhancement failed");
      }
    } catch (err) {
      toast.error("Connection to AI backend failed. Make sure it's running.");
    } finally {
      setAiEnhancing(false);
    }
  }; */

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
            {/* <div className="detail-enhancement-box">
              <Skeleton variant="title" style={{ width: '50%', marginBottom: '12px' }} />
              <Skeleton variant="text" style={{ width: '90%' }} />
              <Skeleton variant="text" style={{ width: '80%', marginBottom: '20px' }} />
              <Skeleton variant="rect" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
            </div> */}
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
          onSave={async (options) => {
             await window.api.optimizeWallpaper(id, options);
             setShowPreview(false);
             const updated = await window.api.getWallpaper(id);
             setWallpaper(updated);
             toast.success("Enhancement applied!");
          }} 
          onCancel={async () => {
            setShowPreview(false);
            await window.api.cancelEnhancement(id);
          }} 
        />
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

            <Button
              className={`slideshow-toggle-btn ${isInSlideshow ? 'active' : ''}`}
              onClick={toggleSlideshow}
            >
              <Play size={16} className={isInSlideshow ? 'filled' : ''} />
              {isInSlideshow ? "In Slideshow" : "Add to Slideshow"}
            </Button>

            {/* <div className="detail-enhancement-box">
              <div className="enhancement-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3>AI Image Enhancement</h3>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: enhancementCount >= 5 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {enhancementCount}/5 HD USES
                  </span>
                </div>
                <p>Sharpen and upscale your wallpaper using AI resolution super-scaling.</p>
              </div>
              
              <Button
                className={`secondary rounded-sm ${wallpaper.optimizedFile ? 'optimized' : ''}`}
                onClick={enhancementCount >= 5 ? () => toast.error("You've reached your 5 enhancement limit. Upgrade to Pro for unlimited access.") : handleAIEnhance}
                style={{ width: '100%', marginTop: '12px', opacity: enhancementCount >= 5 ? 0.6 : 1 }}
              >
                {aiEnhancing ? (
                  "Enhancing..."
                ) : (
                  <>
                    <Sparkles size={16} style={{ marginRight: '8px' }} />
                    {enhancementCount >= 5 ? "Limit Reached" : (wallpaper.optimizedFile ? "Enhance & Refresh" : "Enhance Image")}
                  </>
                )}
              </Button>
            </div> */}
        </div>
      </div>
    </div>
  );
}
