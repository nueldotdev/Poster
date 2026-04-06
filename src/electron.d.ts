export interface ElectronAPI {
  importWallpapers: () => Promise<{ success: boolean, wallpapers: Wallpaper[] }>
  getWallpapers: (offset?: number, limit?: number, favoritesOnly?: boolean) => Promise<{ total: number, wallpapers: Wallpaper[], recents: { most_recent: Wallpaper, used: Wallpaper[] } }>
  setWallpaper: (wallpaper: Wallpaper) => Promise<{ success: boolean }>
  getWallpaper: (id: string) => Promise<Wallpaper | null>
  renameWallpaper: (id: string, newName: string) => Promise<{ success: boolean, name?: string }>

  setOnboarded: (onboarded: boolean) => Promise<{ success: boolean }>
  getOnboarded: () => Promise<boolean>

  setName: (name: string) => Promise<{success: boolean, name: string}>
  toggleFavorite: (id: string) => Promise<{ success: boolean, isFavorite: boolean }>
  
  // Pro & Boards
  getProStatus: () => Promise<boolean>
  togglePro: () => Promise<boolean>
  getBoards: () => Promise<Board[]>
  createBoard: (name: string) => Promise<Board>
  addWallpaperToBoard: (wallpaperId: string, boardId: string) => Promise<{ success: boolean }>
  optimizeWallpaper: (id: string, options?: OptimizeOptions) => Promise<{ success: boolean }>
  previewWallpaper: (id: string, options?: OptimizeOptions) => Promise<{ success: boolean, url?: string }>
  getEnhancementCount: () => Promise<number>
  enhanceWallpaper: (id: string) => Promise<{ success: boolean, error?: string, url?: string, count?: number }>;
  cancelEnhancement: (id: string) => Promise<{ success: boolean }>


  showMeStore: () => Promise<{ store: any }>
}

export interface OptimizeOptions {
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  position?: string
  brightness?: number
  saturation?: number
  rotate?: number
}

export interface Board {
  id: string
  name: string
  wallpaperIds: string[]
}

export interface Wallpaper {
  id: string
  filename: string
  file: string
  optimizedFile?: string
  url?: string
  tags?: string[]
  addedAt: number
  isFavorite?: boolean
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}