const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Platform detection
  platform: process.platform,

  // Check if running in Electron
  isElectron: true
});
