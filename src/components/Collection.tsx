import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid2X2, List, PlusIcon, Heart } from "lucide-react";
import { toast } from "sonner";
import { Wallpaper } from "../electron.d";
import "../styles/components/wallpapercollection.css";
import { Button } from "./objects/Button";
import { Skeleton } from "./objects/Skeleton";

type ViewMode = "gallery" | "list";
const LIMIT = 20;

interface CollectionProps {
  onSetWallpaper: (wallpaper: Wallpaper) => void;
  favoritesOnly?: boolean;
}

export default function WallpaperCollection({
  onSetWallpaper,
  favoritesOnly = false,
}: CollectionProps) {
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [view, setView] = useState<ViewMode>("gallery");
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWallpapers(0);
  }, []);

  const loadWallpapers = async (currentOffset: number) => {
    // Prevent multiple concurrent loads
    if (loading && currentOffset > 0) return;
    
    // Only set main loading if it's the first page
    if (currentOffset === 0) setLoading(true);
    
    try {
      const result = await window.api.getWallpapers(currentOffset, LIMIT, favoritesOnly);
      setTotal(result.total);
      setWallpapers((prev) =>
        currentOffset === 0 ? result.wallpapers : [...prev, ...result.wallpapers],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, wallpaper: Wallpaper) => {
    e.stopPropagation();
    const result = await window.api.toggleFavorite(wallpaper.id);
    if (result.success) {
      setWallpapers(prev => prev.map(w =>
        w.id === wallpaper.id ? { ...w, isFavorite: result.isFavorite } : w
      ));
      if (favoritesOnly && !result.isFavorite) {
        setWallpapers(prev => prev.filter(w => w.id !== wallpaper.id));
        setTotal(prev => prev - 1);
      }
    }
  };

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          wallpapers.length < total &&
          !loading
        ) {
          const newOffset = offset + LIMIT;
          setOffset(newOffset);
          loadWallpapers(newOffset);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [wallpapers.length, total, offset, loading, favoritesOnly]);

  const handleImport = async () => {
    const result = await window.api.importWallpapers();
    if (result.success) {
      setOffset(0);
      await loadWallpapers(0);
      toast.success(
        `${result.wallpapers.length} wallpaper${result.wallpapers.length > 1 ? "s" : ""} imported`,
      );
    }
  };

  const handleSet = async (wallpaper: Wallpaper) => {
    setSetting(wallpaper.id);
    const result = await window.api.setWallpaper(wallpaper);
    if (result.success) {
      toast.success(`${wallpaper.filename} set as wallpaper`);
    } else {
      toast.error("Failed to set wallpaper");
    }

    setSetting(null);
  };

  return (
    <div className="collection">
      {/* header */}
      <div className="collection-header mb-16 w-full">
        <div className="flex items-center gap-8">
          <h2 className="collection-title">{favoritesOnly ? "Favorites" : "Uploads"}</h2>
          {total > 0 && <span className="collection-count">{total}</span>}
        </div>
        <div className="flex items-center gap-8 mb-auto">
          <div className="view-toggle flex items-center">
            <Button
              className="rounded-sm secondary"
              onClick={() => setView("gallery")}
              size="md"
            >
              <Grid2X2
                size={15}
                strokeWidth={1.5}
                className="toggle-icon"
                color={view === "gallery" ? "#1a1916" : "#6b6760"}
              />
            </Button>
            <Button
              className="rounded-sm secondary"
              onClick={() => setView("list")}
              size="md"
            >
              <List
                size={15}
                strokeWidth={1.5}
                className="toggle-icon"
                color={view === "list" ? "#1a1916" : "#6b6760"}
              />
            </Button>
          </div>
          {!favoritesOnly && (
            <Button
              className="rounded-sm primary"
              size="md"
              onClick={handleImport}
            >
              <PlusIcon size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* empty state */}
      {!loading && wallpapers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Grid2X2 size={28} strokeWidth={1} />
          </div>
          <h3 className="empty-title">
            {favoritesOnly ? "No favorites yet" : "Your library is empty"}
          </h3>
          <p className="empty-sub">
            {favoritesOnly
              ? "Heart some wallpapers to see them here"
              : "Import some wallpapers to get started"}
          </p>
        </div>
      )}

      {/* loading skeleton gallery */}
      {loading && wallpapers.length === 0 && view === "gallery" && (
        <div className="wall-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="wall-card">
              <Skeleton variant="rect" className="wall-img" style={{ height: '240px' }} />
            </div>
          ))}
        </div>
      )}

      {/* loading skeleton list */}
      {loading && wallpapers.length === 0 && view === "list" && (
        <div className="wall-list">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="wall-list-item flex items-center gap-12">
              <Skeleton variant="rect" className="wall-list-thumb" style={{ width: '80px', height: '50px' }} />
              <div className="flex flex-col" style={{ flex: 1 }}>
                <Skeleton variant="title" style={{ width: '40%' }} />
                <Skeleton variant="text" style={{ width: '20%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* gallery view */}
      {view === "gallery" && wallpapers.length > 0 && (
        <div className="wall-grid">
          {wallpapers.map((w) => (
            <div key={w.id} className="wall-card" onClick={() => navigate(`/app/wallpaper/${w.id}`)}>
              <img src={w.url} alt={w.filename} className="wall-img" />

              <div className="wall-overlay">
                <div className="wall-actions">
                  <Button
                    className={`wall-btn ${w.isFavorite ? 'liked' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, w)}
                    // style={{ opacity: w.isFavorite ? 1 : undefined }}
                    size="md"
                  >
                    <Heart size={13} fill={w.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    className="wall-btn set"
                    onClick={(e) => { e.stopPropagation(); onSetWallpaper(w); }}
                    disabled={setting === w.id}
                    size="md"
                  >
                    {setting === w.id ? "..." : "Use"}
                  </Button>
                </div>
                <div className="wall-name">
                  {w.filename.replace(/\.[^/.]+$/, "")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* list view */}
      {view === "list" && wallpapers.length > 0 && (
        <div className="wall-list">
          {wallpapers.map((w) => (
            <div key={w.id} className="wall-list-item flex items-center gap-12" onClick={() => navigate(`/app/wallpaper/${w.id}`)} style={{ cursor: 'pointer' }}>
              <img src={w.url} alt={w.filename} className="wall-list-thumb" />
              <div className="flex flex-col" style={{ flex: 1 }}>
                <span className="wall-list-name">
                  {w.filename.replace(/\.[^/.]+$/, "")}
                </span>
                <span className="wall-list-date">
                  {new Date(w.addedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="wall-actions">
                  <Button
                    className={`wall-btn ${w.isFavorite ? 'liked' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, w)}
                    // style={{ opacity: w.isFavorite ? 1 : undefined }}
                    size="md"
                  >
                    <Heart size={13} fill={w.isFavorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    className="wall-btn set"
                    onClick={(e) => { e.stopPropagation(); onSetWallpaper(w); }}
                    disabled={setting === w.id}
                    size="md"
                  >
                    {setting === w.id ? "..." : "Use"}
                  </Button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* infinite scroll sentinel */}
      <div ref={loaderRef} style={{ height: 40, marginTop: 16 }}>
        {loading && wallpapers.length > 0 && (
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "var(--text-hint)",
            }}
          >
            Loading...
          </p>
        )}
      </div>
    </div>
  );
}
