const fs = require('fs-extra');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dipsDir = `${rootDir}/dips`;
const docsDir = `${rootDir}/docs`;
const dest = `${rootDir}/all-docs__GENERATED`;

fs.emptyDir(dest)
  .then(() => Promise.all([
    fs.copy(dipsDir, dest),
    fs.copy(docsDir, dest),
  ]));

