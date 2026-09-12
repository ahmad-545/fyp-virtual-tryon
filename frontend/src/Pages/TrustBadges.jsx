import React, { useEffect, useRef, useState } from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const badges = [
  {
    icon: Truck,
    title: "Free Delivery",
    subtitle: "On orders above Rs 3,000",
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    icon: RotateCcw,
    title: "7-Day Returns",
    subtitle: "No questions, no restocking fee",
    color: "text-[#C19A6B]",
    bg: "bg-[#C19A6B]/10",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    subtitle: "Sourced through verified channels",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    subtitle: "Real humans, fast replies",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

export default function TrustBadges() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pb-20 pt-4 px-4 sm:px-6 lg:px-12 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#EADBCE]/70 shadow-[0_2px_12px_-3px_rgba(193,154,107,0.05)] hover:shadow-md hover:border-[#C19A6B]/50 transition-all duration-300 group
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                `}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${b.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon size={20} className={b.color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-400 font-light mt-1">
                    {b.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Policy Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
          <Link to="/returnexchange" className="hover:text-[#C19A6B] transition-colors">
            Return & Exchange Policy
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/faqs" className="hover:text-[#C19A6B] transition-colors">
            Frequently Asked Questions
          </Link>
          <span className="text-gray-200">|</span>
          <Link to="/contact" className="hover:text-[#C19A6B] transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
