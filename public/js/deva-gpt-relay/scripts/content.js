const article = document.querySelector(".w-full");

console.log("article", article);
// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  article.value = "Your chrome extension is working it can insert data."
  setTimeout(() => {
    alert('we found the article');
  }, 5000)
}
