const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)){
    fs.mkdirSync(assetsDir);
}

const files = ['icon.png', 'adaptive-icon.png', 'favicon.png', 'splash.png'];
files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'dummy content');
    }
});

console.log('✅ Assets folder and dummy icons created!');
