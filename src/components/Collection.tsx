import { useEffect, useRef, useState } from "react";
import { Grid2X2, List, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Wallpaper } from "../electron.d";
import "../styles/components/wallpapercollection.css";
import { Button } from "./objects/Button";

type ViewMode = "gallery" | "list";
const LIMIT = 20;

export default function WallpaperCollection() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [view, setView] = useState<ViewMode>("gallery");
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWallpapers(0)
  }, []);

  const loadWallpapers = async (currentOffset: number) => {
    if (loading && currentOffset > 0) return
    setLoading(true);
    const result = await window.api.getWallpapers(currentOffset, LIMIT);
    setTotal(result.total);
    setWallpapers((prev) =>
      currentOffset === 0 ? result.wallpapers : [...prev, ...result.wallpapers]
    );
    setLoading(false);
  };

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && wallpapers.length < total && !loading) {
          const newOffset = offset + LIMIT;
          setOffset(newOffset);
          loadWallpapers(newOffset);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [wallpapers.length, total, offset, loading]);

  const handleImport = async () => {
    const result = await window.api.importWallpapers();
    if (result.success) {
      setOffset(0);
      await loadWallpapers(0);
      toast.success(
        `${result.wallpapers.length} wallpaper${result.wallpapers.length > 1 ? "s" : ""} imported`
      );
    }
  };

  const handleSet = async (wallpaper: Wallpaper) => {
    setSetting(wallpaper.id);
    const result = await window.api.setWallpaper(wallpaper.file);
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
          <h2 className="collection-title">Uploads</h2>
          {total > 0 && (
            <span className="collection-count">{total}</span>
          )}
        </div>
        <div className="flex items-center gap-8">
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
          <Button className="rounded-sm primary" size="md" onClick={handleImport}>
            <PlusIcon size={18} />
          </Button>
        </div>
      </div>

      {/* empty state */}
      {!loading && wallpapers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Grid2X2 size={28} strokeWidth={1} />
          </div>
          <h3 className="empty-title">Your library is empty</h3>
          <p className="empty-sub">Import some wallpapers to get started</p>
        </div>
      )}

      {/* gallery view */}
      {view === "gallery" && wallpapers.length > 0 && (
        <div className="wall-grid">
          {wallpapers.map((w) => (
            <div key={w.id} className="wall-card">
              <img src={w.url} alt={w.filename} className="wall-img" />
              <div className="wall-overlay">
                <div className="wall-actions">
                  <button
                    className="wall-btn set"
                    onClick={() => handleSet(w)}
                    disabled={setting === w.id}
                  >
                    {setting === w.id ? "..." : "Set"}
                  </button>
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
            <div key={w.id} className="wall-list-item flex items-center gap-12">
              <img src={w.url} alt={w.filename} className="wall-list-thumb" />
              <div className="flex flex-col" style={{ flex: 1 }}>
                <span className="wall-list-name">
                  {w.filename.replace(/\.[^/.]+$/, "")}
                </span>
                <span className="wall-list-date">
                  {new Date(w.addedAt).toLocaleDateString()}
                </span>
              </div>
              <button
                className="wall-btn set"
                onClick={() => handleSet(w)}
                disabled={setting === w.id}
              >
                {setting === w.id ? "..." : "Set"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* infinite scroll sentinel */}
      <div ref={loaderRef} style={{ height: 40, marginTop: 16 }}>
        {loading && wallpapers.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-hint)" }}>
            Loading...
          </p>
        )}
      </div>
    </div>
  );
}