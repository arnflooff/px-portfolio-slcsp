const csv = require('csv-parser');
const fs = require('fs');

const zips = new Map(); // e.g. {'36749': 'AL 11', ...}
fs.createReadStream('data/zips.csv')
  .pipe(csv())
  .on('data', (data) => {
    const zipcode = data.zipcode; // e.g. '36749'
    const rateArea = data.state + ' ' + data.rate_area; // e.g. 'AL 11'
    if (!zips.has(zipcode)) {
      zips.set(zipcode, rateArea);
    } else {
      if (zips.get(zipcode) !== rateArea) { // e.g. '36272' has 'AL 1' and 'AL 13'
        zips.set(zipcode, null); // 36272
      }
    } // e.g. '36005' has 'AL 13' 3 times
  })
  .on('end', () => {
    console.log(zips.size); // 38804
  });