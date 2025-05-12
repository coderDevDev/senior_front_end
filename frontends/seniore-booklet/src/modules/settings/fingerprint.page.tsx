import FingerprintSdkDebugger from "@/shared/fingerprint_reader/sdk_debugger";
import FingerprintReader from "@/shared/fingerprint_reader/sdk_mod";

import { useState } from "react";

// const SDK_URL = '/fingerprint_mock.sdk.min.js'; // Update this to your actual SDK path

const FingerPrintApp: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false);
  const [capturedFingerprint] = useState<string | null>(null);

  // const handleFingerprintCaptured = (imageSrc: string) => {
  //   console.log('Fingerprint captured!');
  //   setCapturedFingerprint(imageSrc);
    
  //   // Here you would typically send the fingerprint data to your backend
  //   // or process it further as needed
  // };

  return (
    <div className="fingerprint-page">
      <h1>Fingerprint Capture</h1>
      
      <FingerprintReader 
      />
      
      {capturedFingerprint && (
        <div className="captured-result">
          <h3>Captured Fingerprint:</h3>
          <img 
            src={capturedFingerprint} 
            alt="Captured fingerprint" 
            width="200"
          />
        </div>
      )}
      
      <div className="debug-controls">
        <button 
          onClick={() => setShowDebugger(!showDebugger)}
          style={{ marginTop: '20px' }}
        >
          {showDebugger ? 'Hide' : 'Show'} SDK Debugger
        </button>
      </div>
      
      {showDebugger && <FingerprintSdkDebugger />}
    </div>
  );
};

export default FingerPrintApp;
