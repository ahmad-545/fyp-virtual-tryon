import React from 'react';
import { Sparkles, Cpu, Briefcase, Mail, ArrowRight } from 'lucide-react';

function Careers() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans antialiased text-neutral-900 w-full overflow-x-hidden selection:bg-[#C19A6B] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <div className="relative py-24 px-6 text-center border-b border-neutral-200/60 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#C19A6B] bg-neutral-100 px-4 py-2 rounded-xl inline-block border border-neutral-200/80">
            // Work With TryLo
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-neutral-950 uppercase leading-[1.1]">
            Shape the Future of <br />
            <span className="italic font-light text-neutral-600">AI Fashion & Retail</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto font-light leading-relaxed">
            Join our passionate team and help us build the next generation of smart e-commerce and virtual fitting experiences.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* 2. CORE DEPARTMENTS */}
        <div className="mb-24">
          <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-[0.3em] mb-12 text-center">// Our Core Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="p-8 bg-white border border-neutral-200/80 rounded-2xl hover:border-[#C19A6B] transition-all shadow-sm group">
              <div className="text-[#C19A6B] mb-6">
                <div className="p-3.5 bg-neutral-100 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Cpu size={22} />
                </div>
              </div>
              <h4 className="font-bold text-neutral-950 text-sm mb-3 uppercase tracking-wider">Engineering & AI</h4>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
                Building robust full-stack architectures, optimizing database connections, and refining our 2D AI rendering features.
              </p>
            </div>

            <div className="p-8 bg-white border border-neutral-200/80 rounded-2xl hover:border-[#C19A6B] transition-all shadow-sm group">
              <div className="text-[#C19A6B] mb-6">
                <div className="p-3.5 bg-neutral-100 w-fit rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Sparkles size={22} />
                </div>
              </div>
              <h4 className="font-bold text-neutral-950 text-sm mb-3 uppercase tracking-wider">Design & Textile</h4>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light">
                Curating top-tier fabrics, styling modern collections, and managing digital assets for a premium customer experience.
              </p>
            </div>

          </div>
        </div>

        {/* 3. APPLICATION PIPELINE */}
        <div className="mb-24 bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-12 shadow-sm">
          <h2 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-[0.3em] mb-12 text-center">// Application Pipeline</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="font-mono text-xl text-[#C19A6B] font-bold block">01</span>
              <h4 className="font-bold text-neutral-950 text-sm">Resume Screening</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">We review your portfolio, experience, and background.</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="font-mono text-xl text-[#C19A6B] font-bold block">02</span>
              <h4 className="font-bold text-neutral-950 text-sm">Technical Review</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">A friendly chat discussing your problem-solving and creativity.</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="font-mono text-xl text-[#C19A6B] font-bold block">03</span>
              <h4 className="font-bold text-neutral-950 text-sm">Onboarding</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">Join our growing team for an exciting internship or full-time role.</p>
            </div>
          </div>
        </div>

        {/* 4. HIRING HUB */}
        <div className="bg-[#070707] text-white rounded-2xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl border border-neutral-900">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C19A6B] opacity-10 rounded-full blur-[128px] -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="max-w-xl mx-auto space-y-6 relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-[#C19A6B]">
              <Briefcase size={22} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-tight">Join Our Talent Pool</h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              We are always looking for driven individuals who want to take ownership and innovate. Send us your resume today!
            </p>
            <div className="pt-4 max-w-sm mx-auto">
              <a 
                href="mailto:careers@trylo.com" 
                className="flex items-center justify-center gap-3 bg-neutral-900 hover:bg-[#C19A6B] hover:text-black p-4 rounded-xl border border-neutral-800 hover:border-[#C19A6B] transition-all duration-300 font-semibold cursor-pointer group"
              >
                <Mail size={18} className="text-[#C19A6B] group-hover:text-black" />
                <span className="text-xs sm:text-sm font-mono">careers@trylo.com</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Careers;