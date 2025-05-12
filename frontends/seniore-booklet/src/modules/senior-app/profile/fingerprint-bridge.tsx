/* eslint-disable prefer-const */
/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Fingerprint, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Result structure for fingerprint capture
export interface FingerprintCaptureResult {
  templateData: string;
  imageData: string;
  quality: number;
}

interface FingerprintBridgeProps {
  mode?: 'register' | 'verify';
  onCapture: (result: FingerprintCaptureResult) => void;
  onCancel: () => void;
  userId?: string | null;
  qualityThreshold?: number;
  onSdkReady?: (sdk: any) => void;
}

export function FingerprintBridge({
  mode = 'register',
  onCapture,
  onCancel,
  qualityThreshold = 40,
  onSdkReady,
}: FingerprintBridgeProps) {
  const [status, setStatus] = useState<
    'initializing' | 'ready' | 'scanning' | 'processing' | 'low_quality' | 'success' | 'error'
  >('initializing');
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0);
  const [captureAttempts, setCaptureAttempts] = useState<number>(0);
  const [devices, setDevices] = useState<string[]>([]);
  const [lastSample, setLastSample] = useState<any>(null);
  const [lastRawData, setLastRawData] = useState<string | null>(null);
  const [lastQualityReport, setLastQualityReport] = useState<any>(null);
  const [sampleFormat, setSampleFormat] = useState<number>((window as any).Fingerprint?.SampleFormat?.PngImage || 5);

  const sdkChannel = useRef<any>(null);
  const isCapturing = useRef<boolean>(false);
  const selectedDevice = useRef<string>('DigitalPersona 4500');
  const latestQuality = useRef<number>(80);

  // Clean and validate base64 string
  const cleanBase64 = (data: string): string => {
    // Remove JSON escapes, non-printable chars, and SDK artifacts
    let cleaned = data
      .replace(/\\+\//g, '/') // Fix escaped slashes
      .replace(/\\+/g, '') // Remove other escapes
      .replace(/\\"/g, '') // Remove JSON escaped quotes
      .replace(/[\x00-\x1F\x7F-\xFF]/g, '') // Remove non-printable chars
      .replace(/[^A-Za-z0-9+/=]/g, '') // Remove remaining invalid chars
      .replace(/^(?:[^{A-Za-z0-9+/=]+)?/, '') // Remove leading garbage
      .replace(/[^{A-Za-z0-9+/=]+$/g, ''); // Remove trailing garbage
    // Fix padding
    const remainder = cleaned.length % 4;
    if (remainder) {
      cleaned += '='.repeat(4 - remainder);
    }
    return cleaned;
  };

  // Find invalid base64 characters
  const findInvalidBase64Chars = (data: string): string => {
    const invalid: { index: number; char: string; code: number }[] = [];
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      if (!/[A-Za-z0-9+/=]/.test(char)) {
        invalid.push({ index: i, char, code: char.charCodeAt(0) });
      }
    }
    return invalid.length > 0
      ? `Found ${invalid.length} invalid characters: ` + JSON.stringify(invalid, null, 2)
      : "No invalid characters found";
  };

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  };

  console.log(arrayBufferToBase64)

  // Validate base64 string
  const isValidBase64 = (data: string): boolean => {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(data)) {
      console.error("Base64 regex validation failed:", findInvalidBase64Chars(data));
      return false;
    }
    if (data.length % 4 !== 0) {
      console.error("Invalid base64 length:", data.length);
      return false;
    }
    try {
      atob(data);
      return true;
    } catch (e) {
      console.error("Base64 decoding failed:", e, "Data (first 100 chars):", data.substring(0, 100) + "...", "Data (last 100 chars):", data.substring(data.length - 100));
      console.error("Invalid characters:", findInvalidBase64Chars(data));
      return false;
    }
  };

  // Recursively extract data from nested objects
  const extractDataFromObject = (obj: any): string | null => {
    if (typeof obj === 'string') {
      return obj;
    }
    
    if (obj && typeof obj === 'object') {
      // Check for Data property (capital D)
      if (obj.Data) {
        return extractDataFromObject(obj.Data);
      }
      // Check for data property (lowercase d)
      if (obj.data) {
        return extractDataFromObject(obj.data);
      }
      // Check for Compression and Data combination
      if (obj.Compression !== undefined && obj.Data) {
        return extractDataFromObject(obj.Data);
      }
      // Check for array with nested objects
      if (Array.isArray(obj) && obj.length > 0) {
        return extractDataFromObject(obj[0]);
      }
    }
    
    return null;
  };

  useEffect(() => {
    const initializeFingerprint = async () => {
      try {
        console.log("Initializing Fingerprint SDK...");

        if (!(window as any).Fingerprint || !(window as any).Fingerprint.WebApi) {
          throw new Error("Fingerprint SDK not loaded. Ensure fingerprint.sdk.min.js is included.");
        }

        const channel = new (window as any).Fingerprint.WebApi();
        sdkChannel.current = channel;

        console.log("SDK methods:", Object.keys(channel), Object.getOwnPropertyNames(Object.getPrototypeOf(channel)));

        channel.onDeviceConnected = (device: any) => {
          console.log("Device connected:", device);
          setDevices(prev => [...new Set([...prev, device.DeviceID || device])]);
        };

        channel.onDeviceDisconnected = (device: any) => {
          console.log("Device disconnected:", device);
          setError("Fingerprint scanner disconnected");
          setStatus('error');
          setDevices(prev => prev.filter(d => d !== (device.DeviceID || device)));
        };

        channel.onQualityReported = (qualityReport: any) => {
          console.log("Quality reported:", JSON.stringify(qualityReport, null, 2));
          setLastQualityReport(qualityReport);
          const qualityScore = qualityReport.Quality !== undefined
            ? ((window as any).Fingerprint.QualityCode[qualityReport.Quality] === 0 ? 90 : 50)
            : qualityReport.quality || 80;
          latestQuality.current = qualityScore;
        };

        channel.onSamplesAcquired = (samples: any) => {
          console.log("Samples acquired:", JSON.stringify(samples, null, 2));
          setLastSample(samples);
          if (!isCapturing.current) return;

          try {
            if (!samples || typeof samples.samples !== 'string') {
              throw new Error("Invalid samples data: expected a JSON string");
            }

            let parsedSamples: any[];
            try {
              parsedSamples = JSON.parse(samples.samples);
            } catch (e) {
              throw new Error("Failed to parse samples JSON: " + (e instanceof Error ? e.message : String(e)));
            }

            if (!Array.isArray(parsedSamples) || parsedSamples.length === 0) {
              throw new Error("No sample data in parsed array");
            }

            let rawData = parsedSamples[0];
            let templateData: string;
            let imageData: string;

            console.log("Raw data type:", typeof rawData);
            console.log("Raw data structure:", JSON.stringify(rawData, null, 2));

            // Extract data from nested object structure
            const extractedData = extractDataFromObject(rawData);
            
            if (extractedData) {
              templateData = extractedData;
              console.log("Extracted template data (first 100 chars):", templateData.substring(0, 100) + "...");
              setLastRawData(templateData);

              // If the extracted data is base64, use it directly
              if (isValidBase64(templateData)) {
                imageData = `data:application/octet-stream;base64,${templateData}`;
              } else {
                // Try cleaning the data
                const cleanedData = cleanBase64(templateData);
                if (isValidBase64(cleanedData)) {
                  templateData = cleanedData;
                  imageData = `data:application/octet-stream;base64,${cleanedData}`;
                } else {
                  // If not valid base64, encode it
                  imageData = `data:application/octet-stream;base64,${btoa(templateData)}`;
                }
              }
            } else {
              // If no data could be extracted, stringify the whole object
              templateData = JSON.stringify(rawData);
              imageData = `data:application/octet-stream;base64,${btoa(templateData)}`;
              console.warn("Could not extract data from object, using stringified version");
            }

            console.log("Final templateData (first 50 chars):", templateData.substring(0, 50) + "...");
            const qualityScore = latestQuality.current;

            setImageData(imageData);
            setQuality(qualityScore);
            setStatus('processing');

            if (qualityScore < qualityThreshold) {
              console.log(`Low quality scan: ${qualityScore}/${qualityThreshold}`);
              setStatus('low_quality');
              setCaptureAttempts(prev => prev + 1);
              isCapturing.current = false;
              channel.stopAcquisition();
              return;
            }

            isCapturing.current = false;
            channel.stopAcquisition();
            setStatus('success');

            onCapture({
              templateData,
              imageData,
              quality: qualityScore,
            });
          } catch (err) {
            console.error("Error processing samples:", err, "Sample data:", JSON.stringify(samples, null, 2));
            setError(`Failed to process fingerprint: ${err instanceof Error ? err.message : String(err)}`);
            setStatus('error');
            isCapturing.current = false;
            channel.stopAcquisition();
            if (captureAttempts < 3) {
              setTimeout(retryCapture, 1000);
            }
          }
        };

        channel.onErrorOccurred = (error: any) => {
          console.error("SDK error:", error);
          setError(`Scanner error: ${error?.message || JSON.stringify(error) || 'Unknown error'}`);
          setStatus('error');
          isCapturing.current = false;
        };

        onSdkReady?.(channel);

        if (channel.initialize) {
          await channel.initialize();
          console.log("Channel initialized successfully");
        }

        if (channel.enumerateDevices) {
          const deviceList = await channel.enumerateDevices();
          console.log("Enumerated devices:", deviceList);
          if (deviceList && deviceList.length > 0) {
            setDevices(deviceList.map((d: any) => d.DeviceID || d));
            selectedDevice.current = deviceList[0].DeviceID || deviceList[0];
            setStatus('ready');
          } else {
            setError("No fingerprint scanners detected. Please connect a DigitalPersona 4500.");
            setStatus('error');
          }
        } else {
          console.warn("No enumerateDevices method; assuming default device");
          setStatus('ready');
        }
      } catch (err) {
        console.error("Failed to initialize fingerprint SDK:", err);
        setError(`Failed to initialize scanner: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('error');
      }
    };

    initializeFingerprint();

    return () => {
      if (sdkChannel.current) {
        if (sdkChannel.current.stopAcquisition) {
          sdkChannel.current.stopAcquisition();
        }
        if (sdkChannel.current.dispose) {
          sdkChannel.current.dispose();
        }
      }
    };
  }, [onSdkReady, onCapture, qualityThreshold]);

  const debugSdk = () => {
    console.log("SDK Debug Info:");
    console.log("SDK channel:", sdkChannel.current);
    console.log("Methods:", sdkChannel.current ? Object.keys(sdkChannel.current) : "N/A");
    console.log("Prototype methods:", sdkChannel.current ? Object.getOwnPropertyNames(Object.getPrototypeOf(sdkChannel.current)) : "N/A");
    console.log("Devices:", devices);
    console.log("Selected device:", selectedDevice.current);
    console.log("Status:", status);
    console.log("Is capturing:", isCapturing.current);
    console.log("Current sample format:", sampleFormat);
    console.log("Last sample:", JSON.stringify(lastSample, null, 2));
    console.log("Last raw data length:", lastRawData ? lastRawData.length : "N/A");
    console.log("Last raw data (first 100 chars):", lastRawData ? lastRawData.substring(0, 100) + "..." : "N/A");
    console.log("Last raw data (last 100 chars):", lastRawData ? lastRawData.substring(lastRawData.length - 100) : "N/A");
    console.log("Last raw data invalid chars:", lastRawData ? findInvalidBase64Chars(lastRawData) : "N/A");
    console.log("Last cleaned data (first 100 chars):", lastRawData ? cleanBase64(lastRawData).substring(0, 100) + "..." : "N/A");
    console.log("Last quality report:", JSON.stringify(lastQualityReport, null, 2));
  };

  const startCapturing = () => {
    if (sdkChannel.current && selectedDevice.current) {
      setStatus('scanning');
      isCapturing.current = true;
      console.log(`Starting capture on device: ${selectedDevice.current} with format: ${sampleFormat}`);
      try {
        // Use the Raw format (which seems to be 1 based on your data)
        sdkChannel.current.startAcquisition(1, selectedDevice.current);
        setSampleFormat(1);
      } catch (err) {
        console.error("Error starting capture:", err);
        setError(`Failed to start capture: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('error');
        isCapturing.current = false;
      }
    } else {
      setError("No scanner available. Please connect a device and retry.");
      setStatus('error');
    }
  };

  const stopCapturing = () => {
    if (sdkChannel.current) {
      console.log("Stopping capture...");
      isCapturing.current = false;
      try {
        sdkChannel.current.stopAcquisition();
      } catch (err) {
        console.error("Error stopping capture:", err);
      }
      setStatus('ready');
    }
  };

  const retryCapture = () => {
    setImageData(null);
    setQuality(0);
    setCaptureAttempts(prev => prev + 1);
    startCapturing();
  };

  const handleRetryInitialization = () => {
    setError(null);
    setStatus('initializing');
    if ((window as any).Fingerprint && (window as any).Fingerprint.WebApi) {
      try {
        const channel = new (window as any).Fingerprint.WebApi();
        sdkChannel.current = channel;
        channel.enumerateDevices().then((deviceList: any) => {
          if (deviceList && deviceList.length > 0) {
            setDevices(deviceList.map((d: any) => d.DeviceID || d));
            selectedDevice.current = deviceList[0].DeviceID || deviceList[0];
            setStatus('ready');
          } else {
            setError("No fingerprint scanners detected.");
            setStatus('error');
          }
        }).catch((err: any) => {
          console.error("Error enumerating devices:", err);
          setError(`Failed to detect devices: ${err.message || String(err)}`);
          setStatus('error');
        });
      } catch (err) {
        console.error("Failed to reinitialize SDK:", err);
        setError(`Failed to reinitialize: ${err instanceof Error ? err.message : String(err)}`);
        setStatus('error');
      }
    } else {
      setError("Fingerprint SDK not found.");
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'initializing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-24 w-24 text-primary animate-spin" />
            <h3 className="text-xl font-semibold">Initializing Fingerprint Scanner</h3>
            <p className="text-muted-foreground">
              Please wait while we connect to your fingerprint scanner...
            </p>
          </div>
        );

      case 'ready':
        return (
          <div className="text-center space-y-4">
            <Fingerprint className="mx-auto h-24 w-24 text-primary" />
            <h3 className="text-xl font-semibold">
              {mode === 'register' ? 'Register Your Fingerprint' : 'Verify Your Fingerprint'}
            </h3>
            <p className="text-muted-foreground">
              {mode === 'register'
                ? 'Place your finger firmly on the scanner to register your fingerprint.'
                : 'Place your finger firmly on the scanner to verify your identity.'}
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={startCapturing}>Start Scanning</Button>
              <Button variant="outline" onClick={debugSdk}>Debug SDK</Button>
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="text-center space-y-4">
            <div className="relative mx-auto h-24 w-24">
              <Fingerprint className="absolute h-24 w-24 text-primary animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-36 w-36 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold">Scanning Fingerprint</h3>
            <p className="text-muted-foreground">
              Keep your finger steady on the scanner...
            </p>
            <Button variant="outline" onClick={stopCapturing}>
              Cancel Scan
            </Button>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-24 w-24 text-blue-500 animate-spin" />
            <h3 className="text-xl font-semibold">Processing Fingerprint</h3>
            <p className="text-muted-foreground">
              Extracting biometric template from scan...
            </p>
          </div>
        );

      case 'low_quality':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-lg border-2 border-amber-500 bg-gray-100 relative">
              {imageData && (
                <img src={imageData} alt="Low quality fingerprint" className="h-full w-full object-contain" 
                  onError={() => {
                    // If image fails to load, show placeholder
                    setImageData(null);
                  }}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-amber-100 p-1 text-amber-800 text-sm">
                Quality: {quality}/100
              </div>
            </div>
            <h3 className="text-xl font-semibold text-amber-500">Low Quality Scan</h3>
            <div className="text-muted-foreground space-y-2">
              <p>The fingerprint quality is too low ({quality}/100).</p>
              {captureAttempts > 2 && (
                <p className="text-sm">
                  Tips: Clean the scanner and your finger, then press firmly.
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={retryCapture} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-lg border-2 border-green-500 bg-gray-100 relative">
              {imageData && (
                <img src={imageData} alt="Captured fingerprint" className="h-full w-full object-contain"
                  onError={() => {
                    // If image fails to load, show success without image
                    setImageData(null);
                  }}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-green-100 p-1 text-green-800 text-sm">
                Quality: {quality}/100
              </div>
            </div>
            <h3 className="text-xl font-semibold text-green-600">Fingerprint Captured!</h3>
            <p className="text-muted-foreground">
              {mode === 'register'
                ? 'Your fingerprint has been successfully captured for registration.'
                : 'Your fingerprint has been captured and is being verified...'}
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <XCircle className="mx-auto h-24 w-24 text-destructive" />
            <h3 className="text-xl font-semibold text-destructive">Scanner Error</h3>
            <p className="text-muted-foreground">
              {error || "There was an error with the fingerprint scanner. Please try again."}
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleRetryInitialization}>
                Retry Connection
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={onCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
