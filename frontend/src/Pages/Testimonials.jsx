import React, { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ayesha Siddiqui",
    role: "Fashion Blogger · Karachi",
    initials: "AS",
    rating: 5,
    comment:
      "Ordered on a Tuesday afternoon and had the parcel on Thursday morning. The packaging was sealed, the stitching was perfect, and the fabric quality was exactly as shown on the model.",
  },
  {
    name: "Daniyal Qureshi",
    role: "Photographer · Lahore",
    initials: "DQ",
    rating: 5,
    comment:
      "I asked three questions before ordering and got three straight answers from someone who had clearly handled the product. That is rare. Bought two pieces and kept both.",
  },
  {
    name: "Fatima Noor",
    role: "Software Engineer · Islamabad",
    initials: "FN",
    rating: 5,
    comment:
      "The return was genuinely painless. Requested it on the site, courier collected the next day, refund landed within three days without having to follow up.",
  },
  {
    name: "Hassan Rizvi",
    role: "Creative Director · Karachi",
    initials: "HR",
    rating: 5,
    comment:
      "We buy outfits for our entire shoot crew here now. Invoices are proper, fabric quality is consistent, and nothing has ever turned out to be misdescribed. Trylo is our go-to.",
  },
  {
    name: "Sana Mehmood",
    role: "Interior Designer · Rawalpindi",
    initials: "SM",
    rating: 5,
    comment:
      "Bought the linen collection and the formal coat. Both are exactly as described — no overselling, true to size charts, which is why I came back and ordered three more pieces.",
  },
  {
    name: "Bilal Akram",
    role: "Consultant · Multan",
    initials: "BA",
    rating: 5,
    comment:
      "Virtual Try-On is unbelievably accurate. I was skeptical at first, but the shoulder drop and length matched the 3D preview to the centimeter. Zero regrets.",
  },
];

function StarRating({ count = 5 }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className="fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-[#fafafa] overflow-hidden"
    >
      {/* Header */}
      <div className="text-center mb-14 sm:mb-16">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2.5">
          CUSTOMER STORIES
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
          What our customers <span className="text-[#C19A6B] italic">say</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3.5">
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
          <div className="w-2 h-2 rounded-full bg-[#C19A6B]" />
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
        </div>
        <p className="text-sm sm:text-base text-gray-500 font-light mt-3 max-w-md mx-auto">
          Unedited, from real orders
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`group bg-white rounded-2xl p-7 border border-[#EADBCE]/70 shadow-[0_2px_15px_-3px_rgba(193,154,107,0.05)] hover:shadow-lg hover:border-[#C19A6B]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {/* Top: Quote icon & comment */}
            <div>
              <Quote size={28} className="text-[#C19A6B]/30 fill-[#C19A6B]/15 mb-4" />
              <p className="text-sm text-gray-600 leading-relaxed font-light mb-8">
                "{t.comment}"
              </p>
            </div>

            {/* Bottom Row: User info on left, Stars on right */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C19A6B]/15 border border-[#C19A6B]/25 flex items-center justify-center text-[#9c7746] text-xs font-bold tracking-wider shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400 font-light mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>

              {/* Star Rating on Right */}
              <StarRating count={t.rating} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

