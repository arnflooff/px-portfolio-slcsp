const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('data/zips.csv')
  .pipe(csv())
  .on('data', (data) => {
    console.log(JSON.stringify(data));
  })
  .on('end', () => {
  });