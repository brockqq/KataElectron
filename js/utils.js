// 顯示載入中的提示
function showLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'block';
    }
}

// 隱藏載入中的提示
function hideLoading() {
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

module.exports = {
    showLoading,
    hideLoading
};