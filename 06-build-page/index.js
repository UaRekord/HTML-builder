const { resolve } = require('path');
const fs = require('fs');
const path = require('node:path');
const stylesDir = path.join(__dirname, 'styles');
const distDir = path.join(__dirname, 'project-dist');

async function getFiles(dir) { // create filelist to copy
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  // recursion if need
  const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files); // all path to massive
}

//remove all files in folder
function clearAndWriteDestination(dir) {
  fs.access(dir, function(error){
    if (error) {
      fs.promises.mkdir(dir)
      .then(() => console.log('Directory created successfully'))
      .catch((error) => console.log(error));
    } else {
      getFiles(dir)
      .then(function(files){
        files.forEach(element => {
          fs.promises.unlink(element, path.join(dir, path.basename(element)));
          console.log('File removed successfully')
        });
      }).then(() => {
        packHTML();
        packStyles();
      })
      .catch((err) => console.error(err));
    }
  });
}

clearAndWriteDestination(distDir);

// download html from folder 'components'
async function getHTML(data) {
  let keys = data.map((element) => {
    return path.basename(element, path.extname(element));
  })
  let defs = data.map(async(element) => {
      return await fs.promises.readFile(element, 'utf-8')
    })
  return Promise.all(defs).then((data) => {
    let result = {};
    keys.forEach((key, i) => result[key] = data[i]);
    return result;
});
}

// generate index.html
function generateHtml(inputData, pathToTemplate) {
  return fs.promises.readFile(pathToTemplate, 'utf-8')
    .then((fileContent) => {
      fileContent = fileContent.replace(/\{\{header\}\}/, inputData.header);
      fileContent = fileContent.replace(/\{\{articles\}\}/, inputData.articles);
      fileContent = fileContent.replace(/\{\{footer\}\}/, inputData.footer);
      return fileContent;
    })
}

// check file extension
function checkFileExtension(arrayOfFiles, extension) {
  let arrayOutput = []
  arrayOutput = arrayOfFiles.map((item) => {
    if (path.extname(item) == `.${extension}`) {
     return item;
    }
  }).filter((item) => item);
  return arrayOutput;
}

// work with CSS files
function packStyles() {
  getFiles(stylesDir)
  .then((files) => {
    let writeStream = fs.createWriteStream(path.join(distDir, 'style.css'), 'utf8');
      files.forEach(element => {
        if (path.extname(element) === '.css') {
        let readableStream = fs.createReadStream(element, 'utf8');
        readableStream.on('data', (chunk) => writeStream.write(chunk));
        console.log('write');
      }
    });
  })
  .catch((err) => console.error(err));
}

// work with HTML files
function packHTML() {
  getFiles(path.join(__dirname, 'components'))
  .then((data) => {
  return checkFileExtension(data, 'html')
  })
  .then((data) => {
    return getHTML(data);
  }).then((data) => {
    return generateHtml(data, (path.join(__dirname, 'template.html')));
  }).then((data) => {
    let writeStream = fs.createWriteStream(path.join(distDir, 'index.html'), 'utf8');
    writeStream.write(data);
  })
  .catch((error) => console.log(error));
}