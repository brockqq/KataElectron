// Modules to control application life and create native browser window
const { app, BrowserWindow  } = require('electron')
const path = require('node:path')
//Notification
function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 2048, //主視窗寬
    height: 600, //主視窗高
    backgroundColor: '#FFF', // 背景顏色
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
//const NOTIFICATION_TITLE = 'Basic Notification'
//const NOTIFICATION_BODY = 'Notification from the Main process'

//function showNotification () {
//  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show();//這個會是右下角系統通知
//}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})
//.then(showNotification)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
