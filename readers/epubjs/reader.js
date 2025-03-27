window.electronAPI.onOpenEpub((filePath) => {
  console.log("📘 EPUB 路徑：", filePath);

  window.electronAPI.readEpub(filePath)
    .then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/epub+zip' });
      const blobUrl = URL.createObjectURL(blob);

      const book = ePub(blobUrl);
      const rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
      });
      rendition.display();
    })
    .catch(err => console.error("❌ 讀檔失敗", err));
});