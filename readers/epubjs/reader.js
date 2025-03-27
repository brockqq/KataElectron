window.electronAPI.onOpenEpub((filePath) => {
  const book = ePub(filePath);
  const rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%",
  });
  rendition.display();
});