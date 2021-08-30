exports.parseOSU = (content) => {
  const lines = content.split('\r\n');
  const data = {};
  let currCategory;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line[0]==='[') {
      const category = line.replace(/\[/g, '').replace(/\]/g, '');
      data[category] = {};
      currCategory = category;
      //console.log('----');
      //console.log(currCategory);
    } else {

      //console.log('startline:' + line);
      
      const partsDot = line.split(':');
      const partsComma = line.split(',');

      if (line[0] !== '/') {
        if (currCategory === 'HitObjects' || currCategory === 'TimingPoints' || currCategory === 'Events') {
          console.log('Case comma');
          if (Object.keys(data[currCategory]).length === 0) data[currCategory] = [];

          const partsComma = line.split(',');
          const rightPart = [];

          /*if (currCategory === 'HitObjects') {
            console.log('HIT=OBJ')
            partsComma.forEach((item) => {
              item = item.replace(/^\s+/g, '').trim();
              console.log(item);
              if (item.split('|').length > 1) {
                rightPart.push(item);
              } else {
                rightPart.push(parseInt(item));
              }
              console.log(rightPart);
            });
          } else {
            console.log('EVENTS OR TIMING');
            
          }*/
          partsComma.forEach((item) => {
            item = item.replace(/^\s+/g, '').trim();
            rightPart.push(item);
          });
          
          data[currCategory].push(rightPart);
          //console.log('resultline:', `${partsComma.join(',')}`)
        } if (partsDot.length > 1 && partsComma.length > 1) {
          //console.log('Case dots and comma');
          const leftPart = partsDot[0].replace(/^\s+/g, '');
          const rightPart = partsDot[1].split(',');
          rightPart.forEach((item) => {
            item = item.replace(/^\s+/g, '').trim();
          });
          data[currCategory][leftPart] = rightPart;
          //console.log('resultline:', `${leftPart}:${rightPart.join(',')}`)
        } else if (partsDot.length > 1) {
          //console.log('Case dots');
          const leftPart = partsDot[0].replace(/^\s+/g, '').trim();
          const rightPart = partsDot[1].replace(/^\s+/g, '').trim();
          data[currCategory][leftPart] = rightPart;
          //console.log('resultline:', `${leftPart}:${rightPart}`)
        } else {
          //console.log('Ignore case');
        }
      }
    }
  }
  //console.log(data);
  
  return data;
}