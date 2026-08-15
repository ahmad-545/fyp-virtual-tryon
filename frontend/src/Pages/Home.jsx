import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import slider2 from "../assets/slider 2.png";
import FashionCategories from "./Categories";
import VirtualTryOnPromo from "./VirtualTryOnPromo";
import Trending from "./Trending";
import Timer from "./Timer";
import Feature from "./Feature";
import Footer from "../components/Footer";
import home1 from "../assets/Videos/home 1.mp4";
import home2 from "../assets/Videos/home 2.mp4";
import home3 from "../assets/Videos/home 3.mp4";
import home4 from "../assets/Videos/home 4.mp4";



function Home() {
  const slides = [
    { 
      id: 1, 
      tag: "Premium AI Fitting", 
      title: "The Smart Way\nTo Dress Better", 
      subtitle: "Experience the virtual trial revolution live.", 
      btnText: "Explore Studio", 
      link: "/virtual-room", 
      video: home1 
    },
    { 
      id: 2, 
      tag: "Summer Collections 2026", 
      title: "Minimal Design\nMaximum Vibe", 
      subtitle: "Bespoke lightweight wear with up to 50% seasonal discount.", 
      btnText: "Shop Collection", 
      link: "/shop", 
      video: home4
    },
    { 
      id: 3, 
      tag: "Exclusive Fabrics Line", 
      title: "From Raw Bolt\nTo Finished Masterpiece", 
      subtitle: "Crafted details engineered for absolute comfort.", 
      btnText: "View Products", 
      link: "/shop", 
      video: home2
    },
  ];

  return (
    <>
      <div className="relative w-full h-[500px] sm:h-[600px] md:h-[calc(100vh-80px)] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ 
              clickable: true, 
              bulletClass: 'swiper-pagination-bullet !w-2.5 !h-2.5 !bg-neutral-300',
              bulletActiveClass: '!bg-[#C19A6B] !scale-125 !w-6'
          }}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          loop={true}
          effect="fade"
          className="w-full h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <section className="relative w-full h-full bg-neutral-100 flex items-center">
                
                {/* Check if slide has a video or image */}
                {slide.video ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  >
                    <source src={slide.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0" 
                    style={{ backgroundImage: `url(${slide.image})` }} 
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent z-10 w-full md:w-[70%]" />

                {/* Content Layer */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-20">
                  <div className="max-w-[650px] flex flex-col items-start space-y-6">
                    <p className="text-[#C19A6B] text-xs font-mono tracking-[0.3em] uppercase">{slide.tag}</p>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] whitespace-pre-line text-neutral-900">{slide.title}</h1>
                    <p className="text-neutral-600 text-lg md:text-xl font-light">{slide.subtitle}</p>
                    <Link to={slide.link}>
                      <button className="flex items-center gap-3 px-8 py-3.5 bg-neutral-950 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C19A6B] transition-all duration-300">
                        <span>{slide.btnText}</span>
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </section>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <button className="custom-prev absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
          <ChevronLeft size={20} />
        </button>
        <button className="custom-next absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
          <ChevronRight size={20} />
        </button>
      </div>

      <FashionCategories />
      <VirtualTryOnPromo />
      <Trending />
      <Timer />
      <Feature />
    </>
  );
}

export default Home;