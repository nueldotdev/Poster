import { app, BrowserWindow, dialog, ipcMain, protocol, net, screen } from "electron";
import started from "electron-squirrel-startup";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { pathToFileURL } from "url"; 
import { store } from "./store";
import { Wallpaper } from "./electron.d";
import { exec } from "child_process";
import { promisify } from "util";
import sharp from "sharp";

const execAsync = promisify(exec);

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

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
  const mainWindow = new BrowserWindow({
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
};

app.whenReady().then(() => {
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC Handlers ---

ipcMain.handle("get-onboarded", () => store.get("onboarded"));
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
  const newBoard = { id: uuid(), name, wallpaperIds: [] };
  store.set("boards", [...boards, newBoard]);
  return newBoard;
});

ipcMain.handle("enhance-wallpaper", async (_event, id) => {
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
      await sharp(imageBuffer).webp({ quality: 100 }).toFile(stagingPath);
      
      // Return a preview URL of the staged image
      const display = screen.getPrimaryDisplay();
      const scale = display.scaleFactor || 1;
      const width = Math.round(display.size.width * scale);
      const height = Math.round(display.size.height * scale);

      const buffer = await sharp(stagingPath)
        .resize({ width, height, fit: "cover", position: "center" })
        .webp({ quality: 90 })
        .toBuffer();

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

ipcMain.handle("get-enhancement-count", () => store.get("enhancementCount") || 0);

ipcMain.handle("optimize-wallpaper", async (_event, id, options) => {
  try {
    const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
    const idx = wallpapers.findIndex(w => w.id === id);
    if (idx === -1) return { success: false };

    const w = wallpapers[idx];
    const libraryDir = path.join(app.getPath("userData"), "library");
    const optimizedDir = path.join(libraryDir, "optimized");
    if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

    const stagingPath = path.join(libraryDir, "staging", `staging-${id}.webp`);
    const sourcePath = fs.existsSync(stagingPath) ? stagingPath : path.join(libraryDir, w.file);

    const display = screen.getPrimaryDisplay();
    const scale = display.scaleFactor || 1;
    const width = Math.round(display.size.width * scale);
    const height = Math.round(display.size.height * scale);

    const fileName = `opt-${w.id}.webp`;
    const dest = path.join(optimizedDir, fileName);

    await sharp(sourcePath)
      .rotate(options?.rotate || 0)
      .resize({ width, height, fit: options?.fit || "cover", position: options?.position || "center" })
      .modulate({ brightness: options?.brightness || 1.05, saturation: options?.saturation || 1.15 })
      .sharpen({ sigma: 1.5 })
      .webp({ quality: 100 })
      .toFile(dest);

    // If we used a staging file, it means this was an AI enhancement, so increment count
    if (fs.existsSync(stagingPath)) {
      const count = store.get("enhancementCount") || 0;
      store.set("enhancementCount", count + 1);
      fs.unlinkSync(stagingPath);
    }

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
    const stagingPath = path.join(libraryDir, "staging", `staging-${id}.webp`);
    const sourcePath = fs.existsSync(stagingPath) ? stagingPath : path.join(libraryDir, w.file);

    const display = screen.getPrimaryDisplay();
    const scale = display.scaleFactor || 1;
    const width = Math.round(display.size.width * scale);
    const height = Math.round(display.size.height * scale);

    const buffer = await sharp(sourcePath)
      .rotate(options?.rotate || 0)
      .resize({ width, height, fit: options?.fit || "cover", position: options?.position || "center" })
      .modulate({ brightness: options?.brightness || 1.05, saturation: options?.saturation || 1.15 })
      .sharpen({ sigma: 1.5 })
      .webp({ quality: 90 })
      .toBuffer();

    return { success: true, url: `data:image/webp;base64,${buffer.toString("base64")}` };
  } catch (e) {
    console.error("Preview failed:", e);
    return { success: false };
  }
});

ipcMain.handle("set-wallpaper", async (_event, w) => {
  try {
    const libraryDir = path.join(app.getPath("userData"), "library");
    const filePath = path.resolve(libraryDir, w.optimizedFile || w.file);
    const psScript = `
$code = @'
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code
[Win32]::SystemParametersInfo(20, 0, "${filePath}", 3)
`.trim();
    const encoded = Buffer.from(psScript, "utf16le").toString("base64");
    await execAsync(`powershell.exe -ExecutionPolicy Bypass -EncodedCommand ${encoded}`, { windowsHide: true });
    
    // Update recents
    const recents = store.get("recents") || { used: [] };
    // Multi-MB base64 blob is always recomputed from disk on read
    const { url: _, ...wToStore } = w;
    const used = [wToStore, ...(recents.used || []).filter((u: any) => u.id !== w.id)].slice(0, 3);
    
    store.set("recents", {
      most_recent: wToStore,
      used
    });

    return { success: true };
  } catch (e) {
    console.error("Set wallpaper failed:", e);
    return { success: false };
  }
});
