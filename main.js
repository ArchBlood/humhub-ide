const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let currentFile = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: "HumHub IDE"
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
  
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click() {
            currentFile = null;
            mainWindow.webContents.send('file-content', '');
            mainWindow.setTitle('HumHub IDE - New File');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click() {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'PHP Files', extensions: ['php'] },
                { name: 'Config Files', extensions: ['json', 'yml', 'xml'] },
                { name: 'Web Files', extensions: ['js', 'html', 'css'] },
                { name: 'HumHub Files', extensions: ['php', 'js', 'json', 'css', 'html'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                currentFile = filePath;
                
                fs.readFile(filePath, 'utf8', (err, data) => {
                  if (err) {
                    dialog.showErrorBox('Error', `Failed to open file: ${err.message}`);
                    return;
                  }
                  
                  mainWindow.webContents.send('file-content', data);
                  mainWindow.setTitle(`HumHub IDE - ${path.basename(filePath)}`);
                });
              }
            });
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            if (currentFile) {
              mainWindow.webContents.send('save-file');
            } else {
              saveFileAs();
            }
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            saveFileAs();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click() {
            dialog.showMessageBox(mainWindow, {
              title: 'About HumHub IDE',
              message: 'HumHub IDE v1.0.0\nSpecialized IDE for HumHub development\nBuilt with Electron',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function saveFileAs() {
  dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'PHP Files', extensions: ['php'] },
      { name: 'Config Files', extensions: ['json', 'yml', 'xml'] },
      { name: 'Web Files', extensions: ['js', 'html', 'css'] },
      { name: 'HumHub Files', extensions: ['php', 'js', 'json', 'css', 'html'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePath) {
      currentFile = result.filePath;
      mainWindow.webContents.send('save-file');
      mainWindow.setTitle(`Yii2 & HumHub IDE - ${path.basename(currentFile)}`);
    }
  });
}

// Handle save file request from renderer
ipcMain.on('save-file-content', (event, content) => {
  if (!currentFile) return;
  
  fs.writeFile(currentFile, content, err => {
    if (err) {
      dialog.showErrorBox('Error', `Failed to save file: ${err.message}`);
    }
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
