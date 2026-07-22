import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Timerpics from "../assets/timer.png";

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
    <section className="w-full bg-[#070707] overflow-hidden relative py-16 lg:py-24 border-t border-neutral-900 select-none">
      
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#C19A6B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* 1️⃣ LEFT SIDE: CINEMATIC OFFER PREVIEW IMAGE (Border Removed) */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="w-full max-w-[540px] aspect-[4/5] overflow-hidden bg-transparent p-0 group">
              <img
                src={Timerpics}
                alt="Exclusive Flash Sale Collection Offer"
                className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* 2️⃣ RIGHT SIDE: PREMIUM EDITORIAL CONTENT & COUNTER */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start order-1 lg:order-2 space-y-6">

            {/* Sub-label tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900/80 border border-neutral-800/80 rounded-full">
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

            <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed max-w-xl">
              Upgrade your wardrobe with premium fabrics and modern cuts. Our seasonal clearance event offers unmatched prices on high-end western silhouettes.
            </p>

            {/* ⏳ RE-STYLED PREMIUM GLASSMORPHIC TIMER METRICS */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{days}</h2>
                <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">Days</span>
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{hours}</h2>
                <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">Hours</span>
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-100 group-hover:text-[#C19A6B] transition-colors">{minutes}</h2>
                <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">Mins</span>
              </div>

              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#C19A6B]/40 shadow-xl group">
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-red-400 transition-colors animate-pulse">{seconds}</h2>
                <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">Secs</span>
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

            <p className="text-xs font-mono tracking-wide text-neutral-500 italic pt-2">
              *Guaranteed stock allocation applies only while the countdown matrix remains active.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Timer;