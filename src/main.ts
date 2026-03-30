import {
  app,
  BrowserWindow,
  ipcMain,
} from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import Store from "electron-store";

const store = new Store<{ onboarded: boolean }>({
  defaults: {
    onboarded: false,
  },
});

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

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

ipcMain.handle("get-onboarded", async (): Promise<boolean> => {
  return store.get("onboarded", false);
});

ipcMain.handle("set-onboarded", async (): Promise<{ success: boolean }> => {
  store.set("onboarded", true);
  return { success: true };
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
