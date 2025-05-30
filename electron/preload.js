const { contextBridge, ipcRenderer } = require("electron")

// Exponer funciones protegidas a la ventana del navegador
contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (fileName) => ipcRenderer.invoke("load-data", fileName),
  saveData: (fileName, data) => ipcRenderer.invoke("save-data", fileName, data),
})
