export interface ElectronAPI {
  importWallpapers: () => Promise<{ success: boolean, wallpapers: Wallpaper[] }>
  getWallpapers: (offset?: number, limit?: number) => Promise<{ total: number, wallpapers: Wallpaper[], recents: { most_recent: Wallpaper, used: Wallpaper[] } }>
  setWallpaper: (wallpaper: Wallpaper) => Promise<{ success: boolean }>
  getWallpaper: (id: string) => Promise<Wallpaper | null>
  renameWallpaper: (id: string, newName: string) => Promise<{ success: boolean, name?: string }>

  setOnboarded: (onboarded: boolean) => Promise<{ success: boolean }>
  getOnboarded: () => Promise<boolean>

  setName: (name: string) => Promise<{success: boolean, name: string}>
}

interface Wallpaper {
  id: string
  filename: string
  file: string
  url?: string
  tags?: string[]
  addedAt: number
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}