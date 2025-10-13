"use client";

import { useState, useRef, useEffect } from "react";
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
import { useWallet } from "@/lib/useWallet";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CameraModal({ open, onOpenChange }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get wallet info
  const { address, isConnected } = useWallet();

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
    if (!isConnected || !address) {
      setError('Please connect your wallet to submit a bug.');
      return;
    }

    // Check if we have location data
    if (!locationData) {
      setError('Location data required. Please enable location access.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("📤 Uploading bug to IPFS...");
      
      // Upload to IPFS
      const ipfsResult = await uploadBugSubmission({
        imageData: capturedImage,
        location: {
          state: locationData.state,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        discoverer: address,
      });

      console.log("✅ Upload complete!");
      console.log("Image CID:", ipfsResult.imageCid);
      console.log("Metadata CID:", ipfsResult.metadataCid);
      console.log("Image URL:", ipfsResult.imageUrl);
      console.log("Metadata URL:", ipfsResult.metadataUrl);

      // TODO: Submit to blockchain contract
      // Call BugVoting.submitBug(metadataCid) here
      
      alert(`Bug uploaded to IPFS!\nImage: ${ipfsResult.imageCid}\nMetadata: ${ipfsResult.metadataCid}\n\n(Next: Submit to blockchain)`);
      
      // Reset and close
      handleClose();
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit bug. Please try again.");
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
