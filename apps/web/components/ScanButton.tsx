"use client";

import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";

export function ScanButton() {
  const handleScan = () => {
    // TODO: Implement bug scanning functionality
    // - Open camera/file picker
    // - Capture or upload image
    // - Process image (AI detection or manual input)
    // - Upload to IPFS via Lighthouse
    // - Prompt user for voting (real/fake)
    // - If approved, mint BUG NFT and distribute tokens
    console.log("Scan button clicked");
  };

  return (
    <Button
      onClick={handleScan}
      size="lg"
      className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      aria-label="Scan Bug"
    >
      <Scan className="h-8 w-8" />
    </Button>
  );
}
