// See the Electron documentation for details on how to use preload scripts:

import { contextBridge, ipcRenderer } from "electron";

// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
contextBridge.exposeInMainWorld("api", {
  getOnboarded: () => ipcRenderer.invoke("get-onboarded"),
  setOnboarded: () => ipcRenderer.invoke("set-onboarded"),
  setName: (name: string) => ipcRenderer.invoke("set-name", name),
  importWallpapers: () => ipcRenderer.invoke("import-wallpapers"),
  getWallpapers: (offset?: number, limit?: number) => ipcRenderer.invoke('get-wallpapers', offset, limit),
  setWallpaper: (wallpaper: object) => ipcRenderer.invoke("set-wallpaper", wallpaper),
  getWallpaper: (id: string) => ipcRenderer.invoke("get-wallpaper", id),
  renameWallpaper: (id: string, newName: string) => ipcRenderer.invoke("rename-wallpaper", id, newName),
});
