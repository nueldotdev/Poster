import Store from "electron-store";
import { Wallpaper } from "./electron.d";
class OurStore {
  private store = new Store<{
    onboarded: boolean;
    name: string;
    isPro: boolean;
    enhancementCount: number;
    wallpapers: Wallpaper[];
    boards: { id: string, name: string, wallpaperIds: string[] }[];
    recents: { most_recent: Wallpaper; used: Wallpaper[] };
  }>({
    defaults: {
      onboarded: false,
      name: "",
      isPro: false,
      enhancementCount: 0,
      wallpapers: [],
      boards: [],
      recents: {
        most_recent: { id: "", filename: "", file: "", addedAt: 0 },
        used: [],
      },
    },
  });

  public set(name: string, value: any): unknown {
    try {
      return (this.store as any).set(name, value);
    } catch (error) {
      return {error}
    }
  }
  
  public get(name: string) {
    return (this.store as any).get(name);
  }

  public all() {
    return this.store.store;
  }
  
}


export const store = new OurStore

