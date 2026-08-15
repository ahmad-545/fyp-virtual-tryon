import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import home1 from "../assets/Videos/timer2.mp4";

function Timer() {
  const initialTime = 7 * 60 * 60; // 7 hours in seconds

  const [leftTime, setLeftTime] = useState(() => {
    const storeTime = localStorage.getItem("remainingTime");
    return storeTime && parseInt(storeTime, 10) > 0
      ? parseInt(storeTime, 10)
      : initialTime;
  });

  // =========================
  // TIMER LOGIC
  // =========================
  useEffect(() => {
    if (leftTime <= 0) return;

    const interval = setInterval(() => {
      setLeftTime((prev) => {
        if (prev <= 1) {
          localStorage.setItem("remainingTime", 0);
          clearInterval(interval);
          return 0;
        }

        const updated = prev - 1;
        localStorage.setItem("remainingTime", updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [leftTime]);

  // =========================
  // FORMAT TIME
  // =========================
  const formatTime = (time) => {
    const days = Math.floor(time / (24 * 3600));
    const hours = Math.floor((time % (24 * 3600)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const { days, hours, minutes, seconds } = formatTime(leftTime);

  return (
    <section className="w-full bg-neutral-900 overflow-hidden relative py-20 lg:py-32 border-t border-neutral-800 select-none">
      
      {/* 🎬 Background Video Layer (Full brightness, minimal tint) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-90"
        >
          <source src={home1} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Very light gradient tint so text remains readable without hiding the video */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-20">
        <div className="max-w-2xl flex flex-col items-start space-y-6 text-left">

          {/* Sub-label tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-950/80 border border-neutral-800/80 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-300 font-mono font-semibold">
              Limited Flash Window
            </span>
          </div>

          {/* Main Header */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-neutral-100 leading-[1.15]">
            Take <span className="text-[#C19A6B] italic font-light">50% Off</span> <br />
            On Selected Luxury Lines
          </h1>

          <p className="text-neutral-200 text-sm md:text-base font-light leading-relaxed max-w-xl">
            Upgrade your wardrobe with premium fabrics and modern cuts. Our seasonal clearance event offers unmatched prices on high-end western silhouettes.
          </p>

          {/* ⏳ RE-STYLED PREMIUM GLASSMORPHIC TIMER METRICS */}
          <div className="flex flex-wrap justify-start gap-4 pt-4">

            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-950/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{days}</h2>
              <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider mt-0.5">Days</span>
            </div>

            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-950/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{hours}</h2>
              <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider mt-0.5">Hours</span>
            </div>

            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-950/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{minutes}</h2>
              <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider mt-0.5">Mins</span>
            </div>

            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-950/60 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-red-400 transition-colors animate-pulse">{seconds}</h2>
              <span className="text-neutral-400 font-mono text-[10px] uppercase tracking-wider mt-0.5">Secs</span>
            </div>

          </div>

          {/* BOUTIQUE CALL TO ACTION BUTTON */}
          <div className="pt-4 w-full sm:w-auto">
            <Link to="/shop">
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-neutral-100 hover:bg-[#C19A6B] text-neutral-950 hover:text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-mono font-medium transition-all duration-500 ease-in-out shadow-2xl hover:shadow-[0_10px_25px_rgba(193,154,107,0.25)] rounded-sm cursor-pointer group">
                <span>Shop The Sale</span>
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          <p className="text-xs font-mono tracking-wide text-neutral-300 italic pt-2">
            *Guaranteed stock allocation applies only while the countdown matrix remains active.
          </p>

        </div>
      </div>
    </section>
  );
}

export default Timer;