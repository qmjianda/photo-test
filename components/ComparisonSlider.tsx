
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  original: string;
  generated: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, generated }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = x - rect.left;
    const newPos = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setPosition(newPos);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none border-4 border-white shadow-xl"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Generated Image (Background) */}
      <img 
        src={generated} 
        alt="Reimagined Space"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Original Image (Foreground/Clipped) */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white"
        style={{ width: `${position}%` }}
      >
        <img 
          src={original} 
          alt="Original Space"
          className="absolute top-0 left-0 h-full object-cover"
          style={{ width: `${100 / (position / 100)}%` }} // Maintain scale
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
          Original
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
        AI Reimagined
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-500">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
