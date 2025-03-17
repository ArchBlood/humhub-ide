const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('line-numbers');
const cursorPosition = document.getElementById('cursor-position');
const fileType = document.getElementById('file-type');

const humhubSnippets = require('./humhub-snippets');

updateLineNumbers();

editor.addEventListener('input', () => {
  updateLineNumbers();
  updateCursorPosition();
});

editor.addEventListener('click', updateCursorPosition);
editor.addEventListener('keyup', updateCursorPosition);

function updateLineNumbers() {
  const lines = editor.value.split('\n');
  const count = lines.length;

  let lineNumbersHTML = '';
  for (let i = 1; i <= count; i++) {
    lineNumbersHTML += `<div>${i}</div>`;
  }

  lineNumbers.innerHTML = lineNumbersHTML;

  lineNumbers.scrollTop = editor.scrollTop;
}

editor.addEventListener('scroll', () => {
  lineNumbers.scrollTop = editor.scrollTop;
});

function updateCursorPosition() {
  const text = editor.value;
  const cursorPos = editor.selectionStart;

  let lineCount = 1;
  let charCount = 1;

  for (let i = 0; i < cursorPos; i++) {
    if (text[i] === '\n') {
      lineCount++;
      charCount = 1;
    } else {
      charCount++;
    }
  }

  cursorPosition.textContent = `Ln ${lineCount}, Col ${charCount}`;
}

function detectFileType(filename) {
  if (!filename) return 'Plain Text';

  const extension = filename.split('.').pop().toLowerCase();
  const typeMap = {
    'php': 'PHP',
    'js': 'JavaScript',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'xml': 'XML',
    'yml': 'YAML',
    'txt': 'Plain Text'
  };

  return typeMap[extension] || 'Plain Text';
}

ipcRenderer.on('file-content', (event, content) => {
  editor.value = content;
  updateLineNumbers();
  updateCursorPosition();

  const currentFile = document.querySelector('.tab.active').textContent;
  const type = detectFileType(currentFile);
  fileType.textContent = type;

  applySyntaxHighlighting(type);
});

function applySyntaxHighlighting(type) {
  if (type === 'PHP') {
    highlightPHP();
  }
}

function highlightPHP() {
  // This is just a placeholder for the concept
}

document.addEventListener('DOMContentLoaded', () => {
  const snippetItems = document.querySelectorAll('.snippet-item');
  snippetItems.forEach(item => {
    item.addEventListener('click', () => {
      const snippetKey = item.getAttribute('data-snippet');
      insertSnippet(snippetKey);
    });
  });
});

function insertSnippet(snippetKey)

ipcRenderer.on('save-file', () => {
  ipcRenderer.send('save-file-content', editor.value);
});
