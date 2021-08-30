const fs = require('fs');
const path = require('path');

exports.parseOSU = (content) => {
  const lines = content.split('\r\n');
  const data = {};
  let currCategory;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line[0]==='[') {
      const category = line.replace(/\[/g, '').replace(/\]/g, '');
      data[category] = {};
      currCategory = category;;
    } else {      
      const partsDot = line.split(':');
      const partsComma = line.split(',');

      if (line[0] !== '/') {
        if (currCategory === 'HitObjects' || currCategory === 'TimingPoints' || currCategory === 'Events') {
          if (Object.keys(data[currCategory]).length === 0) data[currCategory] = [];

          const partsComma = line.split(',');
          const rightPart = [];

          partsComma.forEach((item) => {
            item = item.replace(/^\s+/g, '').trim();
            rightPart.push(item);
          });
          
          data[currCategory].push(rightPart);
        } if (partsDot.length > 1 && partsComma.length > 1) {
          const leftPart = partsDot[0].replace(/^\s+/g, '');
          const rightPart = partsDot[1].split(',');
          rightPart.forEach((item) => {
            item = item.replace(/^\s+/g, '').trim();
          });
          data[currCategory][leftPart] = rightPart;
        } else if (partsDot.length > 1) {
          const leftPart = partsDot[0].replace(/^\s+/g, '').trim();
          const rightPart = partsDot[1].replace(/^\s+/g, '').trim();
          data[currCategory][leftPart] = rightPart;
        }
      }
    }
  }
  
  return data;
}

exports.removeAllFilesInDir = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      fs.unlink(path.join(dir, file));
    }
  });
}