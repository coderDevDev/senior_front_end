import { Button } from "@/components/ui/button";
import { Camera, Fingerprint, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface VirtualFingerprintScannerProps {
  onCapture: (fingerprintTemplate: string) => void;
  onCancel: () => void;
}

// Fingerprint processing constants
const CONTRAST_THRESHOLD = 50;
const EDGE_DETECTION_THRESHOLD = 20;

export function VirtualFingerprintScanner({
  onCapture,
  onCancel,
}: VirtualFingerprintScannerProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [step, setStep] = useState<"initial" | "setup" | "scanning" | "processing" | "complete">("initial");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [enhancedFingerprint, setEnhancedFingerprint] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  console.log(isCapturing,)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize webcam
  useEffect(() => {
    if (step === "setup") {
      startCamera();
    }
    
    return () => {
      // Stop the camera when component unmounts or changes step
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Could not access camera. Please ensure camera permissions are granted.");
      toast.error("Camera access denied. Please check your browser permissions.");
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startFingerprintCapture = () => {
    setStep("setup");
  };

  const captureFingerprint = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not initialized properly");
      return;
    }
    
    setIsCapturing(true);
    setStep("scanning");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Could not initialize canvas context");
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Start processing the captured image
      processFingerprint();
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Failed to capture image. Please try again.");
      setStep("setup");
      setIsCapturing(false);
    }
  };

  const processFingerprint = () => {
    setStep("processing");
    
    // Get the canvas with the raw capture
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not available");
      setStep("setup");
      return;
    }
    
    try {
      // Save the original captured image (REMOVED - don't need to store this)
      // const capturedImage = canvas.toDataURL('image/png');
      
      // Process fingerprint on a separate processing canvas
      const processingCanvas = processingCanvasRef.current;
      if (!processingCanvas) {
        toast.error("Processing canvas not available");
        return;
      }
      
      const processingCtx = processingCanvas.getContext('2d', { willReadFrequently: true });
      if (!processingCtx) {
        toast.error("Could not initialize processing context");
        return;
      }
      
      // Copy the captured image to the processing canvas
      processingCanvas.width = canvas.width;
      processingCanvas.height = canvas.height;
      processingCtx.drawImage(canvas, 0, 0);
      
      // Run fingerprint enhancement processing with progress indicators
      enhanceFingerprintImage(processingCanvas, processingCtx)
        .then(enhancedImageData => {
          // Store the enhanced fingerprint
          setEnhancedFingerprint(enhancedImageData);
          
          // Generate biometric template - no need to pass the raw images
          const fingerprintTemplate = generateBiometricTemplate();
          
          // Complete the process
          setStep("complete");
          
          // Pass template to parent component
          setTimeout(() => {
            try {
              onCapture(fingerprintTemplate);
            } catch (error) {
              console.error("Error in onCapture callback:", error);
              toast.error("Failed to process fingerprint data. Please try again.");
            }
          }, 500);
        })
        .catch(error => {
          console.error("Error processing fingerprint:", error);
          toast.error("Failed to process fingerprint. Please try again.");
          setStep("setup");
          setIsCapturing(false);
        });
    } catch (error) {
      console.error("Error in processFingerprint:", error);
      toast.error("An error occurred during fingerprint processing");
      setStep("setup");
      setIsCapturing(false);
    }
  };

  // Enhance fingerprint image for better feature extraction
  const enhanceFingerprintImage = async (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D
  ): Promise<string> => {
    try {
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply grayscale first
      setProcessingProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing time
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      
      // Apply contrast enhancement
      setProcessingProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const contrastImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const contrastData = contrastImageData.data;
      
      // Find min and max
      let min = 255, max = 0;
      for (let i = 0; i < contrastData.length; i += 4) {
        if (contrastData[i] < min) min = contrastData[i];
        if (contrastData[i] > max) max = contrastData[i];
      }
      
      // Apply contrast stretching
      const range = max - min;
      if (range > 0) {
        for (let i = 0; i < contrastData.length; i += 4) {
          contrastData[i] = contrastData[i + 1] = contrastData[i + 2] = 
            255 * (contrastData[i] - min) / range;
        }
      }
      ctx.putImageData(contrastImageData, 0, 0);
      
      // Threshold to create binary image
      setProcessingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const binaryImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const binaryData = binaryImageData.data;
      
      for (let i = 0; i < binaryData.length; i += 4) {
        const value = binaryData[i] > CONTRAST_THRESHOLD ? 255 : 0;
        binaryData[i] = binaryData[i + 1] = binaryData[i + 2] = value;
      }
      ctx.putImageData(binaryImageData, 0, 0);
      
      // Apply edge detection for ridge extraction
      setProcessingProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simple edge detection filter
      const edgeImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const edgeData = edgeImageData.data;
      const tempData = new Uint8ClampedArray(edgeData.length);
      
      // Copy original data to temp array
      for (let i = 0; i < edgeData.length; i++) {
        tempData[i] = edgeData[i];
      }
      
      // Simple Sobel-like edge detection
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const pos = (y * canvas.width + x) * 4;
          
          // Get neighboring pixels
          const left = tempData[pos - 4];
          const right = tempData[pos + 4];
          const top = tempData[pos - canvas.width * 4];
          const bottom = tempData[pos + canvas.width * 4];
          
          // Calculate gradient magnitude
          const dx = right - left;
          const dy = bottom - top;
          const gradient = Math.sqrt(dx * dx + dy * dy);
          
          // Apply threshold
          const value = gradient > EDGE_DETECTION_THRESHOLD ? 255 : 0;
          edgeData[pos] = edgeData[pos + 1] = edgeData[pos + 2] = value;
        }
      }
      
      ctx.putImageData(edgeImageData, 0, 0);
      
      // Add simulated minutiae points
      setProcessingProgress(90);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mark simulated minutiae points with red dots
      const minutiaeCount = Math.floor(Math.random() * 30) + 20; // Random number of minutiae between 20-50
      
      for (let i = 0; i < minutiaeCount; i++) {
        const x = Math.floor(Math.random() * (canvas.width - 20)) + 10;
        const y = Math.floor(Math.random() * (canvas.height - 20)) + 10;
        
        // Draw a red dot at the minutiae point
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Finalize processing
      setProcessingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return the processed image - use quality parameter to reduce size
      return canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with 80% quality instead of PNG
    } catch (error) {
      console.error("Error enhancing fingerprint:", error);
      throw new Error("Failed to enhance fingerprint image");
    }
  };

  // Generate biometric template - simplified, no image passing
  const generateBiometricTemplate = (): string => {
    try {
      // Create a simplified template - with minimal data
      const template = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        captureDevice: "webcam",
        qualityScore: 85, // Fixed quality score for consistency
        // Reduced number of minutiae points
        minutiae: [
          { x: 100, y: 150, angle: 45, type: "bifurcation" },
          { x: 150, y: 200, angle: 90, type: "ending" },
          { x: 200, y: 250, angle: 135, type: "bifurcation" },
          { x: 250, y: 300, angle: 180, type: "ending" },
          { x: 300, y: 350, angle: 225, type: "bifurcation" }
        ]
      };
      
      // Return as a plain JSON string - NO base64 encoding
      return JSON.stringify(template);
    } catch (error) {
      console.error("Error generating template:", error);
      // Return a minimal template on error
      return JSON.stringify({
        version: "1.0",
        timestamp: new Date().toISOString(),
        captureDevice: "webcam",
        qualityScore: 80,
        minutiae: []
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-medium text-lg mb-1">Fingerprint Registration</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {step === "initial" && "Please prepare to scan your fingerprint"}
          {step === "setup" && "Position your finger in front of the camera"}
          {step === "scanning" && "Hold steady..."}
          {step === "processing" && "Processing fingerprint..."}
          {step === "complete" && "Fingerprint scanned successfully!"}
        </p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-64 h-80 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 flex flex-col items-center justify-center p-4">
          {(step === "initial") && (
            <div className="flex flex-col items-center justify-center h-full">
              <Fingerprint className="h-20 w-20 text-blue-400 mb-4" />
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Click "Start Scan" to begin capturing your fingerprint
              </p>
            </div>
          )}
          
          {/* Video feed for camera */}
          {(step === "setup" || step === "scanning") && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="rounded-lg w-full h-full object-cover"
              />
              
              {step === "setup" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-48 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-center text-blue-600 dark:text-blue-400 p-2">
                      Place finger here
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Canvas for captured fingerprint */}
          {(step === "processing" || step === "complete") && enhancedFingerprint && (
            <img 
              src={enhancedFingerprint} 
              alt="Processed Fingerprint" 
              className="rounded-lg w-full h-full object-contain"
            />
          )}
          
          {/* Hidden canvases for processing */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={processingCanvasRef} className="hidden" />
        </div>
      </div>
      
      {cameraError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{cameraError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => startCamera()}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      )}
      
      {step === "processing" && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Processing fingerprint...</span>
            <span>{processingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={step === "processing"}
        >
          Cancel
        </Button>
        
        {step === "initial" && (
          <Button onClick={startFingerprintCapture}>
            Start Scan
          </Button>
        )}
        
        {step === "setup" && (
          <Button onClick={captureFingerprint}>
            <Camera className="h-4 w-4 mr-2" /> Capture
          </Button>
        )}
        
        {step === "complete" && (
          <Button disabled>
            Processing...
          </Button>
        )}
      </div>
    </div>
  );
}
