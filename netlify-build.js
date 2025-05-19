const fs = require('fs');
const path = require('path');

// Ensure the netlify/functions directory exists
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
  console.log('Created functions directory');
}

// Copy necessary server files
const serverFiles = [
  'server/auth.ts',
  'server/storage.ts',
  'server/routes.ts',
  'server/db.ts',
  'shared/schema.ts'
];

serverFiles.forEach(file => {
  const sourceFile = path.join(__dirname, file);
  const destFile = path.join(__dirname, 'netlify', 'functions', path.basename(file));
  
  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    console.log(`Copied ${file} to netlify/functions`);
  } else {
    console.error(`Source file ${file} not found`);
  }
});

console.log('Build preparation completed successfully');