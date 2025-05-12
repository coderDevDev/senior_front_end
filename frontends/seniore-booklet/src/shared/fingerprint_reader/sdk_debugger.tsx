/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

// Interface for debug info structure
interface SdkDebugInfo {
  fingerprint?: { type: string; properties: string[] } | string;
  webSdk?: { type: string; properties: string[] } | string;
  newWindowProperties?: { name: string; type: string; value: string }[];
  fingerprintPostLoad?: { type: string; properties: string[] } | string;
  webSdkPostLoad?: { type: string; properties: string[] } | string;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Fingerprint?: unknown;
    WebSdk?: unknown;
    [key: string]: unknown; // Allow dynamic property checking
  }
}

const FingerprintSdkDebugger: React.FC = () => {
  const [sdkInfo, setSdkInfo] = useState<SdkDebugInfo>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const initialWindowProps = Object.keys(window);
      const debugInfo: SdkDebugInfo = {};

      // Check if SDK is already loaded
      debugInfo.fingerprint = window.Fingerprint
        ? { type: typeof window.Fingerprint, properties: Object.keys(window.Fingerprint as object) }
        : 'Not defined';

      debugInfo.webSdk = window.WebSdk
        ? { type: typeof window.WebSdk, properties: Object.keys(window.WebSdk as object) }
        : 'Not defined';

      // Load the script to detect new properties
      const script = document.createElement('script');
      script.src = '/fingerprint.sdk.min.js'; // Adjusted to your mock file
      script.async = true;

      script.onload = () => {
        const newWindowProps = Object.keys(window).filter(
          (key) => !initialWindowProps.includes(key)
        );
        debugInfo.newWindowProperties = newWindowProps.map((key) => ({
          name: key,
          type: typeof (window as any)[key],
          value: String((window as any)[key]).slice(0, 50) + '...',
        }));

        // Re-check after loading
        debugInfo.fingerprintPostLoad = window.Fingerprint
          ? { type: typeof window.Fingerprint, properties: Object.keys(window.Fingerprint as object) }
          : 'Not defined';

        debugInfo.webSdkPostLoad = window.WebSdk
          ? { type: typeof window.WebSdk, properties: Object.keys(window.WebSdk as object) }
          : 'Not defined';

        setSdkInfo(debugInfo);
        console.log('SDK Debug Info:', debugInfo); // For additional debugging
      };

      script.onerror = () => setError('Failed to load SDK script');

      document.body.appendChild(script);

      // Cleanup function returning void
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } catch (err) {
      setError(`Error analyzing SDK: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []); // Empty dependency array ensures it runs once on mount

  return (
    <div className="sdk-debugger">
      <h2>Fingerprint SDK Debugger</h2>
      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
      <pre
        style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '500px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(sdkInfo, null, 2)}
      </pre>
    </div>
  );
};

export default FingerprintSdkDebugger;
