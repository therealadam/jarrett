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

  // Font preview: ?font=<name> tries a pairing from the theme's font list for this tab; ?font= clears it.
  var fonts = {};
  try {
    fonts = JSON.parse(document.getElementById("font-options").textContent);
  } catch (e) {}
  var siteFont = root.getAttribute("data-font");

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

  var previewFont = null;
  try {
    var param = new URLSearchParams(location.search).get("font");
    if (param !== null) {
      if (fonts.hasOwnProperty(param) && param !== siteFont) {
        sessionStorage.setItem("font", param);
      } else {
        sessionStorage.removeItem("font");
      }
    }
    previewFont = sessionStorage.getItem("font");
  } catch (e) {}
  if (previewFont && fonts.hasOwnProperty(previewFont)) {
    applyFont(previewFont);
  } else {
    previewFont = null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (previewFont) {
      var badge = document.createElement("a");
      badge.className = "font-preview-badge";
      badge.href = "?font=";
      badge.textContent = "Font preview: " + previewFont + " \u00d7";
      badge.setAttribute("aria-label", "Font preview: " + previewFont + ". Clear preview");
      document.body.appendChild(badge);
    }

    var buttons = document.querySelectorAll(".theme-switcher button");

    function mark(choice) {
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.theme === choice);
      });
    }

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
