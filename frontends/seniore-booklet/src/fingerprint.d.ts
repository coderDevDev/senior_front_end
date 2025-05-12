// src/types/fingerprint.d.ts

declare module 'fingerprint_reader/api/sdk_mod' {
  export class FingerprintSdk {
    constructor();
    
    /**
     * Gets the list of connected fingerprint devices
     * @returns {Promise<string[]>} A promise that resolves to an array of device IDs
     */
    getDeviceList(): Promise<string[]>;
    
    /**
     * Starts fingerprint capture
     */
    startCapture(): void;
    
    /**
     * Stops fingerprint capture
     */
    stopCapture(): void;
  }
}
