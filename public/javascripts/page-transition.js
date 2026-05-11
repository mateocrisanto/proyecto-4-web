(function () {
  "use strict";

  var FADE_MS = 220;
  var body = document.body;

  if (!body) {
    return;
  }

  function isSameOriginNavigation(url) {
    return url && url.origin === window.location.origin;
  }

  // Restore opacity when returning from browser cache/history.
  window.addEventListener("pageshow", function () {
    body.classList.remove("page-fade-out");
  });

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== 0) {
      return;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    var link = event.target.closest("a[href]");
    if (!link) {
      return;
    }

    if (link.target && link.target !== "_self") {
      return;
    }

    if (link.hasAttribute("download")) {
      return;
    }

    var href = link.getAttribute("href");
    if (!href || href.indexOf("javascript:") === 0) {
      return;
    }

    if (href.charAt(0) === "#") {
      return;
    }

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    if (!isSameOriginNavigation(url)) {
      return;
    }

    if (url.href === window.location.href) {
      return;
    }

    event.preventDefault();

    body.classList.add("page-fade-out");

    window.setTimeout(function () {
      window.location.assign(url.href);
    }, FADE_MS);
  });

  document.addEventListener(
    "submit",
    function (event) {
      if (event.defaultPrevented) {
        return;
      }

      var form = event.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      if (form.target && form.target !== "_self") {
        return;
      }

      var action = form.getAttribute("action") || window.location.href;
      var url;
      try {
        url = new URL(action, window.location.href);
      } catch (error) {
        return;
      }

      if (!isSameOriginNavigation(url)) {
        return;
      }

      event.preventDefault();
      body.classList.add("page-fade-out");

      window.setTimeout(function () {
        form.submit();
      }, FADE_MS);
    },
    true
  );
})();
