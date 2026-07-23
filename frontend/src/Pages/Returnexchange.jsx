import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Clock, HelpCircle, Mail, Phone, ArrowRight } from 'lucide-react';

function Returnexchange() {
  return (
    <div className="bg-[#fcfcfc] min-h-screen text-neutral-900 w-full overflow-x-hidden font-sans antialiased">
      
      {/* 1. HEADER */}
      <div className="bg-white border-b border-neutral-200/60 py-16 sm:py-24 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-neutral-950 uppercase">
          Returns & Exchanges
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto font-light leading-relaxed">
          We want you to love what you buy. If you need to return or exchange an item, we make the process quick and easy.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* 2. POLICY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: Clock, title: "7 Days Policy", desc: "You have 7 days from delivery to request a return or exchange." },
            { icon: ShieldCheck, title: "Unused Items", desc: "Items must be unworn, unwashed, and have original tags attached." },
            { icon: Truck, title: "Easy Pickup", desc: "We can arrange a pickup from your doorstep in major cities." },
            { icon: RefreshCw, title: "Fast Process", desc: "Once we receive your item, requests are processed in 3-4 days." }
          ].map((item, idx) => (
            <div key={idx} className="border border-neutral-200/80 bg-white p-8 rounded-2xl shadow-sm hover:border-[#C19A6B] transition-all duration-300 group">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-neutral-100 text-[#C19A6B] mb-6 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <item.icon size={22} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950 text-center">{item.title}</h3>
              <p className="mt-2 text-xs text-neutral-500 font-light leading-relaxed text-center">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. DETAILS & CONTACT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-l-2 border-[#C19A6B] pl-4 text-neutral-950">Policy Rules</h2>
              <ul className="space-y-4 text-xs sm:text-sm text-neutral-600 font-light list-none">
                <li className="flex gap-3 leading-relaxed"><span>•</span> You can return or exchange any standard item within 7 days of receiving your order.</li>
                <li className="flex gap-3 leading-relaxed"><span>•</span> Sale items can be exchanged, but we do not offer direct monetary cash refunds.</li>
                <li className="flex gap-3 leading-relaxed"><span>•</span> Please ensure all tags are intact and items are packed in original packaging.</li>
                <li className="flex gap-3 leading-relaxed"><span>•</span> If you receive a damaged or incorrect item, return shipping charges are completely covered by us.</li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-8 border-l-2 border-[#C19A6B] pl-4 text-neutral-950">How to Start</h2>
              <div className="space-y-6">
                {[
                  { n: "01", t: "Contact Support", d: "Message or email our team with your order number and issue." },
                  { n: "02", t: "Send Item Back", d: "We will arrange a courier pickup or guide you on shipping it to us." },
                  { n: "03", t: "Get Resolution", d: "After quality inspection, your exchange or request will be processed." }
                ].map((step) => (
                  <div key={step.n} className="flex gap-5 items-start p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-base font-mono text-[#C19A6B] font-bold shrink-0">{step.n}</span>
                    <div>
                      <h4 className="font-bold text-neutral-950 text-xs sm:text-sm uppercase tracking-wide">{step.t}</h4>
                      <p className="text-xs text-neutral-500 mt-1 font-light leading-relaxed">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTACT SIDEBAR */}
          <div className="lg:col-span-5 bg-[#070707] text-white p-8 sm:p-10 space-y-8 rounded-2xl shadow-xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-[#C19A6B]" size={24} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Need Assistance?</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
                <div className="p-3 bg-neutral-900 rounded-xl text-[#C19A6B] border border-neutral-800">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-400 tracking-wider font-mono">Email Support</p>
                  <p className="text-sm mt-0.5 font-medium">support@trylo.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-900 rounded-xl text-[#C19A6B] border border-neutral-800">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-neutral-400 tracking-wider font-mono">Call or WhatsApp</p>
                  <p className="text-sm mt-0.5 font-medium">+92 311 1100439</p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-neutral-800">
              <p className="text-[11px] text-neutral-400 font-light">Support Hours: Mon - Sat (10:00 AM - 6:00 PM)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Returnexchange;