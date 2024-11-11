const { ipcRenderer } = require('electron');
const { showLoading, hideLoading } = require('./utils'); // 引入共用的 utils.js

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = await ipcRenderer.invoke('login', username, password);
    alert(result.message);

    if (result.success) {
        document.getElementById('fetchBooks').style.display = 'block';
        document.getElementById('monthlyService').style.display = 'block';
    }
});

// 取得書籍清單的按鈕點擊處理
document.getElementById('fetchBooks').addEventListener('click', async () => {
    await getBooks(); // 調用取得普通書籍的函數
});

// 新增的按鈕 monthlyService 點擊處理
document.getElementById('monthlyService').addEventListener('click', async () => {
    showLoading(); // 顯示載入提示

    // 調用 API X 來取得月租館資料
    const result = await ipcRenderer.invoke('getMonthlyServiceData');
    const monthlyServiceList = document.getElementById('monthlyServiceList');

    // 清空書籍列表
    monthlyServiceList.innerHTML = '';

    if (result.success) {
        result.books.forEach((book, index) => {
            const li = document.createElement('li');
            li.classList.add('book-item');

            if (index === 0) {
                li.classList.add('selected');
                // li.style.border = '2px solid yellow';
                ipcRenderer.invoke('getMonthlyServiceAllBook', book.serviceCode)
                    .then((details) => {
                        if (details.success) {
                            appendBooks(details.books, 'monthly-detail');
                        } else {
                            console.error('無法獲取月租館詳細書籍資料:', details.message);
                        }
                    });
            }

            const monthlyContent = document.createElement('div');
            monthlyContent.classList.add('book-content');
            const img = document.createElement('img');
            img.src = book.picUrlBig || 'default-image.jpg';
            img.style.width = '100px';
            img.style.height = '150px';

            const title = document.createElement('span');
            title.textContent = book.serviceName + book.serviceCode || '無標題';
            title.classList.add('book-title');

            monthlyContent.appendChild(img);
            monthlyContent.appendChild(title);

            monthlyContent.addEventListener('click', async () => {
                const allItems = document.querySelectorAll('.book-item');
                allItems.forEach(item => {
                    item.classList.remove('selected');
                    item.style.border = 'none';
                });

                li.classList.add('selected');
                // li.style.border = '2px solid yellow';                
                showLoading(); // 顯示載入提示
                try {
                    const details = await ipcRenderer.invoke('getMonthlyServiceAllBook', book.serviceCode);
                    if (details.success) {
                        const bookList = document.getElementById('bookList');
                        bookList.innerHTML = '';
                        appendBooks(details.books, 'monthly-detail');
                    } else {
                        alert(details.message);
                    }
                } catch (error) {
                    console.error("取得月租館下所有書籍時出現錯誤：", error);
                    alert('無法取得月租館下所有書籍，請稍後重試。');
                } finally {
                    hideLoading();
                }
            });

            li.appendChild(monthlyContent);
            monthlyServiceList.appendChild(li);
        });

        hideLoading(); // 隱藏載入提示
    } else {
        alert(result.message);
        hideLoading();
    }
});

async function getBooks() {
    const monthlyServiceList = document.getElementById('monthlyServiceList');
    monthlyServiceList.innerHTML = '';
    try {
        showLoading();
        const result = await ipcRenderer.invoke('getBooks');
        console.info("API 返回的完整結果：", result);

        if (result.success) {
            console.info("書籍數據：", result.books);
            appendBooks(result.books, 'normal');
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("取得書籍清單時出現錯誤：", error);
        alert('無法取得書籍清單，請稍後重試。');
    } finally {
        hideLoading();
    }
}

function appendBooks(books, type) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach((book) => {
        const li = document.createElement('li');
        li.classList.add('book-item');
        li.classList.add(type);

        const bookContent = document.createElement('div');
        bookContent.classList.add('book-content');

        const img = document.createElement('img');
        img.src = "https://img.mybook.momoshop.com.tw" + book.cover || 'default-image.jpg';
        img.style.width = '100px';
        img.style.height = '150px';

        img.addEventListener('click', () => {
            showBookDetail(book);
        });

        const title = document.createElement('span');
        title.textContent = book.title || '無標題';
        title.classList.add('book-title');

        bookContent.appendChild(img);
        bookContent.appendChild(title);
        li.appendChild(bookContent);
        bookList.appendChild(li);
    });
}

function showBookDetail(book) {
    document.getElementById('bookList').style.display = 'none';
    document.getElementById('bookDetail').style.display = 'block';
    const iframe = document.getElementById('bookDetailIframe');
    iframe.contentWindow.postMessage({ type: 'show-book-detail', book: book }, '*');
}

window.addEventListener('message', async (event) => {
    if (event.data.type === 'back-to-book-list') {
        document.getElementById('bookDetail').style.display = 'none';
        document.getElementById('bookList').style.display = '';
        document.getElementById('fetchBooks').style.display = '';
        document.getElementById('monthlyService').style.display = '';
        await getBooks();
    }
});
