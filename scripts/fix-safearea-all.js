const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'SignupScreen.tsx');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already processed or doesn't have SafeAreaView
  if (!content.includes('SafeAreaView')) return;

  // Replace all occurrences of SafeAreaView in imports
  content = content.replace(/import\s*\{\s*SafeAreaView\s*\}\s*from\s*'react-native-safe-area-context';\n/g, '');
  content = content.replace(/,\s*SafeAreaView\s*/g, '');
  content = content.replace(/SafeAreaView\s*,\s*/g, '');

  // Add the useSafeAreaInsets import
  const insetsImport = "import { useSafeAreaInsets } from 'react-native-safe-area-context';\n";
  const firstImportEnd = content.indexOf(';') + 1;
  content = content.slice(0, firstImportEnd) + '\n' + insetsImport + content.slice(firstImportEnd);

  // Replace <SafeAreaView with <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
  content = content.replace(/<SafeAreaView/g, '<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}');
  content = content.replace(/<\/SafeAreaView>/g, '</View>');

  // Find the component definition and inject `const insets = useSafeAreaInsets();`
  // Usually `export const ScreenName = ({ navigation }: any) => {`
  const compRegex = /(export const \w+ = \([^)]*\) => \{)/;
  content = content.replace(compRegex, "$1\n  const insets = useSafeAreaInsets();");

  // Fix AppNavigator if needed, though it's not in screens folder.

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
