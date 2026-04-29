import React, { useEffect, useState } from "react";
import { Play, Pause, Clock, Trash2, Plus } from "lucide-react";
import { Button } from "../components/objects/Button";
import { Wallpaper, SlideshowSettings } from "../electron.d";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../styles/pages/slideshow.css";

const SlideshowPage = () => {
  const [settings, setSettings] = useState<SlideshowSettings | null>(null);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [intervalInput, setIntervalInput] = useState<string>("60");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await window.api.getSlideshowSettings();
    setSettings(s);
    setIntervalInput(s.interval.toString());

    if (s.selectedIds.length > 0) {
      const allRes = await window.api.getWallpapers(0, 1000);
      const selected = allRes.wallpapers.filter(w => s.selectedIds.includes(w.id));
      setWallpapers(selected);
    } else {
      setWallpapers([]);
    }
  };

  const handleToggle = async () => {
    if (!settings) return;
    
    if (!settings.enabled && settings.selectedIds.length < 3) {
      toast.error("Please select at least 3 wallpapers to start the slideshow.");
      return;
    }

    const res = await window.api.toggleSlideshow();
    if (res.success) {
      setSettings({ ...settings, enabled: res.enabled });
      toast.success(res.enabled ? "Slideshow started!" : "Slideshow stopped.");
    }
  };

  const handleIntervalChange = async () => {
    const val = parseInt(intervalInput);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid number of minutes.");
      return;
    }

    const res = await window.api.updateSlideshowSettings({ interval: val });
    if (res.success) {
      setSettings(prev => prev ? { ...prev, interval: val } : null);
      toast.success("Rotation interval updated.");
    }
  };

  const removeWallpaper = async (id: string) => {
    const res = await window.api.removeFromSlideshow(id);
    if (res.success) {
      setWallpapers(prev => prev.filter(w => w.id !== id));
      setSettings(prev => prev ? { ...prev, selectedIds: prev.selectedIds.filter(sid => sid !== id) } : null);
      toast.success("Removed from slideshow");
    }
  };

  if (!settings) return null;

  return (
    <div className="page-container slide-up fade-in">
      <div className="slideshow-header">
        <div>
          <h1 className="slideshow-title">Slideshow</h1>
          <p className="slideshow-subtitle">Rotate your favorite wallpapers automatically.</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            className={settings.enabled ? 'secondary' : 'primary'} 
            onClick={handleToggle}
          >
            {settings.enabled ? (
              <><Pause size={18} /> Stop Slideshow</>
            ) : (
              <><Play size={18} /> Start Slideshow</>
            )}
          </Button>
        </div>
      </div>

      <div className="slideshow-grid">
        <div className="slideshow-card">
          <div className="card-header">
            <Clock size={20} className="card-icon" />
            <h3>Interval</h3>
          </div>
          <p className="card-description">How often should the wallpaper change?</p>
          <div className="interval-input-group">
            <div className="interval-input-wrapper">
              <input 
                type="number" 
                value={intervalInput}
                onChange={(e) => setIntervalInput(e.target.value)}
                placeholder="Minutes"
              />
              <span className="interval-unit">min</span>
            </div>
            <Button className="secondary" onClick={handleIntervalChange}>Apply</Button>
          </div>
        </div>

        <div className="slideshow-card wide">
          <div className="selection-header">
            <h3 className="font-semibold text-lg">Selected Wallpapers ({wallpapers.length}/5)</h3>
            {wallpapers.length < 5 && (
              <Button className="secondary" onClick={() => navigate('/app/')}>
                <Plus size={16} /> Add More
              </Button>
            )}
          </div>
          
          {wallpapers.length === 0 ? (
            <div className="empty-selection">
              No wallpapers selected. Add between 3 and 5 to start.
            </div>
          ) : (
            <div className="thumbnails-list">
              {wallpapers.map(w => (
                <div key={w.id} className="thumbnail-item">
                  <img 
                    src={w.url} 
                    className="thumbnail-img" 
                    alt={w.filename} 
                  />
                  <button 
                    className="remove-thumb-btn"
                    onClick={() => removeWallpaper(w.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {settings.enabled && (
        <div className="slideshow-status-banner">
          <div className="status-dot" />
          <p className="text-sm font-medium">The slideshow is currently running in the background. You can close the app to the system tray.</p>
        </div>
      )}
    </div>
  );
};

export default SlideshowPage;