
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
  });
});
