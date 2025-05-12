// src/fingerprint_reader/sdk_adapter.ts

// This adapter provides a bridge between your existing SDK and the new component

// Define interface to match your original SDK
export interface IFingerprintSdk {
  getDeviceList: () => Promise<string[]>;
  startCapture: () => void;
  stopCapture: () => void;
}

// Lazily initialize SDK when needed
let sdkInstance: IFingerprintSdk | null = null;

// This function loads and caches the SDK
export async function getSdk(): Promise<IFingerprintSdk> {
  if (sdkInstance) {
    return sdkInstance;
  }

  try {
    // Dynamically load the original script
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/fingerprint_reader/api/sdk_mod.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load fingerprint SDK'));
      document.head.appendChild(script);
    });

    // The original code pattern
    // In the working app: import { FingerprintSdk } from './fingerprint_reader/api/sdk_mod'
    
    // First check if it's directly available
    if (typeof window.FingerprintSdk === 'function') {
      sdkInstance = new window.FingerprintSdk();
      return sdkInstance;
    }
    
    // If not, try to access as a module
    throw new Error('Please copy the SDK file to the public directory first');
  } catch (error) {
    console.error('Failed to initialize fingerprint SDK:', error);
    throw error;
  }
}

// Optional: Create a React hook for easier use
export function useFingerprintSdk() {
  return {
    getSdk
  };
}
