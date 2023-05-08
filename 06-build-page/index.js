const { resolve } = require('path');
const fs = require('fs');
const path = require('node:path');
const startDir = path.join(__dirname, 'styles');

async function getFiles(dir) { // create filelist to copy
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  // recursion if need
  const files = await Promise.all(dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files); // all path to massive
}

//remove dir if exist
fs.promises.rmdir(path.join(__dirname, 'project-dist'))
  .then(() => console.log('Directory removed successfully'))
  .catch(() => console.log('Error!'));

//create dir
fs.promises.mkdir(path.join(__dirname, 'project-dist'))
  .then(() => console.log('Directory created successfully'))
  .catch(() => console.log('Error!'));

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

// write file to destination
function writeFile(pathToFile, data) {
  let writeStream = fs.createWriteStream(path.join(pathToFile, 'index.html'), 'utf8');
   writeStream.write(data);
}

// work with HTML files
getFiles(path.join(__dirname, 'components'))
  .then((data) => {
   return checkFileExtension(data, 'html')
  })
  .then((data) => {
    return getHTML(data);
  }).then((data) => {
    return generateHtml(data, (path.join(__dirname, 'template.html')));
  }).then((data) => {
    writeFile(path.join(__dirname, 'project-dist'), data);
  })

  .catch((error) => console.log(error));

// work with CSS files

// copy folder 'assets'



/* getFiles(startDir)
  .then((files) => {
    let writeStream = fs.createWriteStream(path.join(__dirname, 'project-dist\\bundle.css'), 'utf8');
      files.forEach(element => {
        if (path.extname(element) === '.css') {
        let readableStream = fs.createReadStream(element, 'utf8');
        readableStream.on('data', (chunk) => writeStream.write(chunk));
      }
    });
    console.log('bundle is OK');
  })
  .catch(err => console.error(err)); */