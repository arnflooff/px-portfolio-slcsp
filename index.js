import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { join } from 'path';
const dataDir = 'data';

const zips = new Map(); // e.g. {'36749': 'AL 11', ...}
createReadStream(join(dataDir, 'zips.csv'))
  .pipe(csv())
  .on('data', (data) => {
    const zipcode = data.zipcode; // e.g. '36749'
    const rateArea = data.state + ' ' + data.rate_area; // e.g. 'AL 11'
    if (!zips.has(zipcode)) {
      zips.set(zipcode, rateArea);
    } else {
      if (zips.get(zipcode) !== rateArea) { // e.g. '36272' has 'AL 1' and 'AL 13'
        zips.set(zipcode, null);
      }
    } // e.g. '36005' has 'AL 13' 3 times
  })
  .on('end', () => {
    onEndAll();
  });

const plans = new Map(); // e.g. {'GA 7': [298.62, 285.07, ...], ...}
createReadStream(join(dataDir, 'plans.csv'))
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
    onEndAll();
  });

let nEndAll = 0;
// called after zips.csv and plans.csv have both been processed
function onEndAll() {
  if (++nEndAll < 2) {
    return;
  }

  // log column headers
  console.log('zipcode,rate');

  createReadStream(join(dataDir, 'slcsp.csv'))
    .pipe(csv())
    .on('data', (data) => {
      const zipcode = data.zipcode;
      let slcsp;
      if (!zips.has(zipcode)) {
        slcsp = '';
      } else {
        const rateArea = zips.get(zipcode);
        if (plans.has(rateArea)) {
          const rates = Array.from(plans.get(rateArea));
          rates.sort((a, b) => a - b);
          if (rates.length < 2) {
            slcsp = '';
          } else {
            slcsp = rates[1].toFixed(2);
          }
        } else {
          slcsp = '';
        }
      }
      console.log(`${zipcode},${slcsp}`);
    })
    .on('end', () => {
      // console.log('the end');
    });
}