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

//remove dir if exist
/* fs.promises.rmdir(path.join(distDir, 'assets'))
  .then(() => console.log('Directory removed successfully'))
  .catch((error) => console.log(error)); */



// clear css
/* fs.truncate((path.join(distDir, 'style.css')), err => {
  if(err) throw err; // не удалось очистить файл
   console.log('style.css успешно очищен');
}); */

//create dir
fs.stat(distDir, function(err, stats) {
  if (err) {
    fs.promises.mkdir(path.join(__dirname, 'project-dist'))
    .then(() => console.log('Folder created successfully'))
    .catch((error) => console.log(error));
  } else {
      console.log("Folder exists");
  }
});

// clear html css
fs.stat(path.join(distDir, 'style.css'), function(err, stats) {
  if (err) {
  } else {
    fs.truncate((path.join(distDir, 'style.css')), err => {
      if(err) throw err; // не удалось очистить файл
       console.log('style.css успешно очищен');
    }
  )}
});

fs.stat(path.join(distDir, 'index.html'), function(err, stats) {
  if (err) {
  } else {
    fs.truncate((path.join(distDir, 'index.html')), err => {
      if(err) throw err; // не удалось очистить файл
       console.log('index.html успешно очищен');
    }
  )}
});

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

getFiles(stylesDir)
  .then((files) => {
    let writeStream = fs.createWriteStream(path.join(distDir, 'style.css'), 'utf8');
      files.forEach(element => {
        if (path.extname(element) === '.css') {
        let readableStream = fs.createReadStream(element, 'utf8');
        readableStream.on('data', (chunk) => writeStream.write(chunk));
      }
    });
    console.log('bundle is OK');
  })
  .catch(err => console.error(err));

// copy folder 'assets'