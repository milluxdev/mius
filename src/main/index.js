import {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} from 'electron'
import path from 'path'

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let appTray = null;
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`


function createWindow() {
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    minHeight: 750,
    height: 750, //窗口高度
    minWidth: 950,
    width: 950, //窗口宽度
    center: true, //是否居中
    resizable: true, //窗口是否可以改变尺寸
    show: false, //窗口创建的时候是否显示
    frame: false,
    useContentSize:true,
    webPreferences: {
      webSecurity: false
    },
  })
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximize', 'maximize')
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('unmaximize', 'unmaximize')
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('min', e => {
  mainWindow.minimize()
});
ipcMain.on('max', e => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
    
  } else {
    mainWindow.maximize()
  }
});
ipcMain.on('close', e => mainWindow.close());