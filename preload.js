const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {
  onOpenEpub: (callback) => ipcRenderer.on("open-epub", (event, path) => callback(path)),
  readEpub: (filePath) => fs.promises.readFile(filePath),
});