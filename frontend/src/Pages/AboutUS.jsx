import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shirt, Eye, Target, Camera, Cpu, Layers, ArrowRight } from 'lucide-react';

function AboutUS() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-neutral-900 w-full overflow-x-hidden selection:bg-[#C19A6B] selection:text-white font-sans antialiased">
      
      {/* 1. HERO VISION BLOCK */}
      <div className="relative py-24 sm:py-32 px-6 text-center border-b border-neutral-200/60 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#C19A6B] block">
            // Welcome To TryLo
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-neutral-950 uppercase mb-6 leading-[1.1]">
            Fashion Meets <br/>
            <span className="italic font-light text-neutral-600">Smart Technology.</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed font-light">
            At <span className="font-bold text-neutral-900">TryLo</span>, we make high-end fashion simple and fast. Now you can select your favorite outfits with complete confidence and zero confusion.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* 2. ⚡ VIRTUAL TRY-ON DEPLOYMENT SHOWCASE */}
        <div className="bg-[#070707] text-white rounded-2xl p-8 sm:p-16 mb-24 relative overflow-hidden shadow-2xl border border-neutral-900">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C19A6B] opacity-10 rounded-full blur-[128px] -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
            <div className="lg:col-span-7 space-y-8">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#C19A6B] flex items-center gap-2">
                <Cpu size={16} /> AI Virtual Try-On
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-white uppercase leading-tight">
                Check the fit <br/>
                <span className="italic font-light text-neutral-400">before you buy.</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
                Forget sizing worries! With TryLo's <span className="text-white font-medium">AI Virtual Assistant</span>, you can instantly see how any outfit looks on your photo before making a purchase.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-800/80">
                {[
                  { icon: Camera, t: "1. Upload Photo", d: "Upload a simple portrait picture." },
                  { icon: Shirt, t: "2. Choose Outfit", d: "Select from our premium catalog." },
                  { icon: Layers, t: "3. See Result", d: "Check your look instantly." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3.5 items-start">
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 text-[#C19A6B] shrink-0 border border-neutral-700/50"><step.icon size={18}/></div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">{step.t}</p>
                      <p className="text-[11px] text-neutral-400 mt-1 font-light leading-snug">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Interactive Block */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="border border-neutral-800 bg-neutral-900/60 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm text-center space-y-6 shadow-xl">
                <div className="w-full h-44 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center text-neutral-500 shadow-inner">
                  <Camera size={36} className="mb-2 text-[#C19A6B] animate-pulse"/>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-300">Virtual Room Ready</p>
                </div>
                <button 
                  onClick={() => navigate('/virtual-room')}
                  className="w-full bg-[#C19A6B] hover:bg-[#b08759] text-black font-extrabold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Try It Now</span> <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CORE COMMITMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-24 items-center">
          {[
            { icon: Target, title: "Our Mission", desc: "We provide top-quality Eastern and Western wear designed to match your daily lifestyle and comfort needs." },
            { icon: Eye, title: "Quality Guarantee", desc: "Every single product goes through strict quality and fabric testing to ensure you get the absolute best." }
          ].map((item, i) => (
            <div key={i} className="space-y-4 border-l-2 border-[#C19A6B] pl-6 sm:pl-8 bg-white p-6 sm:p-8 rounded-r-2xl border-y border-r border-neutral-100 shadow-sm">
              <item.icon className="text-[#C19A6B]" size={30} />
              <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-neutral-950 uppercase">{item.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 4. BRAND PILLARS */}
        <div className="border-t border-neutral-200/60 pt-20">
          <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-[0.3em] text-center mb-12">// Why Choose Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shirt, title: "Premium Fabrics", desc: "Sourcing only fine cottons and breathable materials for everyday wear." },
              { icon: Sparkles, title: "AI Styling Help", desc: "Your personal fashion advisor to help you find the right outfit match." },
              { icon: Layers, title: "Easy Returns", desc: "Simple return and exchange policy to keep your shopping completely risk-free." }
            ].map((p, i) => (
              <div key={i} className="p-8 bg-white border border-neutral-200/80 rounded-2xl hover:border-[#C19A6B] transition-all duration-300 shadow-sm group">
                <div className="text-[#C19A6B] mb-5 group-hover:scale-110 transition-transform duration-300"><p.icon size={26} /></div>
                <h4 className="font-bold text-neutral-950 text-sm mb-2.5 uppercase tracking-wider">{p.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutUS;