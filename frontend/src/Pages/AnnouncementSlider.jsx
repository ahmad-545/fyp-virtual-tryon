import React from "react";

function AnnouncementSlider() {
  const announcements = [
    "Summer Sale Live now - Flat 50% off - Free shipping Nationwide",
    "Summer Sale Live now - Flat 50% off - Free shipping Nationwide",
    "Summer Sale Live now - Flat 50% off - Free shipping Nationwide",
    "Summer Sale Live now - Flat 50% off - Free shipping Nationwide",
  ];

  return (
    <div className="w-full bg-[#C19A6B] text-white overflow-hidden py-2.5 relative select-none shadow-md">
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
        {/* First set of items */}
        {announcements.map((text, index) => (
          <div key={index} className="flex items-center text-xs md:text-sm font-medium tracking-wide uppercase px-8">
            <span>{text}</span>
            <span className="mx-8 text-white">|</span>
          </div>
        ))}
        {/* Duplicate set for smooth infinite loop effect */}
        {announcements.map((text, index) => (
          <div key={`dup-${index}`} className="flex items-center text-xs md:text-sm font-medium tracking-wide uppercase px-8">
            <span>{text}</span>
            <span className="mx-8 text-white">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementSlider;