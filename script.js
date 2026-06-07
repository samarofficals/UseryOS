// ==================== WINDOW MANAGER STATE ====================
let activeWindow = null;
let zIndexCounter = 100;
let systemUptime = 0; // in seconds
let currentTheme = 'nordic';

// Simulated File System Database
const fileSystem = {
  home: [
    { name: 'Documents', type: 'dir', icon: '📂' },
    { name: 'Wallpapers', type: 'dir', icon: '🖼️' },
    { name: 'README.txt', type: 'file', icon: '📄', content: 'Welcome to Usery OS!\nThis is a lightweight fork of Archcraft.\nBranded for Usery and built on top of Arch Linux.' },
    { name: 'system.conf', type: 'file', icon: '⚙️', content: 'hostname=usery-os\nkernel=6.9.4-usery-zen\nwm=openbox\nshell=zsh' }
  ],
  documents: [
    { name: 'todo.txt', type: 'file', icon: '📝', content: '- Test Usery OS ISO build\n- Customize Plymouth boot themes\n- Deploy to Daytona workspace\n- Push repository to GitHub' },
    { name: 'branding_specs.txt', type: 'file', icon: '📄', content: 'Brand Name: Usery\nOS Name: Usery OS\nBase: Archcraft / Arch Linux\nVisual Style: Nordic / Dracula / Cyberpunk\nFocus: Ultra-lightweight and heavily customized UI' }
  ],
  wallpapers: [
    { name: 'nordic.png', type: 'wallpaper', file: 'nordic', thumb: 'assets/wallpapers/nordic.png' },
    { name: 'dracula.png', type: 'wallpaper', file: 'dracula', thumb: 'assets/wallpapers/dracula.png' },
    { name: 'cyberpunk.png', type: 'wallpaper', file: 'cyberpunk', thumb: 'assets/wallpapers/cyberpunk.png' }
  ]
};

let currentFolder = 'home';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  // Start Boot Sequence
  runBootSequence();

  // Setup Event Listeners
  setupLogin();
  setupWindowControls();
  setupAppLaunchers();
  setupRofi();
  setupPowerMenu();
  setupTerminal();
  setupSettings();
  setupFileManager();
  
  // Start Widgets & System Updates
  startClock();
  startSystemMonitor();
});

// ==================== BOOT SEQUENCE ====================
function runBootSequence() {
  const bootLogs = [
    ':: Loading Usery OS Kernel v6.9.4-usery-zen ...',
    ':: Initializing RAM disk ...',
    ':: Checking filesystems ...',
    '   /dev/sda1: clean, 248192/183002 files, 4018320/8192000 blocks',
    ':: Mounting Root Local Filesystem ...',
    ':: Starting systemd Init Manager ...',
    '   [ OK ] Started Journal Service.',
    '   [ OK ] Started Create Static Device Nodes in /dev.',
    '   [ OK ] Started Rule-based Device Events Daemon.',
    '   [ OK ] Started Local Filesystem Volumes.',
    '   [ OK ] Started AppArmor initialization.',
    '   [ OK ] Started Network Manager.',
    '   [ OK ] Started Bluetooth Daemon.',
    '   [ OK ] Started Pipewire Sound Server.',
    ':: Starting Display Manager SDDM-Usery ...',
    ':: Starting Plymouth Splash Screen ...',
    ':: Loading graphical environment ...',
    ':: System status: READY'
  ];

  const logContainer = document.getElementById('boot-log');
  let logIndex = 0;

  function printLog() {
    if (logIndex < bootLogs.length) {
      const p = document.createElement('p');
      p.textContent = bootLogs[logIndex];
      logContainer.appendChild(p);
      logContainer.scrollTop = logContainer.scrollHeight;
      logIndex++;
      
      // Variable speed for boot realism
      setTimeout(printLog, Math.random() * 120 + 40);
    } else {
      setTimeout(() => {
        // Transition to login screen
        document.getElementById('boot-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
      }, 1000);
    }
  }

  printLog();
}

// ==================== LOGIN LOGIC ====================
function setupLogin() {
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Transition to desktop
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('desktop-screen').classList.add('active');
    
    // Auto-open terminal welcome app as in Archcraft
    setTimeout(() => {
      openApp('terminal');
      executeCommand('neofetch');
    }, 800);
  });
}

// ==================== WINDOW CONTROLS & DRAGGING ====================
function setupWindowControls() {
  const windows = document.querySelectorAll('.window');
  
  windows.forEach(win => {
    const header = win.querySelector('.window-header');
    const closeBtn = win.querySelector('.win-btn.close');
    const maxBtn = win.querySelector('.win-btn.maximize');
    const minBtn = win.querySelector('.win-btn.minimize');
    
    // Window click focus
    win.addEventListener('mousedown', () => {
      focusWindow(win);
    });

    // Dragging Logic
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('win-btn')) return; // ignore control buttons
      if (win.classList.contains('maximized')) return; // disable drag on maximize

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = win.offsetLeft;
      initialY = win.offsetTop;
      
      focusWindow(win);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
    });

    function drag(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Constrain inside viewport
      let newX = initialX + dx;
      let newY = initialY + dy;
      
      if (newY < 40) newY = 40; // Polybar collision
      
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    }

    function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    }

    // Close
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        win.classList.remove('show');
        setTimeout(() => win.classList.add('hidden'), 200);
        updateActiveWindowTitle();
      });
    }

    // Maximize
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        toggleMaximize(win);
      });
      header.addEventListener('dblclick', () => {
        toggleMaximize(win);
      });
    }

    // Minimize
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        win.classList.remove('show');
        setTimeout(() => win.classList.add('hidden'), 200);
      });
    }
  });
}

function focusWindow(win) {
  if (activeWindow === win) return;
  
  if (activeWindow) {
    activeWindow.classList.remove('active-window');
  }
  
  activeWindow = win;
  win.classList.add('active-window');
  
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  
  updateActiveWindowTitle();
}

function toggleMaximize(win) {
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.width = win.dataset.prevWidth || '640px';
    win.style.height = win.dataset.prevHeight || '400px';
    win.style.top = win.dataset.prevTop || '15%';
    win.style.left = win.dataset.prevLeft || '20%';
  } else {
    // Save prev state
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.dataset.prevTop = win.style.top;
    win.dataset.prevLeft = win.style.left;
    
    win.classList.add('maximized');
    win.style.width = '100vw';
    win.style.height = 'calc(100vh - 50px)';
    win.style.top = '50px';
    win.style.left = '0px';
  }
}

function updateActiveWindowTitle() {
  const activeWinTitle = document.getElementById('active-window-title');
  const openWindows = Array.from(document.querySelectorAll('.window:not(.hidden)'));
  
  if (openWindows.length === 0) {
    activeWinTitle.textContent = 'Desktop';
    activeWindow = null;
    return;
  }
  
  // Find top window
  const topWin = openWindows.reduce((max, w) => {
    return parseInt(w.style.zIndex) > parseInt(max.style.zIndex) ? w : max;
  }, openWindows[0]);
  
  const title = topWin.querySelector('.window-title').textContent;
  activeWinTitle.textContent = title;
}

// ==================== APP LAUNCHERS ====================
function setupAppLaunchers() {
  // Desktop Shortcuts
  document.querySelectorAll('.shortcut').forEach(shortcut => {
    shortcut.addEventListener('click', () => {
      const app = shortcut.dataset.app;
      openApp(app);
    });
  });
}

function openApp(appId) {
  const win = document.getElementById(`win-${appId}`);
  if (!win) return;
  
  win.classList.remove('hidden');
  // force reflow
  win.offsetHeight;
  win.classList.add('show');
  
  focusWindow(win);
  
  // Custom launchers logic
  if (appId === 'files') {
    loadFolder(currentFolder);
  }
}

// ==================== ROFI APPLICATION LAUNCHER ====================
function setupRofi() {
  const trigger = document.getElementById('rofi-trigger');
  const rofi = document.getElementById('rofi-launcher');
  const searchInput = document.getElementById('rofi-search-input');
  
  trigger.addEventListener('click', toggleRofi);
  
  // Open Rofi on Super Key (Win)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Meta') {
      e.preventDefault();
      toggleRofi();
    }
    if (e.key === 'Escape' && !rofi.classList.contains('hidden')) {
      closeRofi();
    }
  });

  rofi.addEventListener('click', (e) => {
    if (e.target === rofi) {
      closeRofi();
    }
  });

  // App list search
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    document.querySelectorAll('.rofi-app').forEach(app => {
      const name = app.querySelector('.app-name').textContent.toLowerCase();
      const desc = app.querySelector('.app-desc').textContent.toLowerCase();
      if (name.includes(val) || desc.includes(val)) {
        app.classList.remove('hidden');
      } else {
        app.classList.add('hidden');
      }
    });
  });

  // Launch from Rofi
  document.querySelectorAll('.rofi-app').forEach(app => {
    app.addEventListener('click', () => {
      const appId = app.dataset.app;
      openApp(appId);
      closeRofi();
    });
  });

  function toggleRofi() {
    if (rofi.classList.contains('hidden')) {
      rofi.classList.remove('hidden');
      searchInput.value = '';
      searchInput.focus();
      document.querySelectorAll('.rofi-app').forEach(a => a.classList.remove('hidden'));
    } else {
      closeRofi();
    }
  }

  function closeRofi() {
    rofi.classList.add('hidden');
  }
}

// ==================== POWER MENU ====================
function setupPowerMenu() {
  const trigger = document.getElementById('power-trigger');
  const powerMenu = document.getElementById('power-menu');
  const cancelBtn = document.getElementById('power-cancel');
  
  trigger.addEventListener('click', () => {
    powerMenu.classList.remove('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    powerMenu.classList.add('hidden');
  });

  document.getElementById('power-lock').addEventListener('click', () => {
    powerMenu.classList.add('hidden');
    document.getElementById('desktop-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
  });

  document.getElementById('power-reboot').addEventListener('click', () => {
    powerMenu.classList.add('hidden');
    // Hide all windows
    document.querySelectorAll('.window').forEach(w => {
      w.classList.add('hidden');
      w.classList.remove('show');
    });
    document.getElementById('desktop-screen').classList.remove('active');
    document.getElementById('boot-screen').classList.add('active');
    document.getElementById('boot-log').innerHTML = '';
    runBootSequence();
  });

  document.getElementById('power-shutdown').addEventListener('click', () => {
    powerMenu.classList.add('hidden');
    document.body.innerHTML = '<div style="background:#000;width:100vw;height:100vh;display:flex;justify-content:center;align-items:center;color:#fff;font-family:monospace;font-size:16px;">Power Off. Daytona Container running.</div>';
  });
}

// ==================== INTERACTIVE TERMINAL ENGINE ====================
function setupTerminal() {
  const inputField = document.getElementById('term-input-field');
  const termContent = document.querySelector('.term-content');

  // Focus input on clicking anywhere in terminal
  termContent.addEventListener('click', () => {
    inputField.focus();
  });

  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = inputField.textContent.trim();
      executeCommand(command);
      inputField.textContent = '';
    }
  });
}

function executeCommand(cmdText) {
  const history = document.getElementById('term-history');
  
  // Append user prompt
  const userLine = document.createElement('div');
  userLine.innerHTML = `<span class="prompt-user">usery@usery-os</span><span class="prompt-separator"> ~ $ </span><span>${cmdText}</span>`;
  history.appendChild(userLine);

  if (cmdText === '') {
    scrollToBottom();
    return;
  }

  const output = document.createElement('div');
  output.className = 'term-output';

  const parts = cmdText.split(' ');
  const baseCmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (baseCmd) {
    case 'help':
      output.innerHTML = `Available commands:
  \e[1;36mneofetch\e[0m       - Display system specifications and logo
  \e[1;36mcmatrix\e[0m        - Launch digital matrix rain animation
  \e[1;36mpacman -Syu\e[0m    - Simulate updating Usery OS system packages
  \e[1;36mfortune\e[0m        - Print a randomized programming quote
  \e[1;36mclear\e[0m          - Clear the terminal console
  \e[1;36mhelp\e[0m           - Display this help dialog`;
      break;

    case 'clear':
      history.innerHTML = '';
      scrollToBottom();
      return;

    case 'neofetch':
      output.innerHTML = getNeofetchOutput();
      break;

    case 'fortune':
      output.innerHTML = getFortuneOutput();
      break;

    case 'cmatrix':
      runCMatrix();
      return;

    case 'pacman':
      if (args[0] === '-Syu') {
        runPacmanUpdate(output);
      } else {
        output.innerHTML = `<span class="term-error">Error: unsupported pacman flags. Try 'pacman -Syu'</span>`;
      }
      break;

    default:
      output.innerHTML = `<span class="term-error">usery-zsh: command not found: ${baseCmd}. Type 'help' for support.</span>`;
  }

  history.appendChild(output);
  scrollToBottom();
}

function scrollToBottom() {
  const termContent = document.querySelector('.term-content');
  termContent.scrollTop = termContent.scrollHeight;
}

// Neofetch Generator
function getNeofetchOutput() {
  const logo = `\e[1;36m       .-------.
      /   _   _ \\
     |   (o) (o) |
     |  |   u   | |
     |   \\  ~  /  |
      \\   \`---\'  /
       \`-------\'\e[0m`;

  const themeNameMap = {
    'nordic': 'Nordic Glacier',
    'dracula': 'Dracula Dark',
    'cyberpunk': 'Cyberpunk Neon'
  };

  const wmNameMap = {
    'nordic': 'Openbox-Usery',
    'dracula': 'BSPWM-Usery',
    'cyberpunk': 'Hyprland-Usery'
  };

  const statsText = `\e[1;36musery\e[0m@\e[1;36musery-os\e[0m
--------------------
\e[1;36mOS\e[0m: Usery OS x86_64
\e[1;36mHost\e[0m: Daytona Devcontainer Workspace
\e[1;36mKernel\e[0m: 6.9.4-usery-zen
\e[1;36mUptime\e[0m: ${Math.floor(systemUptime / 60)} mins
\e[1;36mShell\e[0m: zsh 5.9
\e[1;36mResolution\e[0m: ${window.screen.width}x${window.screen.height}
\e[1;36mWM\e[0m: ${wmNameMap[currentTheme]}
\e[1;36mTheme\e[0m: ${themeNameMap[currentTheme]}
\e[1;36mTerminal\e[0m: alacritty-usery
\e[1;36mCPU\e[0m: AMD Ryzen 9 7900X (24) @ 4.7GHz
\e[1;36mMemory\e[0m: ${document.getElementById('ram-val').textContent} / 16.0GB (Live)`;

  // Return side-by-side display
  return `<div class="neofetch-logo"><pre>${logo}</pre></div><div class="neofetch-info"><pre>${statsText}</pre></div><div style="clear:both;"></div>`;
}

// Fortune Generator
function getFortuneOutput() {
  const quotes = [
    '"Simplicity is the soul of efficiency." — Austin Freeman',
    '"Computers are good at following instructions, but not at reading your mind." — Donald Knuth',
    '"The best desktop environment is the one that stays out of your way." — Usery Zen',
    '"Linux is only free if your time has no value." — Jamie Zawinski',
    '"Arch Linux: Simple, lightweight, and branded beautifully as Usery OS!"',
    '"Daytona makes developer workspaces ephemeral, reproducible, and effortless."'
  ];
  const rand = Math.floor(Math.random() * quotes.length);
  return `\e[1;33m${quotes[rand]}\e[0m`;
}

// Matrix Falling Rain (CMatrix)
function runCMatrix() {
  const win = document.getElementById('win-terminal');
  const content = win.querySelector('.window-content');
  
  // Create Canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-canvas';
  canvas.style.display = 'block';
  content.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Resize
  function resizeCanvas() {
    canvas.width = content.clientWidth;
    canvas.height = content.clientHeight;
  }
  resizeCanvas();

  const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
                  '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
  const alphabet = letters.split('');

  const fontSize = 14;
  const columns = canvas.width / fontSize;

  const rainDrops = [];
  for (let x = 0; x < columns; x++) {
    rainDrops[x] = 1;
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = currentTheme === 'cyberpunk' ? '#ff007f' : '#00ff66'; // custom theme color matrix!
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
      const text = alphabet[Math.floor(Math.random() * alphabet.length)];
      ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

      if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        rainDrops[i] = 0;
      }
      rainDrops[i]++;
    }
  }

  const interval = setInterval(draw, 30);

  // Close Matrix Listener
  function terminateMatrix(e) {
    if (e.key === 'q' || (e.ctrlKey && e.key === 'c')) {
      e.preventDefault();
      clearInterval(interval);
      canvas.remove();
      window.removeEventListener('keydown', terminateMatrix);
      
      // Print termination message
      const history = document.getElementById('term-history');
      const output = document.createElement('div');
      output.textContent = 'cmatrix closed. Returned to zsh session.';
      history.appendChild(output);
      scrollToBottom();
    }
  }

  window.addEventListener('keydown', terminateMatrix);
}

// Pacman Package Installer Simulation
function runPacmanUpdate(outputNode) {
  let progress = 0;
  outputNode.innerHTML = ':: Synchronizing package databases...<br> core is up to date<br> extra is up to date<br> \e[1;36musery-os\e[0m is up to date<br>:: Starting full system upgrade...<br>';
  
  function updateProgress() {
    if (progress <= 100) {
      const barLength = 30;
      const filledLength = Math.round(barLength * progress / 100);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      outputNode.innerHTML = `:: Synchronizing package databases...<br> core is up to date<br> extra is up to date<br> \e[1;36musery-os\e[0m is up to date<br>:: Starting full system upgrade...<br>` +
        `\rUpdating \e[1;36musery-desktop-environment\e[0m [${bar}] ${progress}%`;
      progress += 5;
      setTimeout(updateProgress, 80);
      scrollToBottom();
    } else {
      outputNode.innerHTML += `<br>\e[1;32m(1/1) upgrading usery-desktop-environment             [██████████████████████████████] 100%\e[0m<br>:: Running post-transaction hooks...<br>(1/1) Reloading Openbox XML configuration... <span class="prompt-user">done.</span>`;
      scrollToBottom();
    }
  }
  updateProgress();
}

// ==================== SETTINGS & THEME ENGINE ====================
function setupSettings() {
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityValue = document.getElementById('opacity-value');
  const animSpeedSelect = document.getElementById('animation-speed');
  
  // Opacity
  opacitySlider.addEventListener('input', (e) => {
    const val = e.target.value;
    opacityValue.textContent = `${val}%`;
    document.querySelectorAll('.window').forEach(w => {
      w.style.backgroundColor = `rgba(0,0,0, ${val / 100 * 0.15})`; // adjust window background alpha
    });
  });

  // Theme selection
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      
      const theme = opt.dataset.theme;
      setTheme(theme);
    });
  });

  // Animation Speed
  animSpeedSelect.addEventListener('change', (e) => {
    const speed = e.target.value;
    document.documentElement.style.setProperty('--anim-speed', speed);
  });
}

function setTheme(theme) {
  currentTheme = theme;
  document.body.className = '';
  document.body.classList.add(`theme-${theme}`);
  
  // Sync in File Manager if open
  if (currentFolder === 'wallpapers') {
    loadFolder('wallpapers');
  }

  // Update neofetch theme outputs automatically
  const termHistory = document.getElementById('term-history');
  const welcomeText = document.createElement('div');
  welcomeText.innerHTML = `\e[1;30m[System] Theme switched to \e[1;36m${theme.toUpperCase()}\e[0m`;
  termHistory.appendChild(welcomeText);
  scrollToBottom();
}

// ==================== FILE MANAGER ====================
function setupFileManager() {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const folder = item.dataset.folder;
      loadFolder(folder);
    });
  });
}

function loadFolder(folderName) {
  currentFolder = folderName;
  const grid = document.getElementById('fm-grid');
  grid.innerHTML = '';
  
  const files = fileSystem[folderName];
  if (!files) return;

  files.forEach(file => {
    const item = document.createElement('div');
    item.className = 'fm-item';
    
    if (file.type === 'wallpaper') {
      item.innerHTML = `
        <div class="wallpaper-thumb" style="background-image: url('${file.thumb}');"></div>
        <span class="fm-item-label">${file.name}</span>
      `;
      item.addEventListener('click', () => {
        setTheme(file.file);
        // Sync active setting button
        document.querySelectorAll('.theme-option').forEach(opt => {
          if (opt.dataset.theme === file.file) {
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
          }
        });
      });
    } else {
      item.innerHTML = `
        <span class="fm-item-icon">${file.icon}</span>
        <span class="fm-item-label">${file.name}</span>
      `;
      
      if (file.type === 'dir') {
        item.addEventListener('click', () => {
          // Find sidebar selector
          document.querySelectorAll('.sidebar-item').forEach(i => {
            if (i.dataset.folder === file.name.toLowerCase()) {
              i.click();
            }
          });
        });
      } else if (file.type === 'file') {
        item.addEventListener('click', () => {
          // Open in Text Editor
          openApp('editor');
          const textarea = document.querySelector('.editor-textarea');
          textarea.value = file.content;
          document.getElementById('win-editor').querySelector('.window-title').textContent = `FeatherPad - ${file.name}`;
        });
      }
    }
    
    grid.appendChild(item);
  });
}

// ==================== SYSTEM MONITOR & CLOCK WIDGETS ====================
function startClock() {
  const clock = document.getElementById('clock-time');
  
  function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    
    clock.textContent = `${hours}:${minutes} ${ampm}`;
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

function startSystemMonitor() {
  const cpuVal = document.getElementById('cpu-val');
  const ramVal = document.getElementById('ram-val');
  const cpuPct = document.getElementById('cpu-pct');
  const ramPct = document.getElementById('ram-pct');
  const cpuCircle = document.getElementById('cpu-circle-path');
  const ramCircle = document.getElementById('ram-circle-path');
  const uptimeWidget = document.getElementById('uptime-val');

  // Random fluctuations
  setInterval(() => {
    // CPU
    const cpu = Math.floor(Math.random() * 25) + 5; // 5% - 30%
    cpuVal.textContent = `${cpu}%`;
    cpuPct.textContent = `${cpu}%`;
    cpuCircle.setAttribute('stroke-dasharray', `${cpu}, 100`);

    // RAM
    const ramOffset = (Math.random() * 0.2) - 0.1;
    let ramUsage = parseFloat(ramVal.textContent);
    ramUsage = Math.max(0.8, Math.min(4.5, ramUsage + ramOffset));
    ramVal.textContent = `${ramUsage.toFixed(1)}G`;
    
    const ramPercent = Math.round((ramUsage / 16.0) * 100);
    ramPct.textContent = `${ramPercent}%`;
    ramCircle.setAttribute('stroke-dasharray', `${ramPercent}, 100`);
    
    // Uptime
    systemUptime += 2;
    const hours = Math.floor(systemUptime / 3600);
    const minutes = Math.floor((systemUptime % 3600) / 60);
    uptimeWidget.textContent = `${hours}h ${minutes}m`;
  }, 2000);
}

// Browser Simulation Homepage
document.getElementById('browser-content').innerHTML = `
  <div class="browser-showcase-page">
    <div class="browser-hero">
      <h1>Usery OS Welcome Center</h1>
      <p>A minimalist, aesthetic, and ultra-lightweight Linux distribution based on Archcraft.</p>
    </div>
    <div class="browser-grid">
      <div class="browser-card" onclick="window.parent.openApp('settings')">
        <h3>Change System Theme</h3>
        <p>Switch between Nordic Glacier, Dracula Dark, and Cyberpunk Neon colors.</p>
      </div>
      <div class="browser-card" onclick="window.parent.openApp('terminal')">
        <h3>Interactive CLI</h3>
        <p>Launch Alacritty terminal. Type 'neofetch' to view specs or 'cmatrix' for rain code.</p>
      </div>
      <div class="browser-card" onclick="window.parent.openApp('files')">
        <h3>System Files</h3>
        <p>Browse default directories, read notes, and double-click wallpapers to apply.</p>
      </div>
    </div>
  </div>
`;
