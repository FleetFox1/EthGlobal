"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Bug, Trophy, Heart, Camera } from 'lucide-react';

interface LandingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    icon: Bug,
    title: "Welcome to BugDex",
    description: "The world's first decentralized platform for discovering, documenting, and protecting bugs using blockchain technology.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Camera,
    title: "Discover & Document",
    description: "Take photos of bugs you find in nature. Submit them to our community voting system. Approved discoveries are minted as unique NFTs.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Trophy,
    title: "Earn BUG Tokens",
    description: "Pay just $1 to unlock the faucet. Claim 100 BUG tokens every 24 hours. Use tokens to vote on bug submissions and participate in the ecosystem.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Heart,
    title: "Support Conservation",
    description: "A portion of proceeds goes to bug conservation organizations worldwide. Help protect endangered species and preserve biodiversity.",
    color: "from-orange-500 to-red-600",
  },
];

export default function LandingModal({ isOpen, onClose }: LandingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasSeenModal, setHasSeenModal] = useState(false);

  useEffect(() => {
    // Check if user has seen the modal before
    const seen = localStorage.getItem('bugdex-modal-seen');
    if (seen) {
      setHasSeenModal(true);
    }
  }, []);

  if (!isOpen || hasSeenModal) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('bugdex-modal-seen', 'true');
    setHasSeenModal(true);
    onClose();
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Slide Content */}
        <div className="relative p-8 md:p-12">
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.color} opacity-10`} />

          {/* Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Icon */}
            <div className={`inline-flex p-6 rounded-full bg-gradient-to-br ${currentSlideData.color}`}>
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {currentSlideData.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-300 max-w-lg mx-auto leading-relaxed">
              {currentSlideData.description}
            </p>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2 pt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-white'
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between p-6 bg-gray-950/50 border-t border-gray-800">
          <Button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            variant="ghost"
            className="text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <span className="text-sm text-gray-500">
            {currentSlide + 1} / {slides.length}
          </span>

          <Button
            onClick={handleNext}
            className={`bg-gradient-to-r ${currentSlideData.color} hover:opacity-90`}
          >
            {currentSlide === slides.length - 1 ? (
              'Get Started'
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleClose}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
