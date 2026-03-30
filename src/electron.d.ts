export interface ElectronAPI {
  setWallpaper: (path: string) => Promise<{ success: boolean }>
  getWallpapers: () => Promise<string[]>
  onWallpaperChanged: (cb: (path: string) => void) => void
  setOnboarded: () => Promise<{ success: boolean }>
  getOnboarded: () => Promise<boolean>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}