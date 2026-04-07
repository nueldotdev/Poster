import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from 'path'

export default defineConfig(async () => {
  const { viteStaticCopy } = await import('vite-plugin-static-copy');
  
  return {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            // Copy to the same directory as the bundled main.js
            src: 'node_modules/wallpaper/source/windows-wallpaper-x86-64.exe',
            dest: '.'
          },
          {
            src: 'node_modules/wallpaper/source/macos-wallpaper',
            dest: '.'
          }
        ]
      })
    ],
    build: {
      rollupOptions: {
        external: [
          "electron",
          ...builtinModules,
          ...builtinModules.map(m => `node:${m}`)
        ]
      }
    },
    resolve: {
      conditions: ["node"]
    }
  };
});