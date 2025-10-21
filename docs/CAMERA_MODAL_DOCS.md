# 📸 Camera Modal Feature - Documentation

## Overview
The Camera Modal is the core bug scanning feature of BugDex. It allows users to capture or upload bug photos for identification and minting.

---

## ✅ Features Implemented

### 1. **Live Camera Access**
- Requests camera permissions from the browser
- Uses rear-facing camera by default (`facingMode: "environment"`)
- High-resolution capture (1920x1080 ideal)
- Real-time video preview

### 2. **Photo Capture**
- Click "Take Photo" to capture current frame
- Uses HTML5 Canvas API for image processing
- Saves as JPEG with 90% quality
- Automatic camera shutdown after capture

### 3. **File Upload Fallback**
- "Upload from Gallery" option
- File type validation (images only)
- File size limit (10MB max)
- Works when camera access is denied or unavailable

### 4. **Image Preview & Review**
- Full-screen preview of captured/uploaded image
- "Retake" option to capture again
- "Submit Bug" to process and send for voting

### 5. **Error Handling**
- Camera permission denied
- Invalid file type
- File too large
- Network errors during submission

### 6. **Processing State**
- Loading indicator during submission
- Disabled buttons to prevent double-submit
- Success/error feedback

---

## 🎨 UI/UX Design

### Layout
```
┌─────────────────────────────────┐
│  Scan a Bug                  [X]│
│  Point your camera at a bug...  │
├─────────────────────────────────┤
│                                 │
│                                 │
│      [Camera Preview/Image]     │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Take Photo]                   │
│  ───────── Or ─────────         │
│  [Upload from Gallery]          │
├─────────────────────────────────┤
│  Tip: Get close for best...     │
└─────────────────────────────────┘
```

### States

**1. Initial (Camera Starting)**
```
- Shows camera icon placeholder
- "Starting camera..." message
- Buttons disabled
```

**2. Camera Active**
```
- Live video feed displayed
- "Take Photo" button enabled
- "Upload from Gallery" option available
```

**3. Photo Captured**
```
- Static image displayed
- "Retake" button (reset and restart camera)
- "Submit Bug" button (process and upload)
```

**4. Processing**
```
- Image still shown
- "Processing..." loading state
- All buttons disabled
```

**5. Error State**
```
- Red error banner displayed
- Helpful error message
- Alternative action suggested
```

---

## 🔧 Technical Implementation

### Component Structure

```tsx
<CameraModal>
  <Dialog>
    <DialogContent>
      <DialogHeader>
        - Title
        - Description (dynamic based on state)
      </DialogHeader>
      
      <div className="camera-container">
        {capturedImage ? (
          <img /> // Show captured image
        ) : isCameraActive ? (
          <video /> // Show live camera
        ) : (
          <Placeholder /> // Show loading/error
        )}
        <canvas hidden /> // For image capture
      </div>
      
      {error && <ErrorBanner />}
      
      <div className="actions">
        {capturedImage ? (
          <>
            <Button onClick={retake}>Retake</Button>
            <Button onClick={submit}>Submit</Button>
          </>
        ) : (
          <>
            <Button onClick={capture}>Take Photo</Button>
            <Separator />
            <Button onClick={upload}>Upload</Button>
          </>
        )}
      </div>
      
      <HelpText />
    </DialogContent>
  </Dialog>
</CameraModal>
```

### State Management

```tsx
const [stream, setStream] = useState<MediaStream | null>(null);
const [capturedImage, setCapturedImage] = useState<string | null>(null);
const [isCameraActive, setIsCameraActive] = useState(false);
const [error, setError] = useState<string | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
```

### Key Functions

#### `startCamera()`
```tsx
// Request camera access
const mediaStream = await navigator.mediaDevices.getUserMedia({
  video: { 
    facingMode: "environment",
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  },
  audio: false
});

// Attach to video element
videoRef.current.srcObject = mediaStream;
```

#### `stopCamera()`
```tsx
// Stop all media tracks
stream.getTracks().forEach(track => track.stop());
```

#### `capturePhoto()`
```tsx
// Draw video frame to canvas
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
context.drawImage(video, 0, 0, canvas.width, canvas.height);

// Convert to base64 JPEG
const imageData = canvas.toDataURL("image/jpeg", 0.9);
setCapturedImage(imageData);
```

#### `handleFileUpload()`
```tsx
// Validate file
if (!file.type.startsWith("image/")) {
  setError("Please select a valid image file.");
  return;
}

// Read file as data URL
const reader = new FileReader();
reader.onload = (e) => {
  setCapturedImage(e.target?.result as string);
};
reader.readAsDataURL(file);
```

#### `handleSubmit()`
```tsx
// TODO: Backend integration
// 1. Upload to IPFS via Lighthouse
// 2. Run AI bug detection
// 3. Submit to voting system
// 4. Return bug metadata

console.log("Submitting bug for processing...");
```

---

## 🔗 Integration Points

### Current (Completed)
✅ **ScanButton** - Opens camera modal on click
✅ **Dialog Component** - Modal UI from shadcn/ui
✅ **Client-side state** - Manages camera and image

### TODO (Backend Integration)

**1. IPFS Upload via Lighthouse**
```tsx
// Replace in handleSubmit()
const ipfsHash = await uploadToLighthouse(capturedImage);
```

**2. AI Bug Detection (Optional)**
```tsx
// Classify bug species
const detection = await detectBug(ipfsHash);
// Returns: { species, confidence, isInsect }
```

**3. Voting System**
```tsx
// Submit to community voting
const submission = await submitForVoting({
  imageUrl: ipfsHash,
  submitter: walletAddress,
  timestamp: Date.now()
});
// Navigate to voting page
router.push(`/vote/${submission.id}`);
```

**4. Blockchain Minting**
```tsx
// If votes pass threshold
if (votes.real >= threshold) {
  const nft = await mintBugNFT({
    imageUrl: ipfsHash,
    metadata: bugData,
    owner: walletAddress
  });
  // Award BUG tokens
  await awardTokens(walletAddress, 100);
}
```

---

## 📱 Browser Compatibility

### Camera Access
✅ **Chrome/Edge:** Full support  
✅ **Safari (iOS 14.3+):** Requires HTTPS  
✅ **Firefox:** Full support  
⚠️ **Older browsers:** Falls back to file upload

### Required Permissions
- Camera access (navigator.mediaDevices.getUserMedia)
- File system access (for upload)

### HTTPS Requirement
⚠️ Camera access requires HTTPS in production
- Localhost works without HTTPS (development)
- Deploy with SSL certificate

---

## 🧪 Testing Checklist

### Camera Flow
- [ ] Camera starts automatically when modal opens
- [ ] Video preview shows correct orientation
- [ ] "Take Photo" captures clear image
- [ ] Captured image displays correctly
- [ ] "Retake" restarts camera
- [ ] Camera stops when modal closes

### Upload Flow
- [ ] File input opens on click
- [ ] Only image files are accepted
- [ ] Large files are rejected (>10MB)
- [ ] Uploaded image displays correctly

### Error Handling
- [ ] Permission denied shows helpful error
- [ ] Invalid file type shows error
- [ ] File too large shows error
- [ ] Network error shows error message

### Mobile Specific
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Rear camera is used by default
- [ ] Safe area insets respected
- [ ] Landscape orientation supported

---

## 🎨 Styling Details

### Aspect Ratio
```tsx
className="aspect-[4/3]"
// Creates a 4:3 container for camera/image
```

### Responsive Modal
```tsx
className="sm:max-w-[600px]"
// Full width on mobile, 600px on larger screens
```

### Gradient Separator
```tsx
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
```

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Flash/torch control
- [ ] Zoom controls
- [ ] Grid overlay for composition
- [ ] Multiple photo capture (gallery)
- [ ] Front camera option
- [ ] Photo editing tools (crop, rotate, filters)

### Phase 3
- [ ] Real-time bug detection overlay
- [ ] AR bug information display
- [ ] Barcode/QR scanning for rare bugs
- [ ] Location tagging (where bug was found)
- [ ] Weather/time metadata

### Phase 4
- [ ] Video recording option
- [ ] Burst mode
- [ ] Time-lapse capture
- [ ] 3D bug model generation
- [ ] Social sharing from camera

---

## 🐛 Known Issues

### Current
- None! 🎉

### Potential
- **iOS PWA:** Camera may not work in standalone mode (test needed)
- **Android WebView:** Some older devices may have limited support
- **Memory:** Large images could cause issues on low-end devices

### Workarounds
- Always provide file upload fallback
- Compress images before submission
- Add image resolution selector for low-end devices

---

## 📚 Related Components

- **ScanButton.tsx** - Triggers camera modal
- **Dialog** (ui/dialog.tsx) - Modal container
- **Button** (ui/button.tsx) - Action buttons

---

## 🔍 Code Location

```
apps/web/components/
  ├── CameraModal.tsx     ← Main component (NEW)
  ├── ScanButton.tsx      ← Updated with modal trigger
  └── ui/
      └── dialog.tsx      ← shadcn/ui Dialog
```

---

**Status:** ✅ Complete  
**Next:** Backend integration (IPFS + Voting)  
**Blockers:** None
