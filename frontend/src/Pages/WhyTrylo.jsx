import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Shirt, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Virtual Try-On",
    badge: "Smart 3D Fitting",
    desc: "Preview outfits on your body in real-time before buying. Experience zero guesswork on drape, size, and fit with cutting-edge AI.",
  },
  {
    icon: Shirt,
    title: "Exceptional Fabric & Finish",
    badge: "100% Authentic",
    desc: "Crafted from handpicked, breathable fabrics engineered for supreme comfort. Every seam and stitch is inspected for perfection.",
  },
  {
    icon: Truck,
    title: "Dispatched Within 24 Hours",
    badge: "Fast Delivery",
    desc: "Orders leave our Karachi warehouse the same working day, complete with live courier tracking sent straight to your phone.",
  },
  {
    icon: Headphones,
    title: "Support That Actually Answers",
    badge: "Human Support",
    desc: "A real person replies within minutes, not robotic automated scripts. Connect with us seamlessly via WhatsApp, call, or email.",
  },
];

export default function WhyTrylo() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden"
    >
      {/* Section Header - Trylo Theme */}
      <div className="text-center mb-14 sm:mb-16">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#C19A6B] block mb-2.5">
          WHY TRYLO
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
          Why shop with <span className="text-[#C19A6B] italic">Trylo</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3.5">
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
          <div className="w-2 h-2 rounded-full bg-[#C19A6B]" />
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
        </div>
        <p className="text-sm sm:text-base text-gray-500 font-light mt-3 max-w-md mx-auto">
          The things we will not compromise on
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`group bg-[#FAF8F5] hover:bg-white rounded-2xl p-7 border border-[#EADBCE]/70 hover:border-[#C19A6B]/50 shadow-[0_4px_20px_-4px_rgba(193,154,107,0.06)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div>
                {/* Top: Icon Box & Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#EADBCE] text-[#C19A6B] flex items-center justify-center group-hover:bg-[#C19A6B] group-hover:text-white group-hover:border-[#C19A6B] transition-all duration-300 shadow-sm">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#C19A6B] bg-[#C19A6B]/10 px-2.5 py-1 rounded-full border border-[#C19A6B]/20">
                    {f.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-[18px] font-bold text-gray-900 mb-2.5 tracking-tight group-hover:text-[#a07d50] transition-colors leading-snug">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed font-light">
                  {f.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


