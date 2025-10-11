"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { CameraModal } from "@/components/CameraModal";

export function ScanButton() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleScan = () => {
    setIsCameraOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleScan}
        size="lg"
        className="h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        aria-label="Scan Bug"
      >
        <Scan className="h-8 w-8" />
      </Button>

      <CameraModal open={isCameraOpen} onOpenChange={setIsCameraOpen} />
    </>
  );
}
