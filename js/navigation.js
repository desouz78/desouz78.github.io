
/* =========================================
   NAVIGATION
   ========================================= */

const homeLink = document.querySelector('.nav-links a[href="#top"]');
const aboutLink = document.querySelector('.nav-links a[href="#about"]');
const aboutSection = document.getElementById("about");

// Always return to the absolute top.
document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();

    const root = document.documentElement;
    root.style.scrollBehavior = "auto";

    window.scrollTo(0, 0);

    root.style.removeProperty("scroll-behavior");

    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );

    updateActiveNavigation();
  });
});

// Highlight the section currently being viewed.
function updateActiveNavigation() {
  if (!homeLink || !aboutLink || !aboutSection) return;

  const inAbout = aboutSection.getBoundingClientRect().top <= 140;

  homeLink.classList.toggle("active", !inAbout);
  aboutLink.classList.toggle("active", inAbout);

  if (inAbout) {
    aboutLink.setAttribute("aria-current", "page");
    homeLink.removeAttribute("aria-current");
  } else {
    homeLink.setAttribute("aria-current", "page");
    aboutLink.removeAttribute("aria-current");
  }
}

window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("load", updateActiveNavigation);
window.addEventListener("pageshow", updateActiveNavigation);

updateActiveNavigation();
