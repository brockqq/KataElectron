const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
//const { handleLogin, handleGetBooks } = require('./js/ipcHandlers');  // 導入處理函數
const { registerIPC } = require('./js/ipcHandlers'); // 引入已拆分的 ipcMain 處理邏輯
const config = require('./config.json');  // 引用設定檔案
const logger = require('./js/logger');  // 引入 logger

// 移除預設選單
Menu.setApplicationMenu(null);

let mainWindow;
let deviceManagerWindow;

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
  }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

// 透過 module.exports 暴露 mainWindow
module.exports = { mainWindow };