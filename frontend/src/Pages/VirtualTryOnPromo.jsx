import React from 'react';
import { Link } from 'react-router-dom';
import tryOnVideo from '../assets/Videos/tryon.mp4'; 

const VirtualTryOnPromo = () => {
  return (
    <section className="w-full min-h-screen bg-[#070707] text-white flex items-center justify-center overflow-hidden relative py-24 px-4 sm:px-8 md:px-16 lg:px-24 select-none">

      {/* 1️⃣ BACKGROUND LAYER: ABSOLUTE CINEMATIC BACKPLANE */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        
        {/* 🎯 ULTRA GRADIENT OVERLAYS: Left side par shadow taake text read ho, Right side bilkul clear and crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/60 to-transparent z-10 w-full lg:w-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/80 via-transparent to-[#070707]/30 z-10" />

        {/* Cinematic Background Video: Scaled up and positioned right via object-right */}
        <video
          src={tryOnVideo} 
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/images/western_fallback.jpg" 
          className="w-full h-full object-cover scale-100 object-right lg:object-right transition-all duration-1000 ease-out"
        />
      </div>

      {/* 2️⃣ FOREGROUND LAYER: CRISP GLOWING CONTENT OVERLAY */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 relative z-20 items-center gap-12">
        <div className="col-span-1 lg:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start space-y-6">
          
          {/* AI Badge with Glassmorphic design */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/80 border border-neutral-800/80 rounded-full backdrop-blur-md shadow-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#c5a880] font-mono font-semibold">
              AI Virtual Engine v2.0
            </span>
          </div>

          {/* Luxury Editorial Header Typography */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-neutral-100 leading-[1.15] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            See It On Yourself. <br />
            <span className="italic font-light text-neutral-300 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-500 bg-clip-text text-transparent">Before You Buy.</span>
          </h2>

          {/* Clean Readable Description */}
          <p className="text-neutral-200/90 text-sm md:text-base font-light leading-relaxed max-w-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] text-justify lg:text-left">
            Welcome to the future of retail apparel shopping. Upload your picture, select any outfit, and our smart AI system will instantly project exactly how the clothes look on your body.
          </p>

          {/* Action Call to Button */}
          <div className="pt-6 w-full sm:w-auto">
            <Link to="/virtual-room">
              <button className="w-full sm:w-auto px-12 py-4 bg-black/60 border border-[#c5a880] text-xs tracking-[0.3em] uppercase text-[#c5a880] font-mono font-medium rounded-sm hover:bg-[#c5a880] hover:text-black transition-all duration-500 ease-in-out backdrop-blur-md cursor-pointer relative group overflow-hidden shadow-2xl">
                <span className="relative z-10">Launch Studio Live</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#c5a880]/10 via-transparent to-[#c5a880]/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              </button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VirtualTryOnPromo;