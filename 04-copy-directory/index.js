const { resolve } = require('path');
const fs = require('fs').promises;
const path = require('node:path');
const files = path.join(__dirname, 'files');
const filesCopy = path.join(__dirname, 'files-copy');

// create folder
fs.mkdir(filesCopy)
  .then(() => {
    copyfiles(files, filesCopy);
  })
  .catch(() => {
    deletefiles(filesCopy)
    copyfiles(files, filesCopy);
  })
  .catch(err => console.error(err));

async function getFiles(dir) { // create filelist
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  // recursion if need
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files); // all path to massive
}

// copy files to destination folder
function copyfiles(startDir, destinationDir) {
  getFiles(startDir)
  .then(function(files){
    files.forEach(element => {
      fs.copyFile(element, path.join(destinationDir, path.basename(element)));
    });
    console.log('files copied');
  })
  .catch(err => console.error(err));
}

// delete files if copy-file exists to destination folder
function deletefiles(dir) {
  getFiles(dir)
  .then(function(files){
    files.forEach(element => {
      fs.unlink(element, path.join(dir, path.basename(element)));
    });
    console.log('files deleted');
  })
  .catch(err => console.error(err));
}