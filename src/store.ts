import Store from "electron-store";

type Wallpaper = {
  id: string
  filename: string
  path: string
  tags: string[]
  addedAt: number
}

export const store = new Store<{ 
  onboarded: boolean
  name: string
  wallpapers: Wallpaper[]
}>({
  defaults: {
    onboarded: false,
    name: '',
    wallpapers: []
  }
})