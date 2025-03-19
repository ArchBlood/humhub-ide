const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if the HumHub snippets file exists using the main process
let humhubSnippets = {};
try {
  // First try to check if the file exists via IPC
  const checkResult = ipcRenderer.sendSync('check-snippets-file');

  if (checkResult.exists) {
    // If the file exists, require it
    humhubSnippets = require('./humhub-snippets');
    console.log('HumHub snippets loaded successfully');
  } else {
    // If the file doesn't exist, log the path where it should be
    console.warn('HumHub snippets file not found at path:', checkResult.path);

    // Create a basic snippets file if it doesn't exist
    ipcRenderer.send('create-snippets-file', checkResult.path);
  }
} catch (error) {
  console.warn('Error loading HumHub snippets:', error);
  humhubSnippets = {};
}

// Add an event listener to populate the snippets menu in the UI
document.addEventListener('DOMContentLoaded', () => {
  const snippetsContainer = document.getElementById('snippets-container');
  if (snippetsContainer) {
    // Clear existing content
    snippetsContainer.innerHTML = '';

    // Add available snippets to the UI
    if (Object.keys(humhubSnippets).length > 0) {
      for (const [key, value] of Object.entries(humhubSnippets)) {
        const snippetItem = document.createElement('div');
        snippetItem.className = 'snippet-item';
        snippetItem.setAttribute('data-snippet', key);
        snippetItem.textContent = key;

        // Add click event to insert the snippet
        snippetItem.addEventListener('click', () => {
          insertSnippet(key);
        });

        snippetsContainer.appendChild(snippetItem);
      }
    } else {
      // Show a message if no snippets are available
      const noSnippetsMsg = document.createElement('div');
      noSnippetsMsg.className = 'no-snippets';
      noSnippetsMsg.textContent = 'No snippets available. Create humhub-snippets.js in the app directory.';
      snippetsContainer.appendChild(noSnippetsMsg);
    }
  }
});

// Initialize CodeMirror editor
const editor = CodeMirror(document.getElementById('editor-container'), {
  lineNumbers: true,
  theme: 'monokai',
  mode: 'javascript',
  indentUnit: 2,
  smartIndent: true,
  indentWithTabs: false,
  lineWrapping: false,
  matchBrackets: true,
  autoCloseBrackets: true,
  autofocus: true
});

// Set editor size to fill container
editor.setSize("100%", "100%");

// Initialize app state
let currentProjectPath = '';
let currentFilePath = '';

// Create an IPC handler for project opening
ipcRenderer.on('project-opened', (event, projectPath) => {
  currentProjectPath = projectPath;
  renderFileTree(projectPath);
});

// Handle file content from main process
ipcRenderer.on('file-content', (event, content) => {
  editor.setValue(content);

  try {
    // Detect file type from current file path and set CodeMirror mode
    if (currentFilePath !== '') {
      const extension = path.extname(currentFilePath).toLowerCase();
      setEditorMode(extension);
    }
  } catch (error) {
    console.error('Error setting editor mode:', error);
  }

  // Update cursor position after loading content
  updateCursorPosition();
});

// Update file path in status bar when a file is opened
ipcRenderer.on('file-opened', (event, filePath) => {
  currentFilePath = filePath;
  document.getElementById('file-path').textContent = filePath;

  if (filePath !== 'No file open') {
    try {
      // Set editor mode based on file extension
      const extension = path.extname(filePath).toLowerCase();
      setEditorMode(extension);
    } catch (error) {
      console.error('Error setting editor mode:', error);
    }
  }
});

// Handle save request from main process
ipcRenderer.on('save-file', () => {
  const content = editor.getValue();
  ipcRenderer.send('save-file-content', content);
});

// Function to set editor mode based on file extension
function setEditorMode(extension) {
  let mode;
  let fileType;

  // Default to plain text first
  editor.setOption('mode', 'text/plain');

  switch (extension) {
    case '.js':
      mode = 'javascript';
      fileType = 'JavaScript';
      break;
    case '.html':
      mode = 'htmlmixed';
      fileType = 'HTML';
      break;
    case '.css':
      mode = 'css';
      fileType = 'CSS';
      break;
    case '.php':
      mode = 'application/x-httpd-php';
      fileType = 'PHP';
      break;
    case '.json':
      mode = {name: 'javascript', json: true};
      fileType = 'JSON';
      break;
    case '.xml':
      mode = 'xml';
      fileType = 'XML';
      break;
    case '.yml':
    case '.yaml':
      mode = 'yaml';
      fileType = 'YAML';
      break;
    default:
      mode = 'text/plain';
      fileType = 'Text';
  }

  editor.setOption('mode', mode);
  document.getElementById('file-type').textContent = fileType;
}

// Function to update cursor position display
function updateCursorPosition() {
  const cursor = editor.getCursor();
  const line = cursor.line + 1;
  const column = cursor.ch + 1;
  document.getElementById('cursor-position').textContent = `Ln ${line}, Col ${column}`;
}

// Add cursor position tracking
editor.on('cursorActivity', updateCursorPosition);

// Function to render the file tree
function renderFileTree(dirPath, container = document.getElementById('file-tree'), level = 0) {
  // Clear the container if it's the top level
  if (level === 0) {
    container.innerHTML = '';
  }

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    // Sort items: folders first, then files, both alphabetically
    const sortedItems = items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    sortedItems.forEach(item => {
      const itemPath = path.join(dirPath, item.name);
      const element = document.createElement('div');
      const levelClass = level > 0 ? ` level-${Math.min(level, 5)}` : '';

      if (item.isDirectory()) {
        element.className = `folder${levelClass}`;

        // Create a folder label element to avoid mixing content
        const folderLabel = document.createElement('div');
        folderLabel.className = 'folder-label';
        folderLabel.innerHTML = `<i class="fas fa-folder"></i>${item.name}`;
        element.appendChild(folderLabel);

        // Create a container for subfolder contents
        const subContainer = document.createElement('div');
        subContainer.className = 'folder-contents';
        subContainer.style.display = 'none'; // Initially hidden
        element.appendChild(subContainer);

        // Click handler for folders
        folderLabel.addEventListener('click', (e) => {
          e.stopPropagation();

          // Toggle folder open/closed
          const isOpen = element.classList.contains('open');

          if (isOpen) {
            element.classList.remove('open');
            folderLabel.querySelector('i').className = 'fas fa-folder';
            subContainer.style.display = 'none';
          } else {
            element.classList.add('open');
            folderLabel.querySelector('i').className = 'fas fa-folder-open';
            subContainer.style.display = 'block';

            // Only render the subfolder content if it's not already rendered
            if (subContainer.children.length === 0) {
              renderFileTree(itemPath, subContainer, level + 1);
            }
          }
        });

        container.appendChild(element);
      } else {
        element.className = `file${levelClass}`;

        // Set icon based on file extension
        const ext = path.extname(item.name).toLowerCase();
        let iconClass = 'fas fa-file';

        if (['.js', '.ts'].includes(ext)) iconClass = 'fab fa-js';
        else if (['.html', '.htm'].includes(ext)) iconClass = 'fab fa-html5';
        else if (['.css', '.scss', '.less'].includes(ext)) iconClass = 'fab fa-css3-alt';
        else if (['.php'].includes(ext)) iconClass = 'fab fa-php';
        else if (['.json', '.xml', '.yaml', '.yml'].includes(ext)) iconClass = 'fas fa-code';

        element.innerHTML = `<i class="${iconClass}"></i>${item.name}`;

        // Click handler for files
        element.addEventListener('click', () => {
          // Tell main process to open this file
          ipcRenderer.send('open-file', itemPath);

          // Highlight the active file
          const activeElements = document.querySelectorAll('.file.active');
          activeElements.forEach(el => el.classList.remove('active'));
          element.classList.add('active');
        });

        container.appendChild(element);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    const errorElement = document.createElement('div');
    errorElement.className = 'file-tree-error';
    errorElement.textContent = 'Error loading files';
    container.appendChild(errorElement);
  }
}

// Add event listeners for sidebar buttons
document.getElementById('refresh-tree').addEventListener('click', () => {
  if (currentProjectPath) {
    renderFileTree(currentProjectPath);
  }
});

document.getElementById('new-file').addEventListener('click', () => {
  if (currentProjectPath) {
    // Use the main process to show a dialog for new file creation
    ipcRenderer.send('create-new-file', currentProjectPath);
  }
});

document.getElementById('new-folder').addEventListener('click', () => {
  if (currentProjectPath) {
    // Use the main process to show a dialog for new folder creation
    ipcRenderer.send('create-new-folder', currentProjectPath);
  }
});

// Handle module generation
document.getElementById('generate-module').addEventListener('click', () => {
  const moduleName = document.getElementById('module-name').value.trim();
  const moduleType = document.getElementById('module-type').value;
  const moduleAuthor = document.getElementById('module-author').value.trim();

  if (!moduleName) {
    alert('Please enter a module name');
    return;
  }

  if (!currentProjectPath) {
    alert('Please open a project first');
    return;
  }

  // Generate the module using the main process
  ipcRenderer.send('generate-humhub-module', {
    projectPath: currentProjectPath,
    moduleName,
    moduleType,
    moduleAuthor
  });
});

// Resizable sidebar
const sidebarResizer = document.getElementById('sidebar-resizer');
const sidebar = document.querySelector('.sidebar');

sidebarResizer.addEventListener('mousedown', initResize);

function initResize(e) {
  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', stopResize);
}

function resize(e) {
  const newWidth = Math.max(150, Math.min(500, e.clientX));
  sidebar.style.width = newWidth + 'px';
}

function stopResize() {
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', stopResize);
}

// Add function to insert HumHub snippets
function insertSnippet(snippetKey) {
  if (humhubSnippets && humhubSnippets[snippetKey]) {
    const snippet = humhubSnippets[snippetKey];
    const cursor = editor.getCursor();

    // Insert the snippet at cursor position
    editor.replaceRange(snippet, cursor);

    // Focus the editor after insertion
    editor.focus();
  } else {
    console.warn(`Snippet '${snippetKey}' not found`);
  }
}

// Set up snippet insertion
document.addEventListener('DOMContentLoaded', () => {
  const snippetItems = document.querySelectorAll('.snippet-item');
  snippetItems.forEach(item => {
    item.addEventListener('click', () => {
      const snippetKey = item.getAttribute('data-snippet');
      insertSnippet(snippetKey);
    });
  });
});
