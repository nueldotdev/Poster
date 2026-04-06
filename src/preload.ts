// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("api", {
  getOnboarded: () => ipcRenderer.invoke("get-onboarded"),
  setOnboarded: () => ipcRenderer.invoke("set-onboarded"),
  setName: (name: string) => ipcRenderer.invoke("set-name", name),
  importWallpapers: () => ipcRenderer.invoke("import-wallpapers"),
  getWallpapers: (offset?: number, limit?: number, favoritesOnly?: boolean) => ipcRenderer.invoke('get-wallpapers', offset, limit, favoritesOnly),
  setWallpaper: (wallpaper: object) => ipcRenderer.invoke("set-wallpaper", wallpaper),
  getWallpaper: (id: string) => ipcRenderer.invoke("get-wallpaper", id),
  renameWallpaper: (id: string, newName: string) => ipcRenderer.invoke("rename-wallpaper", id, newName),
  toggleFavorite: (id: string) => ipcRenderer.invoke("toggle-favorite", id),
  getProStatus: () => ipcRenderer.invoke("get-pro-status"),
  togglePro: () => ipcRenderer.invoke("toggle-pro"),
  getBoards: () => ipcRenderer.invoke("get-boards"),
  createBoard: (name: string) => ipcRenderer.invoke("create-board", name),
  addWallpaperToBoard: (wallpaperId: string, boardId: string) => ipcRenderer.invoke("add-wallpaper-to-board", wallpaperId, boardId),
  optimizeWallpaper: (id: string, options?: any) => ipcRenderer.invoke("optimize-wallpaper", id, options),
  previewWallpaper: (id: string, options?: any) => ipcRenderer.invoke("preview-wallpaper", id, options),
  enhanceWallpaper: (id: string) => ipcRenderer.invoke("enhance-wallpaper", id),
  cancelEnhancement: (id: string) => ipcRenderer.invoke("cancel-enhancement", id),
  getEnhancementCount: () => ipcRenderer.invoke("get-enhancement-count"),
  getWallpaperSize: (id: string) => ipcRenderer.invoke("get-wallpaper-size", id),
  getWallpaperDimensions: (id: string) => ipcRenderer.invoke("get-wallpaper-dimensions", id),
  getWallpaperTags: (id: string) => ipcRenderer.invoke("get-wallpaper-tags", id),
  showMeStore: () => ipcRenderer.invoke("show-me-store"),
});
