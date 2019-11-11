import {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} from 'electron'
import path from 'path'
const {
  autoUpdater
} = require('electron-updater')

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

const feedUrl = `https://mius-1252282306.cos.ap-shanghai.myqcloud.com/${process.platform}`;

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
    useContentSize: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
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
// 检测更新
let checkForUpdates = () => {
  autoUpdater.setFeedURL(feedUrl);

  autoUpdater.on('error', function (message) {
    mainWindow.webContents.send('message', {
      "message": 'error'
    })
  });
  autoUpdater.on('checking-for-update', function (message) {
    mainWindow.webContents.send('message', {
      "message": 'checking-for-update'
    })
  });
  autoUpdater.on('update-available', function (message) {
    mainWindow.webContents.send('message', {
      "message": 'update-available'
    })
  });
  autoUpdater.on('update-not-available', function (message) {
    mainWindow.webContents.send('message', {
      "message": 'update-not-available'
    })
  });

  autoUpdater.on('download-progress', function (progressObj) {
    mainWindow.webContents.send('message', {
      "message": 'download-progress',
      "data": progressObj
    })
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    mainWindow.webContents.send('message', {
      "message": 'is-update-now',
      "data": event
    })
  });

  autoUpdater.checkForUpdates();
};

app.on('ready', () => {
  createWindow()
  setTimeout(checkForUpdates, 1000);
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

ipcMain.on('update', (e, arg) => {
  autoUpdater.quitAndInstall();
})