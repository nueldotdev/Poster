import { app, BrowserWindow, dialog, ipcMain, protocol, net, screen, Tray, Menu } from "electron";
import { autoUpdater } from 'electron-updater';
import started from "electron-squirrel-startup";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { pathToFileURL } from "url"; 
import { store } from "./store";
import { Wallpaper, SlideshowSettings } from "./electron.d";
import { setWallpaper } from "wallpaper";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

if (started) {
  app.quit();
}

// --- Slideshow Manager ---
class SlideshowManager {
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const settings: SlideshowSettings = store.get("slideshow");
    if (settings && settings.enabled) {
      this.start();
    }
  }

  public start() {
    this.stop();
    const settings: SlideshowSettings = store.get("slideshow");
    if (!settings || settings.selectedIds.length === 0) return;

    console.log(`[Slideshow] Starting with interval ${settings.interval} mins`);
    this.timer = setInterval(() => {
      this.rotate();
    }, settings.interval * 60 * 1000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async rotate() {
    const settings: SlideshowSettings = store.get("slideshow");
    if (!settings || settings.selectedIds.length === 0) return;

    const nextIndex = (settings.currentIndex + 1) % settings.selectedIds.length;
    const nextId = settings.selectedIds[nextIndex];
    
    const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
    const wallpaper = wallpapers.find(w => w.id === nextId);

    if (wallpaper) {
      console.log(`[Slideshow] Rotating to: ${wallpaper.filename}`);
      const result = await setWallpaperAction(wallpaper);
      if (result.success) {
        store.set("slideshow", { ...settings, currentIndex: nextIndex });
      }
    }
  }
}

let slideshowManager: SlideshowManager | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "localfile",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true, 
    },
  },
]);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }


  mainWindow.menuBarVisible = false;
  mainWindow.setIcon(path.join(__dirname, "../../src/assets/icon.png"));
  mainWindow.setTitle("Poster");

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }
  });
};

const createTray = () => {
  const iconPath = path.join(__dirname, "../../src/assets/icon.png");
  if (!fs.existsSync(iconPath)) return;
  
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Poster', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      } 
    }
  ]);
  tray.setToolTip('Poster');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
};



app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();

  protocol.handle("localfile", (request) => {
    try {
      const url = new URL(request.url);
      let pathName = decodeURIComponent(url.pathname);
      if (process.platform === "win32" && pathName.startsWith("/")) {
        pathName = pathName.slice(1);
      }
      return net.fetch(pathToFileURL(path.normalize(pathName)).toString());
    } catch (error) {
      console.error("Localfile protocol error:", error);
      return new Response("Not Found", { status: 404 });
    }
  });

  createWindow();
  createTray();
  slideshowManager = new SlideshowManager();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // We don't quit here anymore because we have tray support
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow?.show();
});


// --- IPC Handlers ---

ipcMain.handle("get-slideshow-settings", () => {
  return store.get("slideshow");
});

ipcMain.handle("update-slideshow-settings", (_event, settings: Partial<SlideshowSettings>) => {
  const current = store.get("slideshow") || {};
  const updated = { ...current, ...settings };
  store.set("slideshow", updated);
  
  if (updated.enabled) {
    slideshowManager?.start();
  } else {
    slideshowManager?.stop();
  }
  
  return { success: true };
});

ipcMain.handle("toggle-slideshow", () => {
  const current = store.get("slideshow") || {};
  const enabled = !current.enabled;
  store.set("slideshow", { ...current, enabled });
  
  if (enabled) {
    slideshowManager?.start();
  } else {
    slideshowManager?.stop();
  }
  
  return { success: true, enabled };
});

ipcMain.handle("add-to-slideshow", (_event, id: string) => {
  const current: SlideshowSettings = store.get("slideshow");
  if (current.selectedIds.includes(id)) return { success: true, count: current.selectedIds.length };
  
  const selectedIds = [...current.selectedIds, id];
  store.set("slideshow", { ...current, selectedIds });
  return { success: true, count: selectedIds.length };
});

ipcMain.handle("remove-from-slideshow", (_event, id: string) => {
  const current: SlideshowSettings = store.get("slideshow");
  const selectedIds = current.selectedIds.filter(sid => sid !== id);
  store.set("slideshow", { ...current, selectedIds });
  return { success: true, count: selectedIds.length };
});

async function setWallpaperAction(w: Wallpaper) {
  try {
    const libraryDir = path.join(app.getPath("userData"), "library");
    const relativePath = w.optimizedFile || w.file;
    const filePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(libraryDir, relativePath);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" };
    }

    try {
      await setWallpaper(filePath);
    } catch (err: any) {
      if (process.platform === "win32") {
        const escapedPath = filePath.replace(/'/g, "''");
        const psCommand = `Add-Type -TypeDefinition "using System.Runtime.InteropServices; public class Wallpaper { [DllImport(""user32.dll"", CharSet=CharSet.Auto)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }"; [Wallpaper]::SystemParametersInfo(20, 0, '${escapedPath}', 3)`;
        await execAsync(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`);
      } else if (process.platform === "darwin") {
        const appleScript = `tell application "System Events" to tell every desktop to set picture to "${filePath}"`;
        await execAsync(`osascript -e '${appleScript}'`);
      } else {
        throw err;
      }
    }

    const recents = store.get("recents") || { used: [] };
    const used = [w, ...(recents.used || []).filter((u: any) => u.id !== w.id)].slice(0, 3);
    store.set("recents", { most_recent: w, used });

    return { success: true };
  } catch (e: any) {
    console.error("Set wallpaper failed:", e);
    return { success: false, error: e?.message || "Unknown error" };
  }
}

ipcMain.handle("show-me-store", () => {
  const values = store.all()
  console.log(values)
})

ipcMain.handle("get-onboarded", () => store.get("onboarded") || false);
ipcMain.handle("set-onboarded", () => {
  store.set("onboarded", true);
  return { success: true };
});

ipcMain.handle("set-name", (_event, name: string) => {
  store.set("name", name);
  store.set("onboarded", true);
  return { success: true, name };
});

ipcMain.handle("import-wallpapers", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "webp"] }],
  });

  if (result.canceled) return { success: false, wallpapers: [] };

  const libraryDir = path.join(app.getPath("userData"), "library");
  if (!fs.existsSync(libraryDir)) fs.mkdirSync(libraryDir, { recursive: true });

  const existing: Wallpaper[] = store.get("wallpapers") || [];
  const imported: Wallpaper[] = result.filePaths.map((filePath) => {
    const id = uuid();
    const ext = path.extname(filePath);
    const filename = `${id}${ext}`;
    fs.copyFileSync(filePath, path.join(libraryDir, filename));
    return { id, filename: path.basename(filePath), file: filename, addedAt: Date.now() };
  });

  store.set("wallpapers", [...existing, ...imported]);
  return { success: true, wallpapers: imported };
});

const enrichWithUrl = (w: Wallpaper, libraryDir: string): Wallpaper & { url: string } => {
  // Use optimized file if it exists, otherwise use original
  const relativePath = w.optimizedFile || w.file;
  if (!relativePath) return { ...w, url: '' };
  
  try {
    const fullPath = path.isAbsolute(relativePath) 
      ? relativePath 
      : path.join(libraryDir, relativePath);
      
    const data = fs.readFileSync(fullPath);
    const ext = path.extname(relativePath).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return { ...w, url: `data:${mime};base64,${data.toString('base64')}` };
  } catch (e) { 
    console.error(`Failed to enrich wallpaper ${w.id}:`, e);
    return { ...w, url: '' }; 
  }
};

ipcMain.handle("get-wallpapers", (_event, offset = 0, limit = 20, favoritesOnly = false) => {
  let wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const libraryDir = path.join(app.getPath("userData"), "library");
  
  if (favoritesOnly) wallpapers = wallpapers.filter(w => w.isFavorite);
  
  const page = wallpapers.filter(w => w.file).slice(offset, offset + limit);
  const recents = store.get("recents") || { most_recent: null, used: [] };

  const enrichedMostRecent = recents.most_recent 
    ? enrichWithUrl(recents.most_recent, libraryDir) 
    : null;
    
  const enrichedUsed = (recents.used || [])
    .map((w: Wallpaper) => enrichWithUrl(w, libraryDir));

  return {
    total: wallpapers.length,
    wallpapers: page.map(w => enrichWithUrl(w, libraryDir)),
    recents: {
      most_recent: enrichedMostRecent,
      used: enrichedUsed,
    }
  };
});

ipcMain.handle("get-wallpaper", (_event, id: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const w = wallpapers.find(w => w.id === id);
  return w ? enrichWithUrl(w, path.join(app.getPath("userData"), "library")) : null;
});

ipcMain.handle("rename-wallpaper", (_event, id: string, newName: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const idx = wallpapers.findIndex(w => w.id === id);
  if (idx === -1) return { success: false };
  wallpapers[idx].filename = newName;
  store.set("wallpapers", wallpapers);
  return { success: true, name: newName };
});

ipcMain.handle("toggle-favorite", (_event, id: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const idx = wallpapers.findIndex(w => w.id === id);
  if (idx === -1) return { success: false };
  wallpapers[idx].isFavorite = !wallpapers[idx].isFavorite;
  store.set("wallpapers", wallpapers);
  return { success: true, isFavorite: wallpapers[idx].isFavorite };
});

ipcMain.handle("get-pro-status", () => store.get("isPro") || false);
ipcMain.handle("toggle-pro", () => {
  const current = store.get("isPro") || false;
  store.set("isPro", !current);
  return !current;
});

ipcMain.handle("get-boards", () => store.get("boards") || []);
ipcMain.handle("create-board", (_event, name: string) => {
  const boards = store.get("boards") || [];
  const newBoard = { id: uuid(), name };
  store.set("boards", [...boards, newBoard]);
  return newBoard;
});

/* ipcMain.handle("enhance-wallpaper", async (_event, id) => {
  try {
    const enhancementCount = store.get("enhancementCount") || 0;
    if (enhancementCount >= 5) {
      return { success: false, error: "Enhancement limit (5) reached." };
    }

    const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
    const w = wallpapers.find((w) => w.id === id);
    if (!w) return { success: false, error: "Wallpaper not found" };

    const libraryDir = path.join(app.getPath("userData"), "library");
    const stagingDir = path.join(libraryDir, "staging");
    if (!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir, { recursive: true });

    // Get image as base64 to send to backend
    const filePath = path.join(libraryDir, w.file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(w.file).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    const base64Image = `data:${mime};base64,${data.toString('base64')}`;

    const response = await net.fetch("http://localhost:5000/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || "Backend request failed" };
    }

    const result = await response.json();
    let upscaledUrl = result.upscaledImageUrl;
    if (Array.isArray(upscaledUrl)) upscaledUrl = upscaledUrl[0];
    if (upscaledUrl && typeof upscaledUrl === 'object' && upscaledUrl.url) upscaledUrl = upscaledUrl.url;

    if (result.success && typeof upscaledUrl === 'string') {
      const imageResponse = await net.fetch(upscaledUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      
      const stagingPath = path.join(stagingDir, `staging-${id}.webp`);
      
      // Save original AI result to staging
      // await sharp(imageBuffer).webp({ quality: 100 }).toFile(stagingPath);
      fs.writeFileSync(stagingPath, imageBuffer);
      
      // Return a preview URL of the staged image
      // const display = screen.getPrimaryDisplay();
      // const scale = display.scaleFactor || 1;
      // const width = Math.round(display.size.width * scale);
      // const height = Math.round(display.size.height * scale);

      // const buffer = await sharp(stagingPath)
      //   .resize({ width, height, fit: "cover", position: "center" })
      //   .webp({ quality: 90 })
      //   .toBuffer();

      const buffer = fs.readFileSync(stagingPath);

      return { 
        success: true, 
        url: `data:image/webp;base64,${buffer.toString("base64")}`,
        count: enhancementCount + 1 
      };
    }

    return { success: false, error: "Failed to parse enhanced image URL" };
  } catch (e) {
    console.error("Enhancement failed:", e);
    return { success: false, error: e.message };
  }
});


ipcMain.handle("cancel-enhancement", (_event, id) => {
  const libraryDir = path.join(app.getPath("userData"), "library");
  const stagingPath = path.join(libraryDir, "staging", `staging-${id}.webp`);
  if (fs.existsSync(stagingPath)) {
    fs.unlinkSync(stagingPath);
  }
  return { success: true };
});

ipcMain.handle("get-enhancement-count", () => store.get("enhancementCount") || 0); */

ipcMain.handle("optimize-wallpaper", async (_event, id, options) => {
  try {
    const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
    const idx = wallpapers.findIndex(w => w.id === id);
    if (idx === -1) return { success: false };

    const w = wallpapers[idx];
    const libraryDir = path.join(app.getPath("userData"), "library");
    const optimizedDir = path.join(libraryDir, "optimized");
    if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

    // const stagingPath = path.join(libraryDir, "staging", `staging-${id}.webp`);
    // const sourcePath = fs.existsSync(stagingPath) ? stagingPath : path.join(libraryDir, w.file);
    const sourcePath = path.join(libraryDir, w.file);

    // const display = screen.getPrimaryDisplay();
    // const scale = display.scaleFactor || 1;
    // const width = Math.round(display.size.width * scale);
    // const height = Math.round(display.size.height * scale);

    const ext = path.extname(sourcePath).slice(1).toLowerCase();
    const fileName = `opt-${w.id}.${ext || 'webp'}`;
    const dest = path.join(optimizedDir, fileName);

    // await sharp(sourcePath)
    //   .rotate(options?.rotate || 0)
    //   .resize({ width, height, fit: options?.fit || "cover", position: options?.position || "center" })
    //   .modulate({ brightness: options?.brightness || 1.05, saturation: options?.saturation || 1.15 })
    //   .sharpen({ sigma: 1.5 })
    //   .webp({ quality: 100 })
    //   .toFile(dest);

    // Fallback since sharp is disabled
    fs.copyFileSync(sourcePath, dest);

    // If we used a staging file, it means this was an AI enhancement, so increment count
    /* if (fs.existsSync(stagingPath)) {
      const count = store.get("enhancementCount") || 0;
      store.set("enhancementCount", count + 1);
      fs.unlinkSync(stagingPath);
    } */

    wallpapers[idx].optimizedFile = path.join("optimized", fileName);
    store.set("wallpapers", wallpapers);
    return { success: true };
  } catch (e) {
    console.error("Optimize failed:", e);
    return { success: false };
  }
});

ipcMain.handle("preview-wallpaper", async (_event, id, options) => {
  try {
    const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
    const w = wallpapers.find(w => w.id === id);
    if (!w) return { success: false };

    const libraryDir = path.join(app.getPath("userData"), "library");
    // const stagingPath = path.join(libraryDir, "staging", `staging-${id}.webp`);
    // const sourcePath = fs.existsSync(stagingPath) ? stagingPath : path.join(libraryDir, w.file);
    const sourcePath = path.join(libraryDir, w.file);

    // const display = screen.getPrimaryDisplay();
    // const scale = display.scaleFactor || 1;
    // const width = Math.round(display.size.width * scale);
    // const height = Math.round(display.size.height * scale);

    // const buffer = await sharp(sourcePath)
    //   .rotate(options?.rotate || 0)
    //   .resize({ width, height, fit: options?.fit || "cover", position: options?.position || "center" })
    //   .modulate({ brightness: options?.brightness || 1.05, saturation: options?.saturation || 1.15 })
    //   .sharpen({ sigma: 1.5 })
    //   .webp({ quality: 90 })
    //   .toBuffer();
    // return { success: true, url: `data:image/webp;base64,${buffer.toString("base64")}` };

    // Fallback since sharp is disabled
    const buffer = fs.readFileSync(sourcePath);
    const ext = path.extname(sourcePath).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'jpeg' || ext === 'jpg' ? 'image/jpeg' : 'image/webp';

    return { success: true, url: `data:${mime};base64,${buffer.toString("base64")}` };
  } catch (e) {
    console.error("Preview failed:", e);
    return { success: false };
  }
});

ipcMain.handle("set-wallpaper", async (_event, w) => {
  try {
    const libraryDir = path.join(app.getPath("userData"), "library");

    // ---------- resolve absolute path ----------
    const relativePath = w.optimizedFile || w.file;

    const filePath = path.isAbsolute(relativePath)
      ? relativePath
      : path.join(libraryDir, relativePath);

    if (!fs.existsSync(filePath)) {
      console.error("Wallpaper file not found:", filePath);
      return { success: false, error: "File not found" };
    }

    // ---------- SET WALLPAPER ----------
    try {
      await setWallpaper(filePath);
    } catch (err: any) {
      console.warn("wallpaper package failed, trying system fallback:", err);
      
      if (process.platform === "win32") {
        // Use a robust one-liner that avoids PowerShell here-string parser issues
        const escapedPath = filePath.replace(/'/g, "''");
        const psCommand = `Add-Type -TypeDefinition "using System.Runtime.InteropServices; public class Wallpaper { [DllImport(""user32.dll"", CharSet=CharSet.Auto)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }"; [Wallpaper]::SystemParametersInfo(20, 0, '${escapedPath}', 3)`;
        await execAsync(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`);
      } else if (process.platform === "darwin") {
        // AppleScript fallback for macOS
        const appleScript = `tell application "System Events" to tell every desktop to set picture to "${filePath}"`;
        await execAsync(`osascript -e '${appleScript}'`);
      } else {
        throw err;
      }
    }

    // ---------- STORE UPDATE ----------
    const { url, ...wToStore } = w;

    const recents = store.get("recents") || { used: [] };

    const used = [
      wToStore,
      ...(recents.used || []).filter((u: any) => u.id !== w.id)
    ].slice(0, 3);

    store.set("recents", {
      most_recent: wToStore,
      used
    });

    return { success: true };
  } catch (e: any) {
    console.error("Set wallpaper failed:", e);
    return {
      success: false,
      error: e?.message || "Unknown error"
    };
  }
});


ipcMain.handle("search-wallpapers", (_event, query: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const libraryDir = path.join(app.getPath("userData"), "library");
  
  if (query != "") {
    const results = wallpapers.filter(w => 
    w.filename.toLowerCase().includes(query.toLowerCase()) ||
    (w.tags || []).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

    return results.map(w => enrichWithUrl(w, libraryDir));
  } else {
    return []
  }
});