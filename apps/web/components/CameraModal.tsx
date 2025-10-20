"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, X, RotateCw, Check, MapPin } from "lucide-react";
import { getUserLocation, checkGeolocationPermission, type LocationData } from "@/lib/geolocation";
import { uploadBugSubmission } from "@/lib/ipfs-client";
import { useUser } from "@/lib/useUser";
import { ethers } from "ethers";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CameraModal({ open, onOpenChange }: CameraModalProps) {
  const router = useRouter();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get wallet info from useUser
  const { walletAddress, isAuthenticated } = useUser();

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions or use file upload.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Get user's location
  const getLocation = async () => {
    setIsGettingLocation(true);
    setError(null);

    try {
      const location = await getUserLocation();
      setLocationData(location);
      setLocationPermission('granted');
      console.log('Location obtained:', location);
    } catch (err: any) {
      console.error('Location error:', err);
      setError(err.message || 'Failed to get location');
      setLocationPermission('denied');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Check location permission on mount
  useEffect(() => {
    if (open) {
      checkGeolocationPermission().then(setLocationPermission);
    }
  }, [open]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit bug for processing
  const handleSubmit = async () => {
    if (!capturedImage) return;

    // Check if wallet is connected
    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to submit a bug.');
      return;
    }

    // Check if we have location data
    if (!locationData) {
      setError('Location data required. Please enable location access.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Step 1: Upload to IPFS (0-33%)
      setCurrentStep('Uploading image to IPFS...');
      setUploadProgress(10);
      
      console.log("📤 Step 1: Uploading bug to IPFS...");
      
      const ipfsResult = await uploadBugSubmission({
        imageData: capturedImage,
        location: {
          state: locationData.state,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        discoverer: walletAddress,
      });

      setUploadProgress(33);
      console.log("✅ IPFS Upload complete!");
      console.log("Image CID:", ipfsResult.imageCid);
      console.log("Metadata CID:", ipfsResult.metadataCid);

      // Step 2: Identify the bug using AI (33-66%)
      setCurrentStep('Identifying bug with AI...');
      setUploadProgress(40);
      
      console.log("🤖 Step 2: Identifying bug with AI...");
      console.log("Image URL for AI:", ipfsResult.imageUrl);
      
      let bugInfo = null;
      
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const identifyResponse = await fetch('/api/identify-bug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: ipfsResult.imageUrl,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!identifyResponse.ok) {
          console.warn("⚠️ AI API returned error status:", identifyResponse.status);
          throw new Error(`AI API error: ${identifyResponse.status}`);
        }

        const identifyData = await identifyResponse.json();
        console.log("AI Response:", identifyData);

        if (identifyData.success && identifyData.bug) {
          bugInfo = identifyData.bug;
          console.log("✅ Bug identified:", bugInfo.commonName, "-", bugInfo.scientificName);
        } else {
          console.warn("⚠️ AI identification failed:", identifyData.error || identifyData.details || "Unknown error");
        }
      } catch (aiError: any) {
        if (aiError.name === 'AbortError') {
          console.warn("⚠️ AI identification timed out after 30 seconds");
        } else {
          console.warn("⚠️ AI identification error:", aiError.message);
        }
        // Continue without AI identification
        bugInfo = null;
      }
      
      setUploadProgress(66);

      // Step 3: Save to user's collection (66-100%)
      setCurrentStep('Saving to your collection...');
      setUploadProgress(75);
      
      const saveResponse = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageCid: ipfsResult.imageCid,
          metadataCid: ipfsResult.metadataCid,
          imageUrl: ipfsResult.imageUrl,
          metadataUrl: ipfsResult.metadataUrl,
          discoverer: walletAddress,
          location: locationData,
          bugInfo: bugInfo, // Include AI identification data
        }),
      });

      const saveData = await saveResponse.json();
      
      if (saveData.success) {
        console.log('✅ Saved to collection:', saveData.data.upload.id);
      }

      setUploadProgress(100);
      setCurrentStep('Complete!');

      // Show success message with next steps
      const bugName = bugInfo ? bugInfo.commonName : 'Unknown Bug';
      const successMessage = bugInfo 
        ? `✅ Bug identified as ${bugName}!\n\n📱 Saved to your collection (off-chain)\n\n💡 Want to earn rewards?\nSubmit to voting to mint an NFT and earn BUG tokens!\n(Requires 10 BUG tokens to stake)`
        : `✅ Bug uploaded successfully!\n\n📱 Saved to your collection (off-chain)\n\n💡 Want to earn rewards?\nSubmit to voting to mint an NFT and earn BUG tokens!\n(Requires 10 BUG tokens to stake)`;
      
      const shouldSubmit = confirm(successMessage + '\n\nGo to your collection now?');
      
      // Reset and close modal first
      handleClose();
      
      if (shouldSubmit) {
        // Redirect to collection page after a short delay to ensure modal is closed
        setTimeout(() => {
          router.push('/collection');
        }, 300);
      }
    } catch (err: any) {
      console.error("❌ Submission error:", err);
      setError(err.message || "Failed to submit bug. Please try again.");
      setUploadProgress(0);
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  };

  // Close modal and cleanup
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    setIsProcessing(false);
    setUploadProgress(0);
    setCurrentStep('');
    setLocationData(null);
    setIsGettingLocation(false);
    onOpenChange(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-start camera when modal opens
  useEffect(() => {
    if (open && !capturedImage && !isCameraActive) {
      startCamera();
    }
    // Also request location when modal opens
    if (open && !locationData && locationPermission !== 'denied') {
      getLocation();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Scan a Bug</DialogTitle>
          <DialogDescription>
            {capturedImage
              ? "Review your photo and submit for identification"
              : "Point your camera at a bug or upload a photo"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Camera/Image Display Area */}
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
            {capturedImage ? (
              // Show captured image
              <img
                src={capturedImage}
                alt="Captured bug"
                className="w-full h-full object-cover"
              />
            ) : isCameraActive ? (
              // Show live camera feed
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              // Show placeholder
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {error || "Starting camera..."}
                  </p>
                </div>
              </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          {/* Progress Bar - Show when processing */}
          {isProcessing && (
            <div className="mb-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentStep}</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-background rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              
              {/* Progress Steps */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${uploadProgress >= 40 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {uploadProgress >= 40 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2" />}
                  <span>IPFS Upload</span>
                </div>
                <div className={`flex items-center gap-1 ${uploadProgress >= 70 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {uploadProgress >= 70 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2" />}
                  <span>AI Identify</span>
                </div>
                <div className={`flex items-center gap-1 ${uploadProgress >= 100 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {uploadProgress >= 100 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border-2" />}
                  <span>Save</span>
                </div>
              </div>
            </div>
          )}

          {/* Location Status */}
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {locationData 
                    ? `Location: ${locationData.state}, ${locationData.country}`
                    : 'Location Required'
                  }
                </span>
              </div>
              {!locationData && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? 'Getting...' : 'Enable'}
                </Button>
              )}
              {locationData && (
                <span className="text-xs text-green-500">✓ Verified</span>
              )}
            </div>
            {locationPermission === 'denied' && !locationData && (
              <p className="text-xs text-muted-foreground mt-2">
                Location access is required to submit bugs. Please enable in your browser settings.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {capturedImage ? (
              // After capture: Retake or Submit
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRetake}
                  disabled={isProcessing}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit Bug
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Before capture: Take Photo or Upload
              <>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload from Gallery
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            {capturedImage
              ? "Your bug will be submitted to the community for voting"
              : "Tip: Get close to the bug for the best photo quality"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
