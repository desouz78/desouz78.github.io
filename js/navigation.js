
/* =========================================
   NAVIGATION
   ========================================= */

const homeLink = document.querySelector('.nav-links a[href="#top"]');
const aboutLink = document.querySelector('.nav-links a[href="#about"]');
const handsOnLink = document.querySelector('.nav-links a[href="#hands-on"]');

const aboutSection = document.getElementById("about");
const handsOnSection = document.getElementById("hands-on");

document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.removeProperty("scroll-behavior");
    history.replaceState(null, "", window.location.pathname + window.location.search);
    updateActiveNavigation();
  });
});

function updateActiveNavigation() {
  const aboutTop = aboutSection?.getBoundingClientRect().top ?? Infinity;
  const handsOnTop = handsOnSection?.getBoundingClientRect().top ?? Infinity;
  const threshold = 150;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;

  const active = handsOnTop <= threshold || (atBottom && handsOnTop < window.innerHeight) ? "hands-on" : aboutTop <= threshold ? "about" : "home";

  const links = { home: homeLink, about: aboutLink, "hands-on": handsOnLink };

  Object.entries(links).forEach(([name, link]) => {
    if (!link) return;
    const selected = name === active;
    link.classList.toggle("active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

window.addEventListener("scroll", updateActiveNavigation, { passive: true });
window.addEventListener("resize", updateActiveNavigation);
window.addEventListener("load", updateActiveNavigation);
window.addEventListener("pageshow", updateActiveNavigation);
window.addEventListener("hashchange", updateActiveNavigation);

updateActiveNavigation();
