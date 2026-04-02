export interface ElectronAPI {
  importWallpapers: () => Promise<{ success: boolean, wallpapers: Wallpaper[] }>
  getWallpapers: (offset?: number, limit?: number) => Promise<{ total: number, wallpapers: Wallpaper[] }>
  setWallpaper: (path: string) => Promise<{ success: boolean }>

  setOnboarded: (onboarded: boolean) => Promise<{ success: boolean }>
  getOnboarded: () => Promise<boolean>

  setName: (name: string) => Promise<{success: boolean, name: string}>
}

interface Wallpaper {
  id: string
  filename: string
  file: string
  url: string
  tags: string[]
  addedAt: number
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}