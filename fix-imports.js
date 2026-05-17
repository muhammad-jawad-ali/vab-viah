const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('SafeAreaView') && content.includes(`from 'react-native'`)) {
    // Remove SafeAreaView from the react-native import
    content = content.replace(/,\s*SafeAreaView/, '');
    content = content.replace(/SafeAreaView,\s*/, '');
    
    // Add import for SafeAreaView from react-native-safe-area-context
    const newImport = `\nimport { SafeAreaView } from 'react-native-safe-area-context';`;
    
    // Insert new import after the first import statement
    const firstImportEnd = content.indexOf(';') + 1;
    content = content.slice(0, firstImportEnd) + newImport + content.slice(firstImportEnd);

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
