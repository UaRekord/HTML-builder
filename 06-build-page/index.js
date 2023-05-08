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

fs.promises.rmdir(path.join(__dirname, 'project-dist'))
  .then(() => console.log('Directory removed successfully'))
  .catch(() => console.log('Error!'));

fs.promises.mkdir(path.join(__dirname, 'project-dist'))
  .then(() => console.log('Directory created successfully'))
  .catch(() => console.log('Error!'));

getFiles(path.join(__dirname, 'components'))
  .then((data) => {
    result = {};
    let keys = data.map(async (element) => {
      return (path.basename(element, path.extname(element)));
    })
    let defs = data.map(async (element) => {
      return await fs.promises.readFile(element, 'utf-8')
    })
      return Promise.all(defs);
  }).then((data) => {
    /* let result = {};
    keys.forEach((key, i) => result[key] = data[i]); */
    console.log(data);
    // console.log(data);
  })

  .catch((error) => console.log(error));


//htmlComponents[path.basename(element, path.extname(element))] = fileContent;




/* fs.promises.readFile(path.join(__dirname, 'template.html'), 'utf8')
  .then((fileContent) => {
    fileContent.replace(/\{\{header\}\}/, fileContentHeader);
  })
  .catch(() => console.log('Error!')); */

 /*  fs.promises.readFile(path.join(__dirname, 'template.html'), 'utf8')
  .then((fileContent) => {
    fileContent.replace(/\{\{header\}\}/, htmlComponents.header);
    fileContent.replace(/\{\{footer\}\}/, htmlComponents.footer);
    fileContent.replace(/\{\{articles\}\}/, htmlComponents.articles);
    console.log(fileContent);
    return fileContent; */


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