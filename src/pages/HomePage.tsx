import React, { useState, useEffect } from "react";
import "../styles/page.css";
import CurrentBlock from "../components/homepage/CurrentBlock";
import RecentUse from "../components/homepage/RecentUse";
import Collection from "../components/Collection";
import { Wallpaper } from "../electron.d";
import { toast } from "sonner";

export default function HomePage() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [mostRecent, setMostRecent] = useState<Wallpaper | null>(null);
  const [used, setUsed] = useState<Wallpaper[]>([]);
  const [setting, setSetting] = useState<string | null>(null);

  const fetchWallpapers = () => {
    window.api.getWallpapers().then((res) => {
      setWallpapers(res.wallpapers);
      if (res.recents?.most_recent?.file) {
        setMostRecent(res.recents.most_recent);
      }
      setUsed(res.recents?.used ?? []);
    });
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const handleSet = async (wallpaper: Wallpaper) => {
    setSetting(wallpaper.id);
    const result = await window.api.setWallpaper(wallpaper);
    if (result.success) {
      toast.success(`${wallpaper.filename} set as wallpaper`);
      fetchWallpapers();
    } else {
      toast.error("Failed to set wallpaper");
    }
    setSetting(null);
  };

  return (
    <div className="page-container slide-up fade-in">
      <CurrentBlock wallpaper={mostRecent} />
      {used.length > 0 && <RecentUse used={used} />}
      <div className="w-full">
        <Collection onSetWallpaper={handleSet} />
      </div>
    </div>
  );
}
