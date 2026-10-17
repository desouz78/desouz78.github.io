
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

  // One continuous path: mast -> photo -> timer -> chapters.
  const d = [
    `M ${sx} ${sy}`,
    `C ${sx} ${sy + 65}, ${pc} ${pt - 65}, ${pc} ${pt - 9}`,

    // Around the portrait
    `L ${pr - 12} ${pt - 9}`,
    `Q ${pr + 9} ${pt - 9}, ${pr + 9} ${pt + 12}`,
    `L ${pr + 9} ${pb - 12}`,
    `Q ${pr + 9} ${pb + 9}, ${pr - 12} ${pb + 9}`,
    `L ${pl + 12} ${pb + 9}`,
    `Q ${pl - 9} ${pb + 9}, ${pl - 9} ${pb - 12}`,
    `L ${pl - 9} ${exitY}`,

    // From portrait to counter
    `C ${pl - 9} ${exitY - 28}, ${tr + 34} ${tt - 9}, ${tr + 9} ${tt - 9}`,

    // Around the counter
    `L ${tl + 12} ${tt - 9}`,
    `Q ${tl - 9} ${tt - 9}, ${tl - 9} ${tt + 12}`,
    `L ${tl - 9} ${tb - 12}`,
    `Q ${tl - 9} ${tb + 9}, ${tl + 12} ${tb + 9}`,
    `L ${tr + 9} ${tb + 9}`,

    // Continue toward the academic chapter
    `C ${tr + 45} ${tb + 29}, ${tr + 45} ${academicY - 67}, ${tr + 15} ${academicY - 65}`,
    `C ${tr - 40} ${academicY - 63}, ${railX + 95} ${academicY - 35}, ${railX} ${academicY - 30}`,
    `L ${railX} ${academicY}`,

    // Continue toward the personal chapter
    `C ${railX + 25} ${academicY + 65}, ${railX - 25} ${personalY - 65}, ${railX} ${personalY}`
  ].join(" ");

  cable.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);

  for (const path of cablePaths) {
    path.setAttribute("d", d);
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
