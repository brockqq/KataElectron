const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
//const { handleLogin, handleGetBooks } = require('./js/ipcHandlers');  // 導入處理函數
const { registerIPC } = require('./js/ipcHandlers'); // 引入已拆分的 ipcMain 處理邏輯
const config = require('./config.json');  // 引用設定檔案
const logger = require('./js/logger');  // 引入 logger

// 移除預設選單
Menu.setApplicationMenu(null);

let mainWindow;
let deviceManagerWindow;
let openEpubManagerWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
    // 註冊 IPC 處理邏輯
    registerIPC(mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// 綁定 ipcMain.handle 到處理函數
//ipcMain.handle('login', handleLogin);
//ipcMain.handle('getBooks', handleGetBooks);

// 創建裝置管理視窗
function openDeviceManager() {
  if (deviceManagerWindow) {
      deviceManagerWindow.focus();
      return;
  }

  deviceManagerWindow = new BrowserWindow({
      width: 600,
      height: 400,
      title: '裝置管理',
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
  });

  deviceManagerWindow.loadFile('device-manager.html');

  deviceManagerWindow.on('closed', () => {
      deviceManagerWindow = null;
  });
}

// 創建裝置管理視窗
function openEpubManager() {
    if (openEpubManagerWindow) {
        openEpubManagerWindow.focus();
        return;
    }
  
    openEpubManagerWindow = new BrowserWindow({
        width: 600,
        height: 400,
        title: '開啟書籍',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
  
    openEpubManagerWindow.loadFile('openEpubManagerWindow.html');
    openEpubManagerWindow.on('closed', () => {
        openEpubManagerWindow = null;
    });
  }


  //const path = require('path');

  function createEpubJsWindow(epubPath) {
    const epubWin = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), // ✅ 指定 preload
        contextIsolation: true,                      // ✅ 必須 true 才能用 contextBridge
        nodeIntegration: false                       // ✅ 安全起見，請關掉
      },
    });
  
    epubWin.loadFile('readers/epubjs/index.html');
  
    epubWin.webContents.once('did-finish-load', () => {
      epubWin.webContents.send('open-epub', epubPath);
    });
  }

// 處理開書 IPC
ipcMain.handle('open-book', async () => {
    const result = await dialog.showOpenDialog({
        filters: [{ name: 'EPUB Books', extensions: ['epub'] }],
        properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const epubPath = result.filePaths[0];
        createEpubJsWindow(epubPath);
    }
});

// 建立自訂選單
const menuTemplate = [
  {
      label: '檔案',
      submenu: [
          { role: 'quit', label: '結束' }
      ]
  },
  {
      label: '裝置管理',
      click: openDeviceManager
  },
  {
      label: '開啟書籍',
      click: openEpubManager
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

// 透過 module.exports 暴露 mainWindow
module.exports = { mainWindow };