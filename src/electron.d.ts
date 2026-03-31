export interface ElectronAPI {
  setWallpaper: (path: string) => Promise<{ success: boolean }>
  getWallpapers: () => Promise<string[]>
  onWallpaperChanged: (cb: (path: string) => void) => void
  
  setOnboarded: (onboarded: boolean) => Promise<{ success: boolean }>
  getOnboarded: () => Promise<boolean>

  setName: (name: string) => Promise<{success: boolean, name: string}>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}