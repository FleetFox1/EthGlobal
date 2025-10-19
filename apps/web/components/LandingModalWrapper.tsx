"use client";

import { useState, useEffect } from 'react';
import LandingModal from './LandingModal';

export function LandingModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal
    const hasSeenModal = localStorage.getItem('bugdex-modal-seen');
    
    // Open modal after a short delay if not seen before
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500); // 500ms delay for smooth entrance

      return () => clearTimeout(timer);
    }
  }, []);

  return <LandingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
