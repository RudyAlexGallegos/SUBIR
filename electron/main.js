const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = require("electron-is-dev")
const { format } = require("url")

// Mantener una referencia global del objeto window para evitar
// que la ventana se cierre automáticamente cuando el objeto JavaScript es recogido por el recolector de basura.
let mainWindow

function createWindow() {
  // Crear la ventana del navegador.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "icon.ico"),
  })

  // Cargar la aplicación Next.js
  const startUrl = isDev
    ? "http://localhost:3000"
    : format({
        pathname: path.join(__dirname, "../out/index.html"),
        protocol: "file:",
        slashes: true,
      })

  mainWindow.loadURL(startUrl)

  // Abrir las herramientas de desarrollo si estamos en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Emitido cuando la ventana es cerrada.
  mainWindow.on("closed", () => {
    // Eliminar la referencia al objeto window, normalmente guardarías las ventanas
    // en un array si tu aplicación soporta múltiples ventanas, este es el momento
    // en que deberías borrar el elemento correspondiente.
    mainWindow = null
  })
}

// Este método será llamado cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
// Algunas APIs pueden usarse sólo después de que este evento ocurra.
app.whenReady().then(createWindow)

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
app.on("window-all-closed", () => {
  // En macOS es común para las aplicaciones y sus barras de menú
  // que estén activas hasta que el usuario salga explicitamente con Cmd + Q
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
  // En macOS es común volver a crear una ventana en la aplicación cuando el
  // icono del dock es clicado y no hay otras ventanas abiertas.
  if (mainWindow === null) createWindow()
})

// Manejo de datos
const DATA_PATH = path.join(app.getPath("userData"), "data")

// Asegurarse de que el directorio de datos existe
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true })
}

// Funciones para manejar los datos
function getDataFilePath(fileName) {
  return path.join(DATA_PATH, `${fileName}.json`)
}

function saveData(fileName, data) {
  const filePath = getDataFilePath(fileName)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function loadData(fileName) {
  const filePath = getDataFilePath(fileName)
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  }
  return []
}

// Configurar IPC para comunicación con el renderer
ipcMain.handle("load-data", (event, fileName) => {
  return loadData(fileName)
})

ipcMain.handle("save-data", (event, fileName, data) => {
  saveData(fileName, data)
  return true
})
