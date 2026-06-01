const { htmlToText } = require('html-to-text');

(async () => {
  try {
    console.log('🧪 Simulating fetch_web_content fix (v2)...');
    
    const url = 'https://learn.microsoft.com/en-us/windows/win32/controls/lvn-columnclick';
    
    // Use global fetch (Node 18+)
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // THE FIX: Clone before reading for cache (simulating the fix in performanceUtils.ts)
    const clonedResponse = response.clone();
    const html = await clonedResponse.text();
    
    // Parse with html-to-text using DEFAULT config first to see if it works
    try {
      const text = htmlToText(html);
      console.log('✅ SUCCESS (Default Config)!');
      console.log('📄 Content length:', text.length, 'characters');
      return;
    } catch (e) {
      console.error('❌ Default config failed:', e.message);
    }

    // Try with custom selector but simpler format
    try {
      const text = htmlToText(html, {
        wordwrap: false,
        selectors: [
          { 
            selector: 'img', 
            format: (image) => '[image]', // Explicitly passing a function
          },
        ],
      });
      console.log('✅ SUCCESS (Custom Selector)!');
      console.log('📄 Content length:', text.length, 'characters');
    } catch (e2) {
      console.error('❌ Custom selector failed:', e2.message);
    }
    
  } catch (err) {
    console.error('❌ FAIL:', err.message);
  }
})();
