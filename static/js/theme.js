(function () {
  var root = document.documentElement;

  function apply(choice) {
    if (choice === "light" || choice === "dark") {
      root.setAttribute("data-theme", choice);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function stored() {
    try {
      return localStorage.getItem("theme") || "system";
    } catch (e) {
      return "system";
    }
  }

  apply(stored());

  var options = { fonts: {}, archives: [], archive: "classic", archivePath: "/archive/" };
  try {
    options = JSON.parse(document.getElementById("theme-options").textContent);
  } catch (e) {}
  var fonts = options.fonts;
  var siteFont = root.getAttribute("data-font");

  function get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function set(key, value) {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch (e) {}
  }

  function applyFont(name) {
    root.setAttribute("data-font", name);
    var link = document.getElementById("font-css");
    var href = fonts[name];
    if (!href) {
      if (link) link.remove();
      return;
    }
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "font-css";
      document.head.appendChild(link);
    }
    if (link.getAttribute("href") !== href) link.href = href;
  }

  // Previews stick for the browser tab (sessionStorage).
  // ?font=<name> tries a pairing from the theme's font list; ?font= clears it.
  // ?tinker opens the tinker toolbar (press t to toggle it); ?tinker=off closes it.
  var query = new URLSearchParams(location.search);
  var fontParam = query.get("font");
  if (fontParam !== null) {
    set("font", fonts.hasOwnProperty(fontParam) && fontParam !== siteFont ? fontParam : null);
  }
  var tinkerParam = query.get("tinker");
  if (tinkerParam !== null) {
    set("tinker", /^(0|off|false|no)$/i.test(tinkerParam) ? null : "1");
  }

  var previewFont = get("font");
  if (previewFont && fonts.hasOwnProperty(previewFont)) {
    applyFont(previewFont);
  } else {
    previewFont = null;
  }

  // Archive layouts are rendered by the server, so trying one means fetching its preview page
  // (/archive/<layout>/) and swapping it in for the current .archive element.
  function archiveEl() {
    return document.querySelector(".archive");
  }

  function currentArchive() {
    var el = archiveEl();
    var match = el && /(?:^|\s)archive-(\w+)/.exec(el.className);
    return match ? match[1] : options.archive;
  }

  function showArchive(style, done) {
    var el = archiveEl();
    var url = options.archivePath + style + "/";
    if (!el) {
      location.href = url;
      return;
    }
    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error(response.status);
        return response.text();
      })
      .then(function (html) {
        var next = new DOMParser().parseFromString(html, "text/html").querySelector(".archive");
        if (!next) throw new Error("no archive");
        var current = archiveEl();
        if (current) current.replaceWith(document.importNode(next, true));
        if (done) done();
      })
      .catch(function () {
        location.href = url;
      });
  }

  function isArchiveRoot() {
    return location.pathname.replace(/\/?$/, "/") === options.archivePath.replace(/\/?$/, "/");
  }

  function tinkering() {
    return get("tinker") === "1";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var buttons = document.querySelectorAll(".theme-switcher button");
    var toolbar = null;
    var badge = null;

    function mark(choice) {
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.theme === choice);
      });
    }

    function renderBadge() {
      if (badge) badge.remove();
      badge = null;
      if (!previewFont || toolbar) return;
      badge = document.createElement("a");
      badge.className = "font-preview-badge";
      badge.href = "?font=";
      badge.textContent = "Font preview: " + previewFont + " ×";
      badge.setAttribute("aria-label", "Font preview: " + previewFont + ". Clear preview");
      document.body.appendChild(badge);
    }

    function field(label, names, selected, onChange) {
      var wrap = document.createElement("label");
      wrap.textContent = label;
      var select = document.createElement("select");
      names.forEach(function (name) {
        var option = document.createElement("option");
        option.value = option.textContent = name;
        select.appendChild(option);
      });
      select.value = selected;
      select.addEventListener("change", function () {
        onChange(select.value);
      });
      wrap.appendChild(select);
      return { wrap: wrap, select: select };
    }

    function openTinker() {
      if (toolbar) return;
      set("tinker", "1");
      toolbar = document.createElement("div");
      toolbar.className = "tinker";
      toolbar.setAttribute("role", "region");
      toolbar.setAttribute("aria-label", "Tinker");

      var title = document.createElement("strong");
      title.textContent = "Tinker";

      var font = field("Font", Object.keys(fonts), root.getAttribute("data-font"), function (name) {
        previewFont = name === siteFont ? null : name;
        set("font", previewFont);
        applyFont(name);
      });

      var archive = field("Archive", options.archives, get("archive") || currentArchive(), function (style) {
        set("archive", style === options.archive ? null : style);
        showArchive(style);
      });

      var reset = document.createElement("button");
      reset.type = "button";
      reset.textContent = "Reset";
      reset.addEventListener("click", function () {
        previewFont = null;
        set("font", null);
        set("archive", null);
        applyFont(siteFont);
        font.select.value = siteFont;
        archive.select.value = options.archive;
        if (archiveEl() && currentArchive() !== options.archive) showArchive(options.archive);
      });

      var close = document.createElement("button");
      close.type = "button";
      close.textContent = "×";
      close.setAttribute("aria-label", "Close tinker toolbar");
      close.title = "Close (t)";
      close.addEventListener("click", closeTinker);

      toolbar.append(title, font.wrap, archive.wrap, reset, close);
      document.body.appendChild(toolbar);
      renderBadge();
    }

    function closeTinker() {
      if (!toolbar) return;
      set("tinker", null);
      toolbar.remove();
      toolbar = null;
      renderBadge();
    }

    if (tinkering()) openTinker();
    renderBadge();

    // A picked archive layout sticks while tinkering, so /archive/ shows it on arrival.
    var pickedArchive = get("archive");
    if (
      tinkering() &&
      pickedArchive &&
      options.archives.indexOf(pickedArchive) !== -1 &&
      isArchiveRoot() &&
      currentArchive() !== pickedArchive
    ) {
      showArchive(pickedArchive);
    }

    // t toggles the toolbar; Escape closes it. Ignored while typing or with a modifier held.
    document.addEventListener("keydown", function (event) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      var target = event.target;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.key === "t" || event.key === "T") {
        toolbar ? closeTinker() : openTinker();
      } else if (event.key === "Escape") {
        closeTinker();
      }
    });

    mark(stored());

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var choice = button.dataset.theme;
        try {
          localStorage.setItem("theme", choice);
        } catch (e) {}
        apply(choice);
        mark(choice);
      });
    });
  });
})();
