const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');  // 引用設定檔案
const logger = require('./logger');  // 引入 logger
const { ipcMain } = require('electron');

// 登入處理函數
async function handleLogin(event, username, password) {
    try {
        const response = await axios.post(config.apiBaseUrl + config.loginEndpoint, { username, password });
        const { token, p12 } = response.data;

        // 儲存 Token 與 P12 憑證
        const tokenPath = path.join(app.getPath('userData'), 'token.txt');
        const p12Path = path.join(app.getPath('userData'), 'p12.crt');

        fs.writeFileSync(tokenPath, token);
        fs.writeFileSync(p12Path, p12, 'base64');

        return { success: true, message: '登入成功' };
    } catch (error) {
        console.error('登入失敗', error);
        return { success: false, message: '登入失敗，請檢查帳號密碼' };
    }
}

// 獲取月租館資料處理函數
async function handleGetMonthlyServiceData(event) {
    try {
        const response = await axios.get(`${config.apiBaseUrl}${config.getMonthlyService}`);
        return { success: true, books: response.data.monthlyService};
    } catch (error) {
        console.error('取得月租館資料失敗', error);
        return { success: false, message: '無法取得月租館資料' };
    }
}

// 獲取月租館下所有書籍的處理函數
async function handleMonthlyAllGrop(event, serviceCode) {
    try {
        const url = `${config.apiBaseUrl}${config.monthlyAllGrop}${serviceCode}`;
        console.info(url);
        const response = await axios.get(url);
        return { success: true, books: response.data.ebooks };
    } catch (error) {
        console.error('取得月租館資料失敗', error);
        return { success: false, message: '無法取得月租館資料' };
    }
}

// 取得書籍處理函數
async function handleGetBooks(event) {
    try {
        console.info(`${config.apiBaseUrl}${config.getBooks}`);
        const response = await axios.get(`${config.apiBaseUrl}${config.getBooks}`);
        return { success: true, books: response.data.ebooks };
    } catch (error) {
        console.error('取得書籍失敗', error);
        return { success: false, message: '無法取得書籍清單' };
    }
}

// 發送書籍資料到渲染進程
function handleBookDeatil(event, book, mainWindow) {
    console.log(mainWindow); // 調試 mainWindow 的狀態
    if (mainWindow) {
        mainWindow.webContents.send('book-detail', book);
    }
}

// 返回書籍列表
function handleBackToBookList(event, mainWindow) {
    if (mainWindow) {
        mainWindow.webContents.send('show-book-list'); // 返回書籍列表訊息
    }
}

// 註冊 IPC 事件
function registerIPC(mainWindow) {
    ipcMain.handle('login', handleLogin);
    ipcMain.handle('getBooks', handleGetBooks);
    ipcMain.handle('getMonthlyServiceData', handleGetMonthlyServiceData);
    ipcMain.handle('getMonthlyServiceAllBook', handleMonthlyAllGrop); // 新增的 IPC 處理程序
    ipcMain.on('back-to-book-list', (event) => handleBackToBookList(event, mainWindow));
    ipcMain.on('book-detail', (event, book) => handleBookDeatil(event, book, mainWindow));
}

module.exports = { registerIPC };