const path = require('path');
process.chdir(path.resolve('.'));

try {
  const mod = require('./dist/index.js');
  console.log('Module loaded OK');
  
  // Try to register git tools
  try {
    const tools = mod.registerGitTools({});
    console.log('Registered', tools.length, 'tools');
    
    // Check if all expected tools are there
    const toolNames = tools.map(t => t.name);
    console.log('Tool names:', toolNames.join(', '));
  } catch (e) {
    console.error('Error registering tools:', e.message);
    console.error(e.stack);
  }
} catch (e) {
  console.error('Module load error:', e.message);
  console.error(e.stack);
}
