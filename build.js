const { execSync } = require('child_process');
try {
  const result = execSync('npm run build', { cwd: __dirname, encoding: 'utf-8' });
  console.log('✅ Build successful!');
} catch (error) {
  console.error('❌ Build failed:', error.stdout || error.stderr);
}
