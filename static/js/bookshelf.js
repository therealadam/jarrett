// Bookshelf shortcode: tabs between shelves, and click a book to pull it out of the grid with its posts.
// State lives in the hash: #shelf-<key> or #shelf-<key>/<isbn>. Without JS all shelves show and covers are plain links.
(function () {
  document.querySelectorAll("[data-bookshelves]").forEach(function (root) {
    var shelves = root.querySelectorAll(".bookshelf");
    if (!shelves.length) return;
    var tabs = root.querySelectorAll(".bookshelf-nav a");
    root.classList.add("is-live");

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // FLIP: remember where each book was, apply the change, then slide each one from its old spot to its new one.
    // A book that opens or closes also changes size, so its cover scales and its text fades in.
    var ease = "cubic-bezier(.2,.7,.2,1)";
    function flip(change) {
      var books = Array.prototype.slice.call(root.querySelectorAll(".bookshelf:not([hidden]) .book"));
      var before = books.map(function (b) {
        return { box: b.getBoundingClientRect(), cover: b.querySelector(".book-cover").getBoundingClientRect(), open: b.classList.contains("is-open") };
      });
      change();
      if (reduce.matches || !books.length || !books[0].animate) return;
      books.forEach(function (b, i) {
        var was = before[i];
        if (was.open !== b.classList.contains("is-open")) {
          var cover = b.querySelector(".book-cover"), now = cover.getBoundingClientRect();
          cover.style.transformOrigin = "0 0";
          cover.animate([
            { transform: "translate(" + (was.cover.left - now.left) + "px," + (was.cover.top - now.top) + "px) scale(" + was.cover.width / now.width + "," + was.cover.height / now.height + ")" },
            { transform: "none" }
          ], { duration: 360, easing: ease });
          b.querySelectorAll(".book-meta, .book-detail").forEach(function (el) {
            el.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
              { duration: 300, delay: 140, easing: "ease-out", fill: "backwards" });
          });
        } else {
          var now2 = b.getBoundingClientRect(), dx = was.box.left - now2.left, dy = was.box.top - now2.top;
          if (dx || dy) b.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 360, easing: ease });
        }
      });
    }

    function show(key, isbn) {
      var found = false;
      shelves.forEach(function (s) { if (s.dataset.shelf === key) found = true; });
      if (!found) key = shelves[0].dataset.shelf;
      shelves.forEach(function (s) {
        s.hidden = s.dataset.shelf !== key;
        s.querySelectorAll(".book").forEach(function (b) {
          b.classList.toggle("is-open", !s.hidden && b.dataset.isbn === isbn);
        });
        s.classList.toggle("has-open", !s.hidden && !!s.querySelector(".book.is-open"));
      });
      tabs.forEach(function (t) {
        if (t.dataset.shelf === key) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
    }

    function fromHash(animate) {
      var m = location.hash.match(/^#shelf-([^/]+)(?:\/(.+))?$/);
      var apply = function () {
        if (m) show(decodeURIComponent(m[1]), m[2]);
        else show(shelves[0].dataset.shelf);
      };
      var current = root.querySelector(".bookshelf:not([hidden])");
      var next = m ? decodeURIComponent(m[1]) : shelves[0].dataset.shelf;
      // Animate only when staying on the same shelf (focusing or defocusing a book).
      if (animate && current && current.dataset.shelf === next) flip(apply);
      else apply();
    }

    function go(key, isbn) {
      var hash = "#shelf-" + key + (isbn ? "/" + isbn : "");
      if (history.replaceState) { history.replaceState(null, "", hash); fromHash(true); }
      else location.hash = hash;
    }

    root.addEventListener("click", function (e) {
      var tab = e.target.closest(".bookshelf-nav a");
      if (tab) { e.preventDefault(); go(tab.dataset.shelf); return; }
      var shelf = e.target.closest(".bookshelf");
      if (!shelf) return;
      if (e.target.closest(".book-close")) { go(shelf.dataset.shelf); return; }
      var cover = e.target.closest(".book-cover");
      if (cover) {
        e.preventDefault();
        var book = cover.closest(".book");
        go(shelf.dataset.shelf, book.classList.contains("is-open") ? "" : book.dataset.isbn);
        if (book.classList.contains("is-open")) book.scrollIntoView({ block: "nearest" });
      }
    });

    window.addEventListener("hashchange", function () { fromHash(true); });
    fromHash();
  });
})();
