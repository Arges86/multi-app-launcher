'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import settings from 'electron-settings'
import contextMenu from 'electron-context-menu'
import * as remoteMain from '@electron/remote/main'
remoteMain.initialize()

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

ipcMain.handle('get-settings', async (event, args) => {
  const allSettings = await settings.get()
  return allSettings
})

ipcMain.handle('delete-profile', async (event, profile) => {
  return settings.unsetSync(profile)
})

ipcMain.handle('set-profile', async (event, name, values) => {
  settings.setSync(name, values)
})

ipcMain.handle('file-picker', async (event, options) => {
  const filePath = await dialog.showOpenDialog(options)
  return filePath
})

ipcMain.on('open-info', async (event, options) => {
  console.log('Opening child window')
  const window = createChildWindow()

  window.on('close', () => {
    event.reply('close-info', true)
  })
})

let childWindow
function createChildWindow () {
  const winURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#/info'
    : `file://${__dirname}/index.html#info`
  const x = mainWindow.getPosition()[0] + 50
  const y = mainWindow.getPosition()[1] + 50

  childWindow = new BrowserWindow({
    height: 300,
    width: 300,
    x,
    y,
    minimizable: false,
    maximizable: false,
    useContentSize: true,
    type: 'toolbar',
    frame: true,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  })
  childWindow.setMenu(null)

  remoteMain.enable(childWindow.webContents)
  childWindow.loadURL(winURL)

  return childWindow
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    transparent: true,
    backgroundColor: '#090979fa',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true
    }
  })
  mainWindow.setMenu(null)

  remoteMain.enable(mainWindow.webContents)
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // adds right click menu
  contextMenu({
    showInspectElement: false,
    showSearchWithGoogle: false
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
