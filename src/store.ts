import Store from "electron-store";
import { Wallpaper } from "./electron.d";
class OurStore {
  private store = new Store<{
    onboarded: boolean;
    name: string;
    wallpapers: Wallpaper[];
    recents: { most_recent: Wallpaper; used: Wallpaper[] };
  }>({
    defaults: {
      onboarded: false,
      name: "",
      wallpapers: [],
      recents: {
        most_recent: { id: "", filename: "", file: "", addedAt: 0 },
        used: [],
      },
    },
  });

  public set(name: string, value: any): unknown {
    try {
      return this.store.set(name, value);
    } catch (error) {
      return {error}
    }
  }
  
  public get(name: string) {
    return this.store.get(name);
  }
  
}


export const store = new OurStore

