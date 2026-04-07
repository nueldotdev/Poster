import React, { useState, useEffect } from "react";
import "../styles/page.css";
import CurrentBlock from "../components/homepage/CurrentBlock";
import RecentUse from "../components/homepage/RecentUse";
import Collection from "../components/Collection";
import { Wallpaper } from "../electron.d";
import { toast } from "sonner";

export default function HomePage() {
  const [mostRecent, setMostRecent] = useState<Wallpaper | null>(null);
  const [used, setUsed] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecents = () => {
    setLoading(true);
    window.api.getWallpapers(0, 1).then((res) => {
      if (res.recents?.most_recent?.file) {
        setMostRecent(res.recents.most_recent);
      }
      setUsed(res.recents?.used ?? []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRecents();
  }, []);

  const handleSet = async (wallpaper: Wallpaper) => {
    const result = await window.api.setWallpaper(wallpaper);
    if (result.success) {
      toast.success(`${wallpaper.filename} set as wallpaper`);
      fetchRecents();
    } else {
      toast.error(result.error || "Failed to set wallpaper");
      console.log(result.error);
    }
  };

  return (
    <div className="page-container slide-up fade-in">
      <CurrentBlock wallpaper={mostRecent} loading={loading} />
      {(used.length > 0 || loading) && <RecentUse used={used} loading={loading} />}
      <div className="w-full">
        <Collection onSetWallpaper={handleSet} />
      </div>
    </div>
  );
}
