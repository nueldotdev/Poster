import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    name: "Poster",
    executableName: "Poster",

    icon: path.resolve(__dirname, "src/assets/icon"),

    asar: {
      unpack: "**/node_modules/wallpaper/**/*",
    },

    win32metadata: {
      CompanyName: "nueldotdev",
      FileDescription: "Wallpaper manager for Windows",
      ProductName: "Poster",
      InternalName: "Poster",
    },
  },

  rebuildConfig: {},

  makers: [
    new MakerSquirrel({
      name: "Poster",
      authors: "nueldotdev",
      description: "Wallpaper manager for Windows",
      setupIcon: path.resolve(__dirname, "src/assets/icon.ico"),
      setupExe: "PosterSetup.exe",
    }),

    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],

  plugins: [
    new AutoUnpackNativesPlugin({}),

    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),

    new FusesPlugin({
      version: FuseVersion.V1,

      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,

      // ⭐ IMPORTANT FIX
      [FuseV1Options.OnlyLoadAppFromAsar]: false,

      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    }),
  ],

  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "nueldotdev",
          name: "Poster",
        },
        prerelease: false,
      },
    },
  ],
};

export default config;
