"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ImageComparisonProps {
  beforeImage: {
    src: string;
    alt?: string;
  };
  afterImage: {
    src: string;
    alt?: string;
  };
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2";
  showLabels?: boolean;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number; // 0-100, initial slider position percentage
}

export default function ImageComparison({
  beforeImage,
  afterImage,
  className,
  aspectRatio = "16/9",
  showLabels = true,
  beforeLabel = "Before",
  afterLabel = "After",
  initialPosition = 50,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate position based on container width
  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Bind global events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Set styles based on aspect ratio
  const aspectRatioClass = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]",
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted select-none",
        aspectRatioClass,
        className
      )}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Before image (left side) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage.src}
          alt={beforeImage.alt || beforeLabel}
          fill
          className="object-cover"
          priority
        />
        {showLabels && (
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
            {beforeLabel}
          </div>
        )}
      </div>

      {/* After image (right side) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`,
        }}
      >
        <Image
          src={afterImage.src}
          alt={afterImage.alt || afterLabel}
          fill
          className="object-cover"
          priority
        />
        {showLabels && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-medium">
            {afterLabel}
          </div>
        )}
      </div>

      {/* Divider line and drag handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-grab active:cursor-grabbing"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Left and right arrow indicators */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/80 pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </div>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white/80 pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>

      {/* Usage hint */}
      {!isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-md text-xs opacity-80 pointer-events-none">
          Drag the line to compare images
        </div>
      )}
    </div>
  );
}

// Export types for use in other components
export type { ImageComparisonProps };
