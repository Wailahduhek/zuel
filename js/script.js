// ------------------ Global Variables ------------------
let isLoggedIn = false;
const configs = {
  default: { baseUrl: 'http://45.8.22.51:3000', secret: 'ilovebots' },
  van:     { baseUrl: 'http://45.8.22.51:5000', secret: 'ilovebots' },
  una:     { baseUrl: 'http://45.8.22.51:80', secret: 'ilovebots' }
};

let currentConfig = configs.default;

const sidebar = document.getElementById('sidebar');
const loginBtn = document.getElementById('loginBtn');
const loginForm = document.getElementById('loginForm');
const submitLogin = document.getElementById('submitLogin');

const monitoringPage = document.getElementById('monitoringPage');
const homePage = document.getElementById('homePage');
const settingsPage = document.getElementById('settingsPage');
const transferPage = document.getElementById('transferPage');

const monitoringMenu = document.getElementById('monitoringMenu');
const settingsMenu = document.getElementById('settingsMenu');
const transferMenu = document.getElementById('transferMenu');

const rotationTypes = {
  0: "Scanning World", 1: "Harvesting Trees", 2: "Farming Block",
  3: "Planting Seeds", 4: "Dropping Seeds", 5: "Dropping Packs",
  6: "Filling Seeds", 7: "Harvesting Roots", 8: "Collecting Fossils",
  9: "Clearing Objects", 10: "Reaching Level", 11: "Clearing Objects",
  12: "Reaching Level", 13: "Clearing History", 14: "Creating Home World"
};
const maladyTypes = {
  0: "Healthy", 1: "Torn Punching Muscle", 2: "Gem Cuts", 3: "Chicken Feet",
  4: "Grumbleteeth", 5: "Broken Heart", 6: "Chaos Infection", 7: "Moldy Guts",
  8: "Brainworms", 9: "Lupus", 10: "Ecto-Bones", 11: "Fatty Liver"
};

// ------------------ Authentication ------------------
function toggleSidebar() {
  sidebar.classList.toggle('expanded');
}

function showLoginForm() {
  loginForm.style.display = loginForm.style.display === 'block' ? 'none' : 'block';
}

function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === 'van' && password === 'van') {
    currentConfig = configs.van;
  } else if (username === 'una' && password === 'una') {
    currentConfig = configs.una;
  } else if (username === 'gg' && password === 'gg') {
    currentConfig = configs.default;
  } else {
    alert('Invalid credentials');
    return;
  }

  isLoggedIn = true;
  loginBtn.textContent = 'Logout';
  sidebar.classList.add('expanded');
  loginForm.style.display = 'none';
  monitoringMenu.style.display = 'block';
  settingsMenu.style.display = 'block';
  transferMenu.style.display = 'block';
  showPage('monitoring');
  fetchData();
}

loginBtn.addEventListener('click', () => {
  if (isLoggedIn) {
    isLoggedIn = false;
    currentConfig = configs.default;
    loginBtn.textContent = 'Login';
    monitoringMenu.style.display = 'none';
    settingsMenu.style.display = 'none';
    transferMenu.style.display = 'none';
    showPage('home');
  } else {
    showLoginForm();
  }
});

submitLogin.addEventListener('click', handleLogin);

// ------------------ Page Navigation ------------------
function showPage(page) {
  homePage.style.display = page === 'home' ? 'block' : 'none';
  monitoringPage.style.display = (page === 'monitoring' && isLoggedIn) ? 'block' : 'none';
  settingsPage.style.display = (page === 'settings' && isLoggedIn) ? 'block' : 'none';
  transferPage.style.display = (page === 'transfer' && isLoggedIn) ? 'block' : 'none';
}

// ------------------ Bot Status Handling ------------------
function updateBotStatus(statuses) {
  const tbody = document.querySelector("#botStatusTable tbody");
  tbody.innerHTML = "";

  let onlineCount = 0, offlineCount = 0, totalGems = 0, totalGems1 = 0, totalPacks = 0;

  statuses.forEach((status, index) => {
    if (!status) return;

    const botName = status.match(/Bot Name: ([^,]+)/)?.[1] || 'N/A';
    const botStatus = status.match(/Bot Status: ([^,]+)/)?.[1] || 'N/A';
    const level = status.match(/Level: ([^,]+)/)?.[1] || 'N/A';
    const world = status.match(/World: ([^,]+)/)?.[1] || 'N/A';
    const gems = parseInt(status.match(/Gems: (\d+)/)?.[1] || '0');
    const exp = parseInt(status.match(/EXP: (\d+)/)?.[1] || '0');
    const rotationIndex = parseInt(status.match(/Rotation: (\d+)/)?.[1]) || 0;
    const obtainedGems = parseInt(status.match(/Obtained Gems: (\d+)/)?.[1] || '0');
    const totalPacksForBot = parseInt(status.match(/Total Packs: (\d+)/)?.[1] || '0');
    const malady = maladyTypes[parseInt(status.match(/Malady: ([^\n,]+)/)?.[1] || '0')] || "Unknown";

    const h = String(Math.floor(exp / 3600)).padStart(2, '0');
    const m = String(Math.floor((exp % 3600) / 60)).padStart(2, '0');
    const s = String(exp % 60).padStart(2, '0');

    if (botStatus === 'Online') onlineCount++; else offlineCount++;
    totalGems += obtainedGems;
    totalGems1 += gems;
    totalPacks += totalPacksForBot;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${botName}</td>
      <td class="${botStatus === 'Online' ? 'status-online' : 'status-offline'}">${botStatus}</td>
      <td>${level}</td>
      <td class="status-online">${malady}</td>
      <td>${h}:${m}:${s}</td>
      <td>${world}</td>
      <td>${rotationTypes[rotationIndex] || "Unknown"}</td>
      <td>${gems.toLocaleString('id-ID')}</td>
      <td>${obtainedGems.toLocaleString('id-ID')}</td>
      <td>${totalPacksForBot.toLocaleString('id-ID')}</td>
      <td>
        <button class="remove-button" onclick="removeBot('${botName}')">Remove</button>
        <button class="remove-button" onclick="connectBot('${botName}')">Connect</button>
        <button class="remove-button" onclick="disconnectBot('${botName}')">Disconnect</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalOnlineBots").textContent = `Total Online Bots: ${onlineCount} 🟢`;
  document.getElementById("totalOfflineBots").textContent = `Total Offline Bots: ${offlineCount} 🔴`;
  document.getElementById("totalPacks").innerHTML = `Total Packs: ${totalPacks.toLocaleString('id-ID')} 📦`;
  document.getElementById("totalGems").innerHTML = `Total Gems: ${totalGems1.toLocaleString('id-ID')} / ${totalGems.toLocaleString('id-ID')} 💎`;
}

// ------------------ Bot Actions ------------------
function fetchData() {
  fetch(`${currentConfig.baseUrl}/bot/get_bots?secret=${currentConfig.secret}`)
    .then(res => res.text())
    .then(data => updateBotStatus(data.split('\n')))
    .catch(err => console.error('Error fetching:', err));
}

function connectBot(name) {
  fetch(`${currentConfig.baseUrl}/bot/connect_bot?secret=${currentConfig.secret}&name=${name}`, { method: 'POST' })
    .then(() => fetchData());
}

function disconnectBot(name) {
  fetch(`${currentConfig.baseUrl}/bot/disconnect_bot?secret=${currentConfig.secret}&name=${name}`, { method: 'POST' })
    .then(() => fetchData());
}

function removeBot(name) {
  fetch(`${currentConfig.baseUrl}/bot/remove_proxy?secret=${currentConfig.secret}&name=${name}`, { method: 'POST' })
    .then(() => fetchData());
}

function connectAllBots() {
  fetch(`${currentConfig.baseUrl}/bot/connect_all?secret=${currentConfig.secret}`)
    .then(() => fetchData());
}

function disconnectAllBots() {
  fetch(`${currentConfig.baseUrl}/bot/disconnect_all?secret=${currentConfig.secret}`)
    .then(() => fetchData());
}
function vialOn() {
  fetch(`${currentConfig.baseUrl}/bot/vial_on?secret=${currentConfig.secret}`)
    .then(() => fetchData());
}
function vialOf() {
  fetch(`${currentConfig.baseUrl}/bot/vial_of?secret=${currentConfig.secret}`)
    .then(() => fetchData());
}
function removeBotStatus() {
  fetch(`${currentConfig.baseUrl}/bot/remove_status?secret=${currentConfig.secret}`)
    .then(() => fetchData());
}

// ------------------ Time List Management ------------------
document.addEventListener("DOMContentLoaded", () => {
  loadTimeList();
});

document.getElementById('addConnectTime').addEventListener('click', () => {
  const timeInput = document.getElementById('timeInput').value.trim();
  if (timeInput) {
    const option = new Option(timeInput, timeInput);
    document.getElementById('connectList').add(option);
    logToConsole(`🕒 Jam ${timeInput} ditambahkan ke daftar CONNECT.`);
    saveTimeList();
    document.getElementById('timeInput').value = "";
  }
});
document.getElementById('addDisconnectTime').addEventListener('click', () => {
  const timeInput = document.getElementById('timeInput').value.trim();
  if (timeInput) {
    const option = new Option(timeInput, timeInput);
    document.getElementById('disconnectList').add(option);
    logToConsole(`🕒 Jam ${timeInput} ditambahkan ke daftar DISCONNECT.`);
    saveTimeList();
    document.getElementById('timeInput').value = "";
  }
});
document.getElementById('resetButton').addEventListener('click', resetTimeList);

function saveTimeList() {
  const connectList = [...document.getElementById('connectList').options].map(opt => opt.text);
  const disconnectList = [...document.getElementById('disconnectList').options].map(opt => opt.text);
  localStorage.setItem('connectTimes', JSON.stringify(connectList));
  localStorage.setItem('disconnectTimes', JSON.stringify(disconnectList));
}
function loadTimeList() {
  const connectTimes = JSON.parse(localStorage.getItem('connectTimes') || '[]');
  const disconnectTimes = JSON.parse(localStorage.getItem('disconnectTimes') || '[]');
  const connectList = document.getElementById('connectList');
  const disconnectList = document.getElementById('disconnectList');

  connectTimes.forEach(time => connectList.add(new Option(time, time)));
  disconnectTimes.forEach(time => disconnectList.add(new Option(time, time)));
}
function resetTimeList() {
  document.getElementById('connectList').innerHTML = "";
  document.getElementById('disconnectList').innerHTML = "";
  localStorage.removeItem('connectTimes');
  localStorage.removeItem('disconnectTimes');
  logToConsole("⏪ Daftar waktu CONNECT dan DISCONNECT telah direset.");
}

// ------------------ Clock Monitoring & Auto Connect ------------------
function logToConsole(message) {
  const consoleBox = document.getElementById('consoleBox');
  const time = new Date().toLocaleTimeString();
  consoleBox.innerHTML += `[${time}] ${message}<br>`;
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function getWIBTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
}

setInterval(() => {
  const currentTime = getWIBTime();
  const connectList = document.getElementById('connectList');
  const disconnectList = document.getElementById('disconnectList');

  for (let i = 0; i < connectList.options.length; i++) {
    if (connectList.options[i].text === currentTime) {
      connectAllBots();
      connectList.remove(i);
      saveTimeList();
      break;
    }
  }

  for (let i = 0; i < disconnectList.options.length; i++) {
    if (disconnectList.options[i].text === currentTime) {
      disconnectAllBots();
      disconnectList.remove(i);
      saveTimeList();
      break;
    }
  }
}, 1000);

// ------------------ Auto Fetch ------------------
fetchData();
setInterval(fetchData, 1000);
