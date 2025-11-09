const fs = require('fs');
const path = require('path');

function deleteCache(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteCache(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dir);
    }
  } catch (e) {
    // Ignore errors
  }
}

// Delete ESLint cache
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
deleteCache(cacheDir);

// Also delete .eslintcache if it exists
const eslintCache = path.join(__dirname, '.eslintcache');
if (fs.existsSync(eslintCache)) {
  fs.unlinkSync(eslintCache);
}

console.log('✅ ESLint cache cleared successfully!');

