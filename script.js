const app = document.getElementById("app");

const quotes = [
  "One day at a time.",
  "Small wins become big wins.",
  "Stay strong today.",
  "Discipline beats excuses.",
  "Your future self will thank you.",
  "Focus. Breathe. Continue.",
  "Progress matters more than perfection."
];

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function loadData() {
  return {
    pin: localStorage.getItem("dd_pin") || "",
    streak: Number(localStorage.getItem("dd_streak") || 0),
    bestStreak: Number(localStorage.getItem("dd_bestStreak") || 0),
    resets: Number(localStorage.getItem("dd_resets") || 0),
    lastMarkedDate: localStorage.getItem("dd_lastMarkedDate") || "",
    completedDates: JSON.parse(localStorage.getItem("dd_completedDates") || "[]")
  };
}

function saveData(data) {
  localStorage.setItem("dd_pin", data.pin);
  localStorage.setItem("dd_streak", data.streak);
  localStorage.setItem("dd_bestStreak", data.bestStreak);
  localStorage.setItem("dd_resets", data.resets);
  localStorage.setItem("dd_lastMarkedDate", data.lastMarkedDate);
  localStorage.setItem("dd_completedDates", JSON.stringify(data.completedDates));
}

function showToast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function showModal(title, message, onYes) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn-secondary" id="modalNo">No</button>
        <button class="btn-primary" id="modalYes">Yes</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  backdrop.querySelector("#modalNo").onclick = () => backdrop.remove();
  backdrop.querySelector("#modalYes").onclick = () => {
    backdrop.remove();
    onYes();
  };
}

function showInfoModal(title, message) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn-primary" id="modalOk">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.querySelector("#modalOk").onclick = () => backdrop.remove();
}

function recentDays(count = 14) {
  const today = new Date();
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

function todayQuote() {
  const day = new Date().getDate();
  return quotes[day % quotes.length];
}

function renderApp() {
  const data = loadData();

  if (!data.pin) {
    renderSetPin();
    return;
  }

  renderLogin();
}

function renderSetPin() {
  app.innerHTML = `
    <div class="center">
      <div class="auth-box">
        <h2>Set PIN</h2>
        <p class="subtitle">Create a 4-digit PIN for Discipline Days</p>
        <input id="pin1" type="password" maxlength="4" placeholder="Enter PIN" />
        <input id="pin2" type="password" maxlength="4" placeholder="Confirm PIN" />
        <button class="btn-primary" id="savePinBtn">Save PIN</button>
      </div>
    </div>
  `;

  document.getElementById("savePinBtn").onclick = () => {
    const pin1 = document.getElementById("pin1").value.trim();
    const pin2 = document.getElementById("pin2").value.trim();

    if (pin1.length !== 4 || pin2.length !== 4) {
      showToast("PIN must be 4 digits");
      return;
    }

    if (pin1 !== pin2) {
      showToast("PIN does not match");
      return;
    }

    const data = loadData();
    data.pin = pin1;
    saveData(data);
    showToast("PIN saved");
    renderLogin();
  };
}

function renderLogin() {
  app.innerHTML = `
    <div class="center">
      <div class="auth-box">
        <h2>Unlock Discipline Days</h2>
        <p class="subtitle">Enter your 4-digit PIN</p>
        <input id="loginPin" type="password" maxlength="4" placeholder="PIN" />
        <button class="btn-primary" id="unlockBtn">Unlock</button>
      </div>
    </div>
  `;

  document.getElementById("unlockBtn").onclick = () => {
    const entered = document.getElementById("loginPin").value.trim();
    const data = loadData();

    if (entered === data.pin) {
      renderHome();
    } else {
      showToast("Wrong PIN");
    }
  };
}

function renderHome() {
  const data = loadData();
  const markedToday = data.lastMarkedDate === getTodayKey();
  const progress = Math.min((data.streak / 30) * 100, 100);

  const calendarHtml = recentDays()
    .map((day) => {
      const key = dateKey(day);
      const isDone = data.completedDates.includes(key);
      const isToday = key === getTodayKey();
      return `
        <div class="day-box ${isDone ? "done" : ""} ${isToday ? "today" : ""}">
          <div>${day.getDate()}</div>
          <div>${isDone ? "✓" : "-"}</div>
        </div>
      `;
    })
    .join("");

  app.innerHTML = `
    <div class="container">
      <div class="topbar">
        <h1>Discipline Days</h1>
        <button class="btn-secondary" id="removePinBtn">Remove PIN</button>
      </div>

      <div class="card quote">
        <h3>Today's Quote</h3>
        <p>${todayQuote()}</p>
      </div>

      <div class="grid">
        <div class="stat orange">
          <div>Current Streak</div>
          <div class="stat-value">${data.streak}</div>
        </div>
        <div class="stat green">
          <div>Best Streak</div>
          <div class="stat-value">${data.bestStreak}</div>
        </div>
        <div class="stat red">
          <div>Resets</div>
          <div class="stat-value">${data.resets}</div>
        </div>
        <div class="stat indigo">
          <div>Today</div>
          <div class="stat-value">${markedToday ? "Done" : "Not Yet"}</div>
        </div>
      </div>

      <div class="card progress-wrap">
        <h3>30 Day Goal</h3>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${progress}%"></div>
        </div>
        <p>${data.streak} / 30 days completed</p>
      </div>

      <div class="card">
        <h3>Recent 14 Days</h3>
        <div class="calendar-grid">${calendarHtml}</div>
        <p class="small">Green = completed, Orange border = today</p>
      </div>

      <div class="actions">
        <button class="btn-primary" id="markBtn">${markedToday ? "Today Already Marked" : "Mark Today"}</button>
        <button class="btn-secondary" id="resetBtn">Reset Streak</button>
      </div>

      <div class="card tips">
        <h3>Quick Help</h3>
        <ul>
          <li>Put phone away for 5 minutes</li>
          <li>Drink water</li>
          <li>Take deep breaths</li>
          <li>Go for a short walk</li>
          <li>Read or study for 10 minutes</li>
        </ul>
      </div>
    </div>
  `;

  document.getElementById("markBtn").onclick = () => {
    const latest = loadData();
    const today = getTodayKey();

    if (latest.lastMarkedDate === today) {
      showToast("Already marked today");
      return;
    }

    latest.streak += 1;
    if (latest.streak > latest.bestStreak) {
      latest.bestStreak = latest.streak;
    }
    latest.lastMarkedDate = today;

    if (!latest.completedDates.includes(today)) {
      latest.completedDates.push(today);
    }

    saveData(latest);

    if (latest.streak % 7 === 0) {
      showInfoModal("Amazing!", `You completed ${latest.streak} discipline days. Keep going!`);
    } else {
      showToast("Great job! Today marked successfully.");
    }

    renderHome();
  };

  document.getElementById("resetBtn").onclick = () => {
    showModal("Reset streak?", "Are you sure you want to reset your streak?", () => {
      const latest = loadData();
      latest.streak = 0;
      latest.resets += 1;
      latest.lastMarkedDate = "";
      saveData(latest);
      showToast("Streak reset");
      renderHome();
    });
  };

  document.getElementById("removePinBtn").onclick = () => {
    showModal("Remove PIN?", "Do you want to remove your PIN lock?", () => {
      const latest = loadData();
      latest.pin = "";
      saveData(latest);
      showToast("PIN removed");
      renderApp();
    });
  };
}

renderApp();