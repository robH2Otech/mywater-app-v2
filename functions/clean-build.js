
const fs = require('fs');
const path = require('path');

// Remove lib directory if it exists
const libPath = path.join(__dirname, 'lib');
if (fs.existsSync(libPath)) {
  fs.rmSync(libPath, { recursive: true, force: true });
  console.log('Removed lib directory');
}

console.log('Clean build completed. Run npm run build to rebuild.');
