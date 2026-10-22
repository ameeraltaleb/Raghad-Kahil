import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { translations } from '../translations';
import { hero2 as hero2Img } from '../config/media';

export default function VideoDemonstration({ lang }) {
  const t = translations[lang].video;
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-16 px-4">
      <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[9/16] bg-brand-dark group cursor-pointer border-4 border-white" onClick={togglePlay}>
        
        {/* Placeholder video - Ideally an actual vertical MP4 goes here */}
        <video 
          ref={videoRef}
          src="https://www.w3schools.com/html/mov_bbb.mp4" 
          poster={hero2Img}
          className="w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
        />

        {/* Overlay Pill Tag */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[85%]">
          <div className="bg-black/40 backdrop-blur-md text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-full text-center border border-white/20 shadow-lg">
            {t.overlay}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-3">
          <button 
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Big Play Button when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
