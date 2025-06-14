// ------------------ Global Variables ------------------
let isLoggedIn = false;

const sidebar = document.getElementById("sidebar");
const loginBtn = document.getElementById("loginBtn");
const loginForm = document.getElementById("loginForm");
const submitLogin = document.getElementById("submitLogin");

const monitoringPage = document.getElementById("monitoringPage");
const homePage = document.getElementById("homePage");
const settingsPage = document.getElementById("settingsPage");
const transferPage = document.getElementById("transferPage");

const monitoringMenu = document.getElementById("monitoringMenu");
const settingsMenu = document.getElementById("settingsMenu");
const transferMenu = document.getElementById("transferMenu");
function toggleFeature(feature, state) {
  const url = `${currentConfig.baseUrl}/bot/toggle?secret=${currentConfig.secret}&feature=${feature}&state=${state}`;

  fetch(url)
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
    })
    .catch((error) => {
      console.error("Error toggling feature:", error);
    });
}

document.querySelectorAll(".custom-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");

    const isOn = toggle.classList.contains("active");
    const state = isOn ? "on" : "off";

    const feature = toggle.dataset.feature;

    if (feature) {
      toggleFeature(feature, state);
    }
  });
});

const rotationTypes = {
  0: "Scanning World",
  1: "Harvesting Trees",
  2: "Farming Block",
  3: "Planting Seeds",
  4: "Dropping Seeds",
  5: "Dropping packs",
  6: "Filling Seeds",
  7: "Harvesting Roots",
  8: "Collecting Fossils",
  9: "Clearing Objects",
  10: "Reaching Level",
  11: "Clearing History",
  12: "Creating Home World",
};

const maladyTypes = {
  0: "Healthy",
  1: "Torn Punching Muscle",
  2: "Gem Cuts",
  3: "Chicken Feet",
  4: "Grumbleteeth",
  5: "Broken Heart",
  6: "Chaos Infection",
  7: "Moldy Guts",
  8: "Brainworms",
  9: "Lupus",
  10: "Ecto-Bones",
  11: "Fatty Liver",
};

// ------------------ Authentication ------------------

function toggleSidebar() {
  sidebar.classList.toggle("expanded");
}

function showLoginForm() {
  loginForm.style.display =
    loginForm.style.display === "block" ? "none" : "block";
}

let currentConfig = null;

function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const baseUrlInput = document.getElementById("baseUrl").value.trim();
  const secret = document.getElementById("secret").value.trim();

  if (!username || !password || !baseUrlInput || !secret) {
    alert("Please fill all login fields");
    return;
  }

  const baseUrl =
    baseUrlInput.startsWith("http://") || baseUrlInput.startsWith("https://")
      ? baseUrlInput
      : "http://" + baseUrlInput;

  currentConfig = {
    username,
    password,
    baseUrl,
    secret,
  };

  localStorage.setItem("loggedInUser", username);
  localStorage.setItem("userConfig", JSON.stringify(currentConfig));

  isLoggedIn = true;
  loginBtn.textContent = "Logout";
  sidebar.classList.add("expanded");
  loginForm.style.display = "none";

  monitoringMenu.style.display = "block";
  settingsMenu.style.display = "block";
  transferMenu.style.display = "block";

  showPage("monitoring");
  fetchData();
}

window.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("loggedInUser");
  const savedConfig = localStorage.getItem("userConfig");

  if (savedUser && savedConfig) {
    currentConfig = JSON.parse(savedConfig);
    isLoggedIn = true;

    loginBtn.textContent = "Logout";
    sidebar.classList.add("expanded");
    loginForm.style.display = "none";

    monitoringMenu.style.display = "block";
    settingsMenu.style.display = "block";
    transferMenu.style.display = "block";

    showPage("monitoring");
    fetchData();
  }
});

loginBtn.addEventListener("click", () => {
  if (isLoggedIn) {
    isLoggedIn = false;
    currentConfig = null;
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userConfig");

    loginBtn.textContent = "Login";

    monitoringMenu.style.display = "none";
    settingsMenu.style.display = "none";
    transferMenu.style.display = "none";

    showPage("home");
  } else {
    showLoginForm();
  }
});

submitLogin.addEventListener("click", handleLogin);

// ------------------ Page Navigation ------------------
function showPage(page) {
  homePage.style.display = page === "home" ? "block" : "none";
  monitoringPage.style.display =
    page === "monitoring" && isLoggedIn ? "block" : "none";
  settingsPage.style.display =
    page === "settings" && isLoggedIn ? "block" : "none";
  transferPage.style.display =
    page === "transfer" && isLoggedIn ? "block" : "none";
}

// ------------------ Bot Status Handling ------------------
let currentContextBot = null;
let lastStatuses = [];

function updateBotStatus(statuses) {
  lastStatuses = statuses;
  const tbody = document.querySelector("#botStatusTable tbody");
  const contextMenu = document.getElementById("contextMenu");

  tbody.innerHTML = "";

  statuses.forEach((status, index) => {
    if (!status) return;

    const botName = status.match(/Bot Name: ([^,]+)/)?.[1] || "N/A";
    const botStatus = status.match(/Bot Status: ([^,]+)/)?.[1] || "N/A";
    const level = status.match(/Level: ([^,]+)/)?.[1] || "N/A";
    const world = status.match(/World: ([^,]+)/)?.[1] || "N/A";
    const gems = parseInt(status.match(/Gems: (\d+)/)?.[1] || "0");
    const exp = parseInt(status.match(/EXP: (\d+)/)?.[1] || "0");
    const rotationIndex = parseInt(status.match(/Rotation: (\d+)/)?.[1]) || 0;
    const obtainedGems = parseInt(
      status.match(/Obtained Gems: (\d+)/)?.[1] || "0"
    );
    const totalPacksForBot = parseInt(
      status.match(/Total Packs: (\d+)/)?.[1] || "0"
    );
    const maladyText =
      maladyTypes[parseInt(status.match(/Malady: ([^\n,]+)/)?.[1] || "0")] ||
      "Unknown";
    let maladyClass;
    if (maladyText === "Healthy") {
      maladyClass = "malady-healthy";
    } else if (
      maladyText === "Torn Punching Muscle" ||
      maladyText === "Gem Cuts"
    ) {
      maladyClass = "status-offline";
    } else {
      maladyClass = "status-online";
    }

    const h = String(Math.floor(exp / 3600)).padStart(2, "0");
    const m = String(Math.floor((exp % 3600) / 60)).padStart(2, "0");
    const s = String(exp % 60).padStart(2, "0");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${botName}</td>
      <td class="${
        botStatus === "Online" ? "status-online" : "status-offline"
      }">${botStatus}</td>
      <td>${level}</td>
      <td class="${maladyClass}">${maladyText}</td>
      <td>${h}:${m}:${s}</td>
      <td>${world}</td>
      <td>${rotationTypes[rotationIndex] || "Unknown"}</td>
      <td>${gems.toLocaleString("id-ID")}</td>
      <td>${obtainedGems.toLocaleString("id-ID")}</td>
      <td>${totalPacksForBot.toLocaleString("id-ID")}</td>
    `;

    row.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      currentContextBot = botName;
      contextMenu.style.display = "block";
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.style.top = `${e.pageY}px`;
    });

    tbody.appendChild(row);
  });
  let onlineCount = 0;
  let offlineCount = 0;
  let suspendedCount = 0;
  let totalGems1 = 0;
  let totalGems = 0;
  let totalPacks = 0;

  statuses.forEach((status) => {
    if (!status) return;

    const botStatus = status.match(/Bot Status: ([^,]+)/)?.[1] || "N/A";
    const gems = parseInt(status.match(/Gems: (\d+)/)?.[1] || "0");
    const obtainedGems = parseInt(
      status.match(/Obtained Gems: (\d+)/)?.[1] || "0"
    );
    const packs = parseInt(status.match(/Total Packs: (\d+)/)?.[1] || "0");
    totalPacks += packs;

    if (botStatus === "Online") {
      onlineCount++;
    } else if (
      botStatus === "Account Banned" ||
      botStatus === "Account Suspended"
    ) {
      suspendedCount++;
    } else {
      offlineCount++;
    }

    totalGems1 += gems;
    totalGems += obtainedGems;
  });

  let base = parseInt(localStorage.getItem("baseTotalPacks")) || 0;
  let initial = parseInt(localStorage.getItem("initialBotTotalPacks")) || 0;
  let displayTotalPacks = base + (totalPacks - initial);
  document.getElementById(
    "totalOnlineBots"
  ).textContent = `Total Online : ${onlineCount} 🟢`;
  document.getElementById(
    "totalOfflineBots"
  ).textContent = `Total Offline : ${offlineCount} 🔴`;
  document.getElementById(
    "totalSuspendedBots"
  ).textContent = `Total Suspended : ${suspendedCount} ⚠️`;
  document.getElementById(
    "totalPacks"
  ).innerHTML = `Total Packs: ${displayTotalPacks.toLocaleString("id-ID")} 📦`;
  document.getElementById(
    "totalGems"
  ).innerHTML = `Total Gems: ${totalGems1.toLocaleString(
    "id-ID"
  )} / ${totalGems.toLocaleString("id-ID")} 💎`;

  document.addEventListener("click", () => {
    contextMenu.style.display = "none";
  });
}
function setBaseTotalPacks() {
  const input = document.getElementById("manualPacks");
  const val = parseInt(input.value);
  if (!isNaN(val)) {
    let currentBotTotal = 0;
    if (lastStatuses) {
      lastStatuses.forEach((status) => {
        if (!status) return;
        const packs = parseInt(status.match(/Total Packs: (\d+)/)?.[1] || "0");
        currentBotTotal += packs;
      });
    }
    localStorage.setItem("baseTotalPacks", val);
    localStorage.setItem("initialBotTotalPacks", currentBotTotal);

    updateBotStatus(lastStatuses); // refresh tampilan
  }
}

function handleContextAction(action) {
  if (!currentContextBot) return;
  if (action === "connect") connectBot(currentContextBot);
  if (action === "disconnect") disconnectBot(currentContextBot);
  if (action === "removeBot") removeBot(currentContextBot);
  if (action === "removeProxy") removeProxy(currentContextBot);

  document.getElementById("contextMenu").style.display = "none";
}
// ------------------ Bot Actions ------------------

function fetchData() {
  fetch(`${currentConfig.baseUrl}/bot/get_bots?secret=${currentConfig.secret}`)
    .then((response) => response.text())
    .then((data) => updateBotStatus(data.split("\n")))
    .catch((error) => console.error("Error fetching bot statuses:", error));
}

function connectBot(name) {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/connect_bot?secret=${currentConfig.secret}&name=${name}`,
    { method: "POST" }
  ).then(() => fetchData());
}

function disconnectBot(name) {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/disconnect_bot?secret=${currentConfig.secret}&name=${name}`,
    { method: "POST" }
  ).then(() => fetchData());
}

function removeProxy(name) {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/remove_proxy?secret=${currentConfig.secret}&name=${name}`,
    { method: "POST" }
  ).then(() => fetchData());
}
function removeBot(name) {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/remove_bot?secret=${currentConfig.secret}&name=${name}`,
    { method: "POST" }
  ).then(() => fetchData());
}

function connectAllBots() {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/connect_all?secret=${currentConfig.secret}`
  ).then(() => fetchData());
}

function disconnectAllBots() {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/disconnect_all?secret=${currentConfig.secret}`
  ).then(() => fetchData());
}

function vialOn() {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/vial_on?secret=${currentConfig.secret}`
  ).then(() => fetchData());
}

function vialOf() {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/vial_of?secret=${currentConfig.secret}`
  ).then(() => fetchData());
}

function removeBotStatus() {
  if (!currentConfig) return;
  fetch(
    `${currentConfig.baseUrl}/bot/remove_status?secret=${currentConfig.secret}`
  ).then(() => fetchData());
}
function submitBots() {
  const inputText = document.getElementById("botInput").value;
  const storageWear = document.getElementById("storageWearInput").value.trim();
  const storageMalady = document
    .getElementById("storageMaladyInput")
    .value.trim();
  const status = document.getElementById("status");

  if (!inputText.trim()) {
    status.textContent = "Input tidak boleh kosong.";
    return;
  }

  const url = new URL(`${currentConfig.baseUrl}/bot/add_multiple`);
  url.searchParams.append("secret", currentConfig.secret);

  if (storageWear) {
    url.searchParams.append("storageWearInput", storageWear);
  }
  if (storageMalady) {
    url.searchParams.append("storageMaladyInput", storageMalady);
  }

  fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: inputText,
  })
    .then((res) => res.text())
    .then((text) => {
      status.textContent = "Respon server: " + text;
    })
    .catch((err) => {
      status.textContent = "Gagal mengirim: " + err.message;
    });
}

// ------------------ Time List Management ------------------
document.addEventListener("DOMContentLoaded", () => {
  loadTimeList();
});
document.getElementById("addConnectTime").addEventListener("click", () => {
  const timeInput = document.getElementById("timeInput").value.trim();
  if (timeInput !== "") {
    const option = document.createElement("option");
    option.text = timeInput;
    document.getElementById("connectList").add(option);
    logToConsole(`🕒 Jam ${timeInput} ditambahkan ke daftar CONNECT.`);

    saveTimeList();

    document.getElementById("timeInput").value = "";
  }
});

document.getElementById("addDisconnectTime").addEventListener("click", () => {
  const timeInput = document.getElementById("timeInput").value.trim();
  if (timeInput !== "") {
    const option = document.createElement("option");
    option.text = timeInput;
    document.getElementById("disconnectList").add(option);
    logToConsole(`🕒 Jam ${timeInput} ditambahkan ke daftar DISCONNECT.`);

    saveTimeList();

    document.getElementById("timeInput").value = "";
  }
});

function saveTimeList() {
  const connectList = document.getElementById("connectList");
  const disconnectList = document.getElementById("disconnectList");

  const connectTimes = [];
  const disconnectTimes = [];

  for (let i = 0; i < connectList.options.length; i++) {
    connectTimes.push(connectList.options[i].text);
  }
  for (let i = 0; i < disconnectList.options.length; i++) {
    disconnectTimes.push(disconnectList.options[i].text);
  }

  localStorage.setItem("connectTimes", JSON.stringify(connectTimes));
  localStorage.setItem("disconnectTimes", JSON.stringify(disconnectTimes));
}

function loadTimeList() {
  const connectTimes = JSON.parse(localStorage.getItem("connectTimes") || "[]");
  const disconnectTimes = JSON.parse(
    localStorage.getItem("disconnectTimes") || "[]"
  );

  const connectList = document.getElementById("connectList");
  const disconnectList = document.getElementById("disconnectList");

  connectTimes.forEach((time) => {
    const option = document.createElement("option");
    option.text = time;
    connectList.add(option);
  });

  disconnectTimes.forEach((time) => {
    const option = document.createElement("option");
    option.text = time;
    disconnectList.add(option);
  });
}
function resetTimeList() {
  document.getElementById("connectList").innerHTML = "";
  document.getElementById("disconnectList").innerHTML = "";

  localStorage.removeItem("connectTimes");
  localStorage.removeItem("disconnectTimes");

  logToConsole("⏪ Daftar waktu CONNECT dan DISCONNECT telah direset.");
}

document.getElementById("resetButton").addEventListener("click", () => {
  resetTimeList();
});

function logToConsole(message) {
  const consoleBox = document.getElementById("consoleBox");
  const waktu = new Date().toLocaleTimeString();
  consoleBox.innerHTML += `[${waktu}] ${message}<br>`;
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function getWIBTime() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const timeWIB = new Intl.DateTimeFormat("en-US", options).format(now);
  return timeWIB;
}

setInterval(() => {
  const currentTime = getWIBTime();

  const connectOptions = document.getElementById("connectList").options;
  for (let i = 0; i < connectOptions.length; i++) {
    if (connectOptions[i].text === currentTime) {
      connectAllBots();
      connectOptions[i].remove();
      saveTimeList();
      break;
    }
  }

  const disconnectOptions = document.getElementById("disconnectList").options;
  for (let i = 0; i < disconnectOptions.length; i++) {
    if (disconnectOptions[i].text === currentTime) {
      disconnectAllBots();
      disconnectOptions[i].remove();
      saveTimeList();
      break;
    }
  }
}, 1000);

// ------------------ Console Logging ------------------
function logToConsole(message) {
  const consoleLog = document.getElementById("consoleLog");
  if (consoleLog) {
    const newLine = document.createElement("div");
    newLine.textContent = message;
    consoleLog.appendChild(newLine);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }
}
const textarea = document.getElementById("botInput");
const lineNumbers = document.getElementById("lineNumbers");

// Update line numbers
function updateLineNumbers() {
  const lines = textarea.value.split("\n").length;
  let html = "";
  for (let i = 1; i <= lines; i++) {
    html += `<span>${i}</span>`;
  }
  lineNumbers.innerHTML = html;
}

// Sync scroll
textarea.addEventListener("scroll", () => {
  lineNumbers.scrollTop = textarea.scrollTop;
});

// Initial update + on input
textarea.addEventListener("input", updateLineNumbers);
updateLineNumbers();

// ------------------ Auto Refresh ------------------
setInterval(() => {
  if (isLoggedIn) fetchData();
}, 1000);
