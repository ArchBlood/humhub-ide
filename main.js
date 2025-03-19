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
            mainWindow.webContents.send('file-opened', 'No file open');
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
                openFile(filePath);
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

function openFile(filePath) {
  currentFile = filePath;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      dialog.showErrorBox('Error', `Failed to open file: ${err.message}`);
      return;
    }

    mainWindow.webContents.send('file-content', data);
    mainWindow.webContents.send('file-opened', filePath);
    mainWindow.setTitle(`HumHub IDE - ${path.basename(filePath)}`);
  });
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
      mainWindow.webContents.send('file-opened', currentFile);
      mainWindow.setTitle(`HumHub IDE - ${path.basename(currentFile)}`);
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

// Add handler for opening files via drag and drop or command line arguments
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    openFile(filePath);
  } else {
    // Store the path to open once the app is ready
    app.whenReady().then(() => {
      openFile(filePath);
    });
  }
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

// Add these handlers to your main.js file
ipcMain.on('create-new-file', (event, projectPath) => {
  dialog.showSaveDialog({
    defaultPath: projectPath,
    buttonLabel: 'Create',
    title: 'Create New File'
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, '', 'utf8');
      event.sender.send('project-opened', projectPath); // Refresh file tree
    }
  });
});

ipcMain.on('create-new-folder', (event, projectPath) => {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Cancel', 'Create'],
    defaultId: 1,
    title: 'Create New Folder',
    message: 'Enter folder name:',
    inputField: ''
  }).then(result => {
    if (result.response === 1 && result.inputField) {
      const folderPath = path.join(projectPath, result.inputField);
      fs.mkdirSync(folderPath, { recursive: true });
      event.sender.send('project-opened', projectPath); // Refresh file tree
    }
  });
});

ipcMain.on('generate-humhub-module', (event, options) => {
  const { projectPath, moduleName, moduleType, moduleAuthor } = options;
  const moduleDir = path.join(projectPath, moduleName);

  // Create module directory structure based on type
  try {
    fs.mkdirSync(moduleDir, { recursive: true });

    // Generate module.json file
    const moduleJson = {
      id: moduleName,
      name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
      description: `A ${moduleType} HumHub module`,
      version: "0.1",
      humhub: {
        minVersion: "1.8"
      },
      authors: [
        {
          name: moduleAuthor,
          email: "author@example.com"
        }
      ]
    };

    fs.writeFileSync(
      path.join(moduleDir, 'module.json'),
      JSON.stringify(moduleJson, null, 2),
      'utf8'
    );

    // Generate basic module structure based on type
    createModuleStructure(moduleDir, moduleName, moduleType);

    event.sender.send('project-opened', projectPath); // Refresh file tree
  } catch (error) {
    dialog.showErrorBox('Module Generation Failed', error.message);
  }
});

// Helper function to create module structure
function createModuleStructure(moduleDir, moduleName, moduleType) {
  // Create common directories
  ['assets', 'controllers', 'models', 'views'].forEach(dir => {
    fs.mkdirSync(path.join(moduleDir, dir), { recursive: true });
  });

  // Create Module.php file with appropriate class
  const moduleClassName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  let moduleContent = `<?php
namespace humhub\\modules\\${moduleName};

use Yii;
use yii\\helpers\\Url;

class Module extends \\humhub\\components\\Module
{
    public function init()
    {
        parent::init();
        // Custom initialization code goes here
    }
}`;

  fs.writeFileSync(path.join(moduleDir, 'Module.php'), moduleContent, 'utf8');

  // Add type-specific files
  switch (moduleType) {
    case 'content':
      // Add content module specific files
      break;
    case 'widget':
      // Add widget module specific files
      break;
    case 'dashboard':
      // Add dashboard module specific files
      break;
    // Basic module is already covered by the common structure
  }
}

// Add this to your main.js to handle creating the snippets file
ipcMain.on('create-snippets-file', (event, filePath) => {
  try {
    // Check if a snippets file template should be created
    const result = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Skip', 'Create'],
      defaultId: 1,
      title: 'Create Snippets File',
      message: 'HumHub snippets file was not found.',
      detail: 'Would you like to create a basic snippets file?'
    });

    if (result === 1) { // If "Create" was selected
      const basicSnippets = `/**
 * HumHub Code Snippets
 * This file contains commonly used code snippets for HumHub development
 */

module.exports = {
  'controller': \`<?php

namespace humhub\\\\modules\\\\modulename\\\\controllers;

use Yii;
use humhub\\\\components\\\\Controller;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}\`,

  'model': \`<?php

namespace humhub\\\\modules\\\\modulename\\\\models;

use Yii;
use yii\\\\base\\\\Model;

class SampleModel extends Model
{
    public $property1;
    public $property2;

    public function rules()
    {
        return [
            [['property1', 'property2'], 'required'],
        ];
    }
}\`,

  'widget': \`<?php

namespace humhub\\\\modules\\\\modulename\\\\widgets;

use yii\\\\base\\\\Widget;

class SampleWidget extends Widget
{
    public $param;

    public function run()
    {
        return $this->render('sampleWidget', [
            'param' => $this->param
        ]);
    }
}\`
};`;

      fs.writeFileSync(filePath, basicSnippets, 'utf8');
      dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Success',
        message: 'Basic snippets file created successfully.',
        detail: `File created at: ${filePath}`
      });

      // Reload the application to apply the new snippets
      mainWindow.reload();
    }
  } catch (error) {
    dialog.showErrorBox('Error Creating Snippets File', error.message);
  }
});
