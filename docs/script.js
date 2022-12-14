window.onscroll = function() {
  if (infiniteScrollEnabled && nextPostUrl && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    infiniteScrollEnabled = false;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", nextPostUrl, true);
    xhr.onload = function() {
      var posts = document.getElementById("blog-posts");
      var newPost = document.createElement("div");
      newPost.innerHTML = xhr.response;
      posts.appendChild(newPost);
      nextPostUrl = newPost.querySelector(".pagination a").getAttribute("href");
      infiniteScrollEnabled = true;
    };
    xhr.send();
  }
};