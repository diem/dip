const fs = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const lipsDir = `${rootDir}/lips`;
const docsDir = `${rootDir}/docs`;
const dest = `${rootDir}/all-docs__GENERATED`;

fs.emptyDir(dest)
  .then(() => Promise.all([
    fs.copy(lipsDir, dest),
    fs.copy(docsDir, dest),
  ]));

