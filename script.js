function updateCountdown() {
  const wedding = new Date("2026-09-26T15:00:00+08:00");
  const now = new Date();
  const diff = wedding - now;

  if (diff <= 0) {
    ["cd-days", "cd-hours", "cd-mins", "cd-secs"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    return;
  }

  document.getElementById("cd-days").textContent = Math.floor(diff / 86400000);
  document.getElementById("cd-hours").textContent = String(
    Math.floor((diff % 86400000) / 3600000)
  ).padStart(2, "0");
  document.getElementById("cd-mins").textContent = String(
    Math.floor((diff % 3600000) / 60000)
  ).padStart(2, "0");
  document.getElementById("cd-secs").textContent = String(
    Math.floor((diff % 60000) / 1000)
  ).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);


// THEME SWITCH

const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeLabel = document.getElementById("theme-label");

function applyTheme(theme) {
  root.dataset.theme = theme;

  const dark = theme === "dark";

  themeIcon.textContent = dark ? "☀" : "☾";
  themeLabel.textContent = dark ? "Light" : "Dark";

  localStorage.setItem("wedding-theme", theme);
}

function getTheme() {
  const saved = localStorage.getItem("wedding-theme");

  if (saved) return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

applyTheme(getTheme());

themeToggle.addEventListener("click", () => {
  applyTheme(
    root.dataset.theme === "dark"
      ? "light"
      : "dark"
  );
});


// TOAST NOTIFICATION

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 3500);
}


// RSVP GOOGLE SHEET

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzAHKtY7I5Oal9otP2u1MGP55Ng3Laf4HjsNyJUf5bfK0U0Pq4KAOUrM-043DRLz7OiJw/exec";


const rsvpForm = document.getElementById("rsvp-form");


rsvpForm.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(rsvpForm);

  const data = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    contactNumber: formData.get("contactNumber"),
    attendance: formData.get("attendance"),
    numberOfGuests: formData.get("guestCount"),
    message: formData.get("message")
  };


  if (!/^09\d{9}$/.test(data.contactNumber)) {
    showToast(
      "Please enter a valid Philippine mobile number.",
      "error"
    );
    return;
  }


  try {

const response = await fetch(GOOGLE_SCRIPT_URL, {
  method: "POST",
  body: JSON.stringify(data)
});


const result = await response.json();


    if (result.duplicate) {

      showToast(
        "You already submitted your RSVP ♡",
        "error"
      );

      return;
    }


    if (result.success) {

      showToast(
        `Thank you ${data.firstName}! Your RSVP has been recorded ♡`
      );

      rsvpForm.reset();

    } else {

      showToast(
        "Something went wrong. Please try again.",
        "error"
      );

    }


  } catch(error) {

    console.error(error);

    showToast(
      "Unable to submit RSVP. Please try again.",
      "error"
    );

  }

});


// VENUE FLOWERS

const floralTargets = [
  document.getElementById("venue"),
  document.querySelector(".countdown"),
  document.getElementById("details")
].filter(Boolean);


if (floralTargets.length) {

  const floralObserver = new IntersectionObserver(
    entries => {

      const showFlowers = entries.some(
        entry =>
          entry.isIntersecting &&
          entry.intersectionRatio > 0.12
      );

      document.body.classList.toggle(
        "show-venue-flowers",
        showFlowers
      );

    },
    {
      threshold: [0, 0.12, 0.25, 0.5]
    }
  );


  floralTargets.forEach(section => {
    floralObserver.observe(section);
  });

}
