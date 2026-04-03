import { app, BrowserWindow, dialog, ipcMain, protocol, net } from "electron";
import started from "electron-squirrel-startup";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { pathToFileURL } from "url"; // Needed for robust path parsing
import { store } from "./store";
import { Wallpaper } from "./electron.d";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
  app.quit();
}

// 1. Register the scheme BEFORE app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "localfile",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true, // Allows loading images without editing HTML meta tags
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
  // 2. Set up the handler for "localfile://"
  protocol.handle("localfile", (request) => {
    try {
      // 1. Convert "localfile:///C:/..." to a standard URL object
      // This handles the slashes and drive letters properly
      const url = new URL(request.url);

      // 2. Extract the pathname and decode it (removes %20 for spaces)
      // On Windows, url.pathname might start with /C:/, so we strip the leading /
      let pathName = decodeURIComponent(url.pathname);
      if (process.platform === "win32" && pathName.startsWith("/")) {
        pathName = pathName.slice(1);
      }

      // 3. Return the file
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

ipcMain.handle("get-onboarded", async () => {
  return store.get("onboarded");
});

ipcMain.handle("set-onboarded", async () => {
  store.set("onboarded", true);
  return { success: true };
});

// ---- Name
ipcMain.handle("set-name", async (_event, name: string) => {
  store.set("name", name);
  store.set("onboarded", true);
  return {
    success: store.get("name") === name,
    name,
  };
});


// ---- Wallpapers
ipcMain.handle("import-wallpapers", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "webp"] }],
    title: "Pick wallpapers to import",
  });

  if (result.canceled) return { success: false, wallpapers: [] };

  const libraryDir = path.join(app.getPath("userData"), "library");
  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
  }

  const existing: Wallpaper[] = store.get("wallpapers") || [];

  const imported: Wallpaper[] = result.filePaths.map((filePath) => {
    const id = uuid();
    const ext = path.extname(filePath);
    const filename = `${id}${ext}`;
    const dest = path.join(libraryDir, filename);
    fs.copyFileSync(filePath, dest);

    return {
      id,
      filename: path.basename(filePath),
      file: filename,
      addedAt: Date.now(),
    };
  });

  store.set("wallpapers", [...existing, ...imported]);
  return { success: true, wallpapers: imported };
});

const enrichWithUrl = (w: Wallpaper, libraryDir: string): Wallpaper & { url: string } => {
  if (!w.file) return { ...w, url: '' };
  const fullPath = path.join(libraryDir, w.file);
  const ext = path.extname(w.file).slice(1).toLowerCase();
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  try {
    const data = fs.readFileSync(fullPath);
    return { ...w, url: `data:${mime};base64,${data.toString('base64')}` };
  } catch {
    return { ...w, url: '' };
  }
};

ipcMain.handle("get-wallpapers", async (_event, offset = 0, limit = 20) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const libraryDir = path.join(app.getPath("userData"), "library");
  const recents = store.get("recents") || { most_recent: { id: "", filename: "", file: "", addedAt: 0 }, used: [] };

  const page = wallpapers
    .filter((w) => w.file)
    .slice(offset, offset + limit);

  const enrichedMostRecent = recents.most_recent?.file
    ? enrichWithUrl(recents.most_recent, libraryDir)
    : recents.most_recent;

  const enrichedUsed = (recents.used as Wallpaper[])
    .filter((w) => w.file)
    .map((w) => enrichWithUrl(w, libraryDir))
    .filter((w) => w.url);

  return {
    total: wallpapers.filter((w) => w.file).length,
    wallpapers: page.map((w) => enrichWithUrl(w, libraryDir)).filter((w) => w.url),
    recents: {
      most_recent: enrichedMostRecent,
      used: enrichedUsed,
    },
  };
})


ipcMain.handle("get-wallpaper", async (_event, id: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const wallpaper = wallpapers.find((w) => w.id === id);
  if (!wallpaper) return null;
  const libraryDir = path.join(app.getPath("userData"), "library");
  return enrichWithUrl(wallpaper, libraryDir);
});

ipcMain.handle("rename-wallpaper", async (_event, id: string, newName: string) => {
  const wallpapers: Wallpaper[] = store.get("wallpapers") || [];
  const index = wallpapers.findIndex((w) => w.id === id);
  if (index === -1) return { success: false };

  wallpapers[index].filename = newName;
  store.set("wallpapers", wallpapers);

  // Update recents as well
  const recents: any = store.get("recents") || { most_recent: { id: "", filename: "", file: "", addedAt: 0 }, used: [] };
  let recentsUpdated = false;
  if (recents.most_recent?.id === id) {
    recents.most_recent.filename = newName;
    recentsUpdated = true;
  }
  const usedIndex = (recents.used as Wallpaper[]).findIndex((w: Wallpaper) => w.id === id);
  if (usedIndex !== -1) {
    recents.used[usedIndex].filename = newName;
    recentsUpdated = true;
  }
  
  if (recentsUpdated) {
     store.set("recents", recents);
  }

  return { success: true, name: newName };
});


ipcMain.handle("set-wallpaper", async (_event, w: Wallpaper) => {
  try {
    const libraryDir = path.join(app.getPath("userData"), "library");
    const filePath = path.resolve(libraryDir, w.file);
    
    // console.log("Setting wallpaper to:", filePath);

    // The PowerShell script with proper newlines
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

    // Convert to base64 (UTF-16LE) to handle all special characters/quotes safely
    const encodedCommand = Buffer.from(psScript, "utf16le").toString("base64");

    await execAsync(`powershell.exe -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, {
      windowsHide: true,
    });

    await lastUsed(w);

    return { success: true };
  } catch (e: any) {
    console.error("Set wallpaper failed:", e);
    return { success: false, error: e.message };
  }
});


// ---- History
// type useInfo = {
//   file: string;
//   timestamp?: number;
//   date: string;
// }


const lastUsed = async (wallpaper: Wallpaper) => {
  const recents = store.get("recents") || { most_recent: { id: "", filename: "", file: "", addedAt: 0 }, used: [] };
  // Strip url — it's a multi-MB base64 blob, always recomputed from disk on read
  const { url: _url, ...wallpaperToStore } = wallpaper as Wallpaper & { url?: string };
  const updatedRecents = {
    ...recents,
    most_recent: wallpaperToStore,
    used: [wallpaperToStore, ...recents.used.filter((w: Wallpaper) => w.file !== wallpaper.file)],
  };
  store.set("recents", updatedRecents);
};

