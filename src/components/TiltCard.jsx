import React, { useState, useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '' }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate rotation between -12 and 12 degrees
    const rX = ((mouseY / height) - 0.5) * -24;
    const rY = ((mouseX / width) - 0.5) * 24;
    
    setRotation({ x: rX, y: rY });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{ perspective: '1200px' }}
    >
      <div
        className="w-full h-full transition-transform duration-200 ease-out"
        style={{
          transform: isHovering
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0) rotateY(0) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </div>
    </div>
  );
}
