import React from "react";
import Collection from "../components/Collection";
import { toast } from "sonner";
import { Wallpaper } from "../electron.d";

const FavoritesPage = () => {
  const handleSet = async (wallpaper: Wallpaper) => {
    const result = await window.api.setWallpaper(wallpaper);
    if (result.success) {
      toast.success(`${wallpaper.filename} set as wallpaper`);
    } else {
      toast.error("Failed to set wallpaper");
    }
  };

  return (
    <div className="page-container slide-up fade-in">
      <Collection onSetWallpaper={handleSet} favoritesOnly={true} />
    </div>
  );
};

export default FavoritesPage;
