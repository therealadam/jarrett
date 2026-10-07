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

  document.addEventListener("DOMContentLoaded", function () {
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
