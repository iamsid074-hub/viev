const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const http = require('http');

// Chrome desktop user agent to prevent Google "browser or app not secure" block during sign-in
const CHROME_DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    backgroundColor: '#0a0a0c',
    autoHideMenuBar: true,
    show: true,
    title: 'VIEVS • Liquid OS & Real YouTube',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enables <webview> for native full YouTube inside the app
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Apply clean standard Chrome user agent across default and persistent partitions
  session.defaultSession.setUserAgent(CHROME_DESKTOP_UA);
  const ytSession = session.fromPartition('persist:youtube_session');
  ytSession.setUserAgent(CHROME_DESKTOP_UA);

  // Handle popups (like Google login OAuth windows)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'allow' };
  });

  // Check if serve.js is already running on 127.0.0.1:3000
  const req = http.get('http://127.0.0.1:3000', (res) => {
    mainWindow.loadURL('http://127.0.0.1:3000');
  });

  req.on('error', () => {
    try {
      require('./serve.js');
      setTimeout(() => {
        mainWindow.loadURL('http://127.0.0.1:3000');
      }, 700);
    } catch (err) {
      mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure popups inside webviews (e.g. Google Sign-In) are allowed
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'allow' };
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
