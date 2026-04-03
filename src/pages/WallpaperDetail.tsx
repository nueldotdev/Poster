import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Check, X } from "lucide-react";
import { Wallpaper } from "../electron.d";
import { Button } from "../components/objects/Button";
import { toast } from "sonner";
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
      <div className="page-container flex items-center justify-center">
        <p style={{ color: "var(--text-muted)" }}>Loading wallpaper...</p>
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

          <div className="detail-actions-wrapper">
            <Button
              className="primary detail-set-btn"
              onClick={handleSet}
              disabled={setting}
            >
              {setting ? "Setting Wallpaper..." : "Set as Wallpaper"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
