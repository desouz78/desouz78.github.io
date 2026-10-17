
/* =========================================
   ABOUT ME - LIVE IDENTITY TIMER
   ========================================= */

// July 25, 2001, approximately 10:00 PM (UTC-3).
const birthYear = 2001;

function birthdayIn(year) {
  return new Date(`${year}-07-25T22:00:00-03:00`);
}

const timerElements = {
  years: document.querySelector('[data-time="years"]'),
  days: document.querySelector('[data-time="days"]'),
  hours: document.querySelector('[data-time="hours"]'),
  minutes: document.querySelector('[data-time="minutes"]'),
  seconds: document.querySelector('[data-time="seconds"]')
};

function updateIdentityTimer() {
  const now = new Date();

  let years = now.getUTCFullYear() - birthYear;
  let lastBirthday = birthdayIn(birthYear + years);

  if (now < lastBirthday) {
    years--;
    lastBirthday = birthdayIn(birthYear + years);
  }

  let remaining = Math.floor((now - lastBirthday) / 1000);

  const days = Math.floor(remaining / 86400);
  remaining %= 86400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const values = {
    years: years,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };

  for (const [unit, element] of Object.entries(timerElements)) {
    if (!element) continue;
    element.textContent = String(values[unit]).padStart(unit === "days" ? 3 : 2, "0");
  }
}

if (Object.values(timerElements).every(Boolean)) {
  updateIdentityTimer();
  setInterval(updateIdentityTimer, 1000);
}



/* =========================================
   CONTINUOUS TRANSMISSION CABLE
   ========================================= */

const main = document.querySelector("main.container");
const cable = document.getElementById("transmission-cable");
const cablePaths = cable ? [...cable.querySelectorAll("path")] : [];

const progressMask = cable ? cable.querySelector("#cable-progress-mask") : null;
const progressPath = cable ? cable.querySelector(".cable-progress-path") : null;

const portrait = document.getElementById("about-photo");
const counter = document.querySelector(".about-timer");
const about = document.querySelector(".about-story");
const chapters = about ? [...about.querySelectorAll(".about-chapter")] : [];

function drawTransmissionCable() {
  if (!main || !cable || !portrait || !counter || chapters.length < 3) return;
  if (typeof window.getAntennaCableAnchor !== "function") return;

  const anchor = window.getAntennaCableAnchor();
  const base = main.getBoundingClientRect();
  const image = portrait.getBoundingClientRect();
  const clock = counter.getBoundingClientRect();
  const academic = chapters[1].getBoundingClientRect();
  const personal = chapters[2].getBoundingClientRect();
  const story = about.getBoundingClientRect();

  const x = value => value - base.left;
  const y = value => value - base.top;

  const sx = x(anchor.x);
  const sy = y(anchor.y);
  const ex = x(anchor.exitX);
  const ey = y(anchor.exitY);

  const pl = x(image.left);
  const pr = x(image.right);
  const pt = y(image.top);
  const pb = y(image.bottom);
  const pc = (pl + pr) / 2;
  const exitY = pt + (pb - pt) * 0.62;

  const tl = x(clock.left);
  const tr = x(clock.right);
  const tt = y(clock.top);
  const tb = y(clock.bottom);

  const railX = x(story.left) + 8;
  const academicY = y(academic.top) + 4;
  const personalY = y(personal.top) + 4;

  
  // Straight cable segments connecting the antenna and About.
  const pad = 14;

  const photoTopX = pc;
  const photoTopY = pt - pad;

  const photoRightX = pr + pad;
  const photoLeftX = pl - pad;
  const photoBottomY = pb + pad;
  const photoExitY = pt + (pb - pt) * 0.56;

  const timerLeftX = tl - pad;
  const timerRightX = tr + pad;
  const timerTopY = tt - pad;
  const timerBottomY = tb + pad;

  const downAfterTimerY = academicY - 28;

    const d = [
    // Follow the mast before turning downward
    `M ${sx} ${sy}`,
    `L ${ex} ${ey}`,
    `L ${ex} ${photoTopY}`,
    `L ${photoTopX} ${photoTopY}`,

    // Around the photograph
    `L ${photoRightX} ${photoTopY}`,
    `L ${photoRightX} ${photoBottomY}`,
    `L ${photoLeftX} ${photoBottomY}`,
    `L ${photoLeftX} ${photoExitY}`,

    // Toward the counter
    `L ${timerRightX} ${photoExitY}`,
    `L ${timerRightX} ${timerTopY}`,
    `L ${timerLeftX} ${timerTopY}`,
    `L ${timerLeftX} ${timerBottomY}`,
    `L ${timerRightX} ${timerBottomY}`,

    // Toward the academic section
    `L ${timerRightX} ${downAfterTimerY}`,
    `L ${railX} ${downAfterTimerY}`,
    `L ${railX} ${academicY}`,
    `L ${railX} ${personalY}`
  ].join(" ");

  cable.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);

  for (const path of cablePaths) {
    path.setAttribute("d", d);
  }

  // Reveal the moving signals as the visitor scrolls.
  if (progressMask && progressPath) {
    progressMask.setAttribute("x", "-50");
    progressMask.setAttribute("y", "-50");
    progressMask.setAttribute("width", base.width + 100);
    progressMask.setAttribute("height", base.height + 100);

    const length = progressPath.getTotalLength();

    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );

    const cableStart = anchor.y + window.scrollY;

    const startScroll = Math.max(
      0,
      Math.min(maxScroll - 1, cableStart - window.innerHeight * 0.65)
    );

    const progress = Math.max(
      0,
      Math.min(
        1,
        (window.scrollY - startScroll) / Math.max(1, maxScroll - startScroll)
      )
    );

    progressPath.style.strokeDasharray =
      `${(length * progress).toFixed(1)} ${length.toFixed(1)}`;
  }
}

if (cable) {
  window.addEventListener("antenna-cable-ready", drawTransmissionCable);
  window.addEventListener("resize", drawTransmissionCable);
  window.addEventListener("scroll", drawTransmissionCable, { passive: true });
  window.addEventListener("pointermove", drawTransmissionCable, { passive: true });
  window.addEventListener("load", drawTransmissionCable);

  // Also follows the antenna's smooth rotation after dragging.
  setInterval(drawTransmissionCable, 120);
}


/* =========================================
   DYNAMIC SIGNAL PARTICLES
   ========================================= */

const particleLayer = cable?.querySelector(".cable-particles");
const signalPath = progressPath;
const signalColors = ["#ff642e", "#ff8b42", "#ffb46a", "#ffe0a8"];

if (particleLayer && signalPath) {
  const svgNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const particles = Array.from({ length: 420 }, () => {
    const dot = document.createElementNS(svgNS, "circle");

    dot.setAttribute("r", (1.4 + Math.random() * 1.7).toFixed(2));
    dot.setAttribute("fill", signalColors[Math.floor(Math.random() * signalColors.length)]);
    dot.setAttribute("opacity", (0.45 + Math.random() * 0.5).toFixed(2));

    particleLayer.appendChild(dot);

    return {
      dot,
      phase: Math.random(),
      lane: (Math.random() - 0.5) * 27,
      speed: 35 + Math.random() * 110,
      jitter: Math.random() * Math.PI * 2
    };
  });

  let lastFrame = 0;

  function animateSignals(time) {
    if (time - lastFrame >= 40 || reduceMotion) {
      const length = signalPath.getTotalLength();

      if (length > 1) {
        for (const particle of particles) {
          const distance = (
            particle.phase * length +
            (reduceMotion ? 0 : time) * particle.speed / 1000
          ) % length;

          const point = signalPath.getPointAtLength(distance);
          const next = signalPath.getPointAtLength(Math.min(length, distance + 2));

          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const magnitude = Math.max(0.001, Math.hypot(dx, dy));

          const normalX = -dy / magnitude;
          const normalY = dx / magnitude;    

          const jitter = reduceMotion
            ? 0
            : Math.sin(time * 0.008 + particle.jitter) * 2.2;

          const offset = particle.lane + jitter;

          particle.dot.setAttribute("cx", (point.x + normalX * offset).toFixed(1));
          particle.dot.setAttribute("cy", (point.y + normalY * offset).toFixed(1));
        }
      }

      lastFrame = time;
    }

    if (!reduceMotion) requestAnimationFrame(animateSignals);
  }

  requestAnimationFrame(animateSignals);
}

