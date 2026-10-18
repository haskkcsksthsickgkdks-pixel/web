/**
 * WESTWOOD — Seamless SPA Navigation Router (PJAX)
 * Keeps the Spotify player and background atmosphere playing 100% uninterrupted
 * across page transitions (Home <-> Members <-> Admin).
 */

(() => {
  "use strict";

  let loadingBar = null;

  function initLoadingBar() {
    if (document.getElementById("spaLoadingBar")) {
      loadingBar = document.getElementById("spaLoadingBar");
      return;
    }
    loadingBar = document.createElement("div");
    loadingBar.id = "spaLoadingBar";
    loadingBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--accent, #e50914), #1db954);
      z-index: 9999999;
      pointer-events: none;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      opacity: 0;
      box-shadow: 0 0 10px rgba(229, 9, 20, 0.7);
    `;
    document.body.appendChild(loadingBar);
  }

  function showLoadingBar() {
    if (!loadingBar) initLoadingBar();
    loadingBar.style.opacity = "1";
    loadingBar.style.width = "40%";
    setTimeout(() => {
      if (loadingBar.style.opacity === "1") {
        loadingBar.style.width = "80%";
      }
    }, 150);
  }

  function hideLoadingBar() {
    if (!loadingBar) return;
    loadingBar.style.width = "100%";
    setTimeout(() => {
      loadingBar.style.opacity = "0";
      setTimeout(() => {
        loadingBar.style.width = "0%";
      }, 250);
    }, 150);
  }

  function updateNavActive(url) {
    const parsed = new URL(url, window.location.href);
    let targetFile = parsed.pathname.split("/").pop() || "index.html";
    if (targetFile === "") targetFile = "index.html";

    document.querySelectorAll(".topbar .nav a, .nav a").forEach(a => {
      const aHref = a.getAttribute("href") || "";
      let aFile = aHref.split("/").pop() || "index.html";
      if (aFile === "") aFile = "index.html";

      if (aFile === targetFile) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  }

  async function navigate(url, push = true) {
    const currentUrl = window.location.href;
    const targetUrl = new URL(url, currentUrl).href;

    if (currentUrl === targetUrl && !push) {
      return;
    }

    showLoadingBar();

    try {
      const res = await fetch(targetUrl, {
        headers: { "X-Requested-With": "Westwood-SPA" }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // 1. Update Title & Body class
      document.title = doc.title;
      if (doc.body.className) {
        document.body.className = doc.body.className;
      }

      // 2. Swap Content inside #pageContent
      const currentContainer = document.getElementById("pageContent");
      const newContainer = doc.getElementById("pageContent");

      if (currentContainer && newContainer) {
        // Quick smooth fade transition
        currentContainer.style.opacity = "0";
        currentContainer.style.transform = "translateY(8px)";
        currentContainer.style.transition = "opacity 0.15s ease, transform 0.15s ease";

        setTimeout(() => {
          currentContainer.innerHTML = newContainer.innerHTML;
          currentContainer.style.opacity = "1";
          currentContainer.style.transform = "translateY(0)";

          // Re-bind page scripts
          runPageLifecycle(targetUrl);
        }, 120);
      } else {
        // Fallback if structure differs
        window.location.href = targetUrl;
        return;
      }

      // 3. Update History
      if (push) {
        window.history.pushState({ url: targetUrl }, "", targetUrl);
      }

      // 4. Update Nav Links
      updateNavActive(targetUrl);

      // 5. Scroll to Top
      window.scrollTo({ top: 0, behavior: "instant" });

      // 6. Dispatch event
      window.dispatchEvent(new CustomEvent("westwood:page-changed", { detail: { url: targetUrl } }));

    } catch (err) {
      console.warn("SPA Navigation error, falling back to full navigation:", err);
      window.location.href = targetUrl;
    } finally {
      setTimeout(hideLoadingBar, 200);
    }
  }

  function runPageLifecycle(url) {
    const path = new URL(url, window.location.href).pathname.toLowerCase();

    if (path.includes("members.html")) {
      window.initMembersPage?.();
    } else if (path.includes("admin.html")) {
      window.initAdminPage?.();
    } else {
      // Home page
      window.initHomePage?.();
    }

    // Always re-bind sound interactions on buttons
    window.initSoundInteractions?.();
  }

  function setupLinkInterception() {
    document.addEventListener("click", (e) => {
      // Find nearest <a> tag
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Ignore anchor jumps, special protocols, downloads, target blanks
      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download") ||
        link.classList.contains("no-spa")
      ) {
        return;
      }

      const target = new URL(href, window.location.href);

      // Check same origin
      if (target.origin !== window.location.origin) {
        return;
      }

      // Check if it's one of our site pages
      const allowed = ["", "index.html", "members.html", "admin.html"];
      const filename = target.pathname.split("/").pop();

      if (allowed.includes(filename)) {
        e.preventDefault();
        navigate(target.href, true);
      }
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      navigate(window.location.href, false);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoadingBar();
    setupLinkInterception();
  });

  window.WestwoodSPA = {
    navigate: navigate
  };
})();
