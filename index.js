const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const dataDir = 'data';

const zips = new Map(); // e.g. {'36749': 'AL 11', ...}
fs.createReadStream(path.join(dataDir, 'zips.csv'))
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

const plans = new Map(); // e.g. {'GA 7': [298.62, 285.07, ...], ...}
fs.createReadStream(path.join(dataDir, 'plans.csv'))
  .pipe(csv())
  .on('data', (data) => {
    if (data.metal_level !== 'Silver')
      return;
    const rateArea = data.state + ' ' + data.rate_area;
    if (!plans.has(rateArea)) {
      plans.set(rateArea, new Set());
    }
    plans.get(rateArea).add(parseFloat(data.rate));
  })
  .on('end', () => {
    console.log(plans.size);
  });