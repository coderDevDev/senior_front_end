(function() {
  try {
    // Get a reference to the original module
    const originalScript = document.createElement('script');
    originalScript.type = 'module';
    originalScript.textContent = `
      const FingerprintSdk = require('./sdk_mod.js');
      
      // Make it available globally
      window.FingerprintSdk = FingerprintSdk;
      
      // Signal that it's ready
      const event = new CustomEvent('fingerprintSdkReady');
      window.dispatchEvent(event);
    `;
    
    // Add the script to the document
    document.head.appendChild(originalScript);
  } catch (error) {
    console.error('Error in SDK wrapper:', error);
  }
})();
