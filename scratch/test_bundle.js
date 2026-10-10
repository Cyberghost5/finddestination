const fs = require('fs');
const s = fs.readFileSync('C:/laragon/www/tafiya/public/build/assets/main-ICqqdQOF.js', 'utf8');
console.log('contains /approval:', s.includes('/approval'));
console.log('contains action:', s.includes('action'));
console.log('contains host_status:', s.includes('host_status'));
const idx = s.indexOf('/approval');
if (idx !== -1) {
  console.log('context around /approval:', s.substring(Math.max(0, idx - 100), Math.min(s.length, idx + 200)));
}
