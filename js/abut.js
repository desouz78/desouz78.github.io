
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
