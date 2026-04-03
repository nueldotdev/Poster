import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Maximize2, Sun, Palette, RotateCw, Loader2, Settings, ChevronDown } from 'lucide-react';
import { Button } from './objects/Button';
import { OptimizeOptions } from '../electron.d';
import '../styles/components/wallpaperpreview.css';

interface WallpaperPreviewProps {
  id: string;
  onSave: (options: OptimizeOptions) => void;
  onCancel: () => void;
}

export const WallpaperPreview: React.FC<WallpaperPreviewProps> = ({ id, onSave, onCancel }) => {
  const [options, setOptions] = useState<OptimizeOptions>({
    fit: 'cover',
    position: 'center',
    brightness: 1.05,
    saturation: 1.15,
    rotate: 0
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPreview = async (currentOptions: OptimizeOptions) => {
    setLoading(true);
    try {
      const result = await window.api.previewWallpaper(id, currentOptions);
      if (result.success && result.url) {
        setPreviewUrl(result.url);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce preview updates to avoid spamming the backend
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Initial load is immediate, subsequent are debounced
    if (!previewUrl) {
      fetchPreview(options);
    } else {
      timerRef.current = setTimeout(() => {
        fetchPreview(options);
      }, 300);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [options, id]);

  const handleOptionChange = (newOptions: Partial<OptimizeOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  };

  return (
    <div className="wallpaper-preview-overlay fade-in">
      <div className="preview-background">
        {previewUrl && (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="full-preview-image" 
            style={{ opacity: loading ? 0.7 : 1 }}
          />
        )}
        
        {loading && (
          <div className="preview-loader-overlay">
            <div className="preview-loader-content">
              <Loader2 className="spin" size={20} />
              <span>Updating Preview...</span>
            </div>
          </div>
        )}
      </div>  

      <Button 
        className={`preview-controls-toggle ${showControls ? 'rotate-180' : ''}`} 
        onClick={() => setShowControls(!showControls)}
        title={showControls ? "Hide Controls" : "Show Controls"}
        size="md"
      >
        <ChevronDown size={24} />
      </Button>

      <div className={`preview-controls-container ${showControls ? '' : 'hidden'}`}>
        <div className="preview-controls-header">
          <h2>Enhancement Preview</h2>
          <button className="btn-close" onClick={onCancel}><X size={20} /></button>
        </div>

        <div className="preview-controls-content">
          <div className="control-group">
            <label><Maximize2 size={16} /> Fit Mode</label>
            <div className="control-buttons">
              {['cover', 'contain', 'fill'].map((mode) => (
                <button 
                  key={mode}
                  className={options.fit === mode ? 'active' : ''} 
                  onClick={() => handleOptionChange({ fit: mode as any })}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label><RotateCw size={16} /> Orientation</label>
            <div className="control-buttons">
              {[0, 90, 180, 270].map((deg) => (
                <button 
                  key={deg}
                  className={options.rotate === deg ? 'active' : ''} 
                  onClick={() => handleOptionChange({ rotate: deg })}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label><Sun size={16} /> Brightness ({options.brightness?.toFixed(2)})</label>
            <input 
              type="range" min="0.5" max="1.5" step="0.05" 
              value={options.brightness} 
              onChange={(e) => handleOptionChange({ brightness: parseFloat(e.target.value) })}
            />
          </div>

          <div className="control-group">
            <label><Palette size={16} /> Saturation ({options.saturation?.toFixed(2)})</label>
            <input 
              type="range" min="0.5" max="2.0" step="0.05" 
              value={options.saturation} 
              onChange={(e) => handleOptionChange({ saturation: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="preview-actions">
          <Button className="secondary rounded-sm" onClick={onCancel}>Cancel</Button>
          <Button className="primary rounded-sm" onClick={() => onSave(options)}>
            <Check size={18} style={{ marginRight: '8px' }} />
            Apply Enhancement
          </Button>
        </div>
      </div>
    </div>
  );
};

