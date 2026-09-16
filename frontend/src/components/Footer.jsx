import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { ArrowRight, ShieldCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import logo from "../assets/logof2.png";

const SERVER_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://fyp-virtual-tryon.vercel.app";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [footerMsg, setFooterMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      setLoading(true);
      setFooterMsg("");
      const res = await axios.post(`${SERVER_URL}/api/subscriber/subscribe`, {
        email: newsletterEmail.trim(),
      });
      if (res.data.success !== false) {
        setIsSuccess(true);
        setFooterMsg("Thank you for joining our community! 🎉");
        setNewsletterEmail("");
      } else {
        setIsSuccess(false);
        setFooterMsg(res.data.message || "Subscription failed. Please try again.");
      }
    } catch (err) {
      setIsSuccess(false);
      setFooterMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0b0b0b] text-white pt-16 pb-12 border-t border-neutral-900 select-none w-full font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
        
        {/* ── 1. EDITORIAL NEWSLETTER STRIP (Zara / Mango Style) ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-14 border-b border-neutral-800/80">
          <div className="max-w-lg space-y-2">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.28em] text-[#C19A6B] font-semibold block">
              // Join The Community
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
              Subscribe to exclusive updates
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              Be the first to access seasonal lookbooks, limited wardrobe drops, and private virtual fitting previews.
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex items-center border-b border-neutral-700 pb-2 focus-within:border-[#C19A6B] transition-colors">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  className="bg-transparent text-xs text-white placeholder:text-neutral-500 uppercase tracking-widest outline-none w-full py-1.5 font-light"
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-xs font-mono font-bold uppercase tracking-widest text-[#C19A6B] hover:text-white transition-colors shrink-0 ml-4 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <span>Join</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
              {footerMsg && (
                <p className={`text-[11px] mt-2 font-mono flex items-center gap-1.5 ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isSuccess && <CheckCircle2 size={12} />}
                  <span>{footerMsg}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── 2. MAIN BRAND & NAVIGATION GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10 py-14 border-b border-neutral-800/80">
          
          {/* BRAND COLUMN (Wider on Large Screens) */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-5 pr-0 lg:pr-8">
            <Link to="/" className="inline-block transition-opacity hover:opacity-80">
              <img src={logo} alt="TryLo Clothing" className="h-20 sm:h-24 w-auto object-contain -ml-2" />
            </Link>
            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
              Pakistan's first AI-powered virtual try-on fashion house. Experience the future of online styling with hyper-realistic fitting and curated wardrobe essentials.
            </p>

            {/* Direct WhatsApp Stylist Assistance Pill */}
            <div>
              <a
                href="https://wa.me/923484236919"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[#C19A6B] hover:text-white hover:border-[#C19A6B] text-xs transition-all duration-300"
              >
                <FaWhatsapp className="text-emerald-400 text-sm" />
                <span className="font-mono text-[11px]">Chat with Stylist (24/7)</span>
              </a>
            </div>
          </div>

          {/* COL 1: SHOP */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white font-semibold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li><Link to="/shop?category=women" className="hover:text-white transition-colors block py-0.5">Women's Wear</Link></li>
              <li><Link to="/shop?category=men" className="hover:text-white transition-colors block py-0.5">Men's Wear</Link></li>
              <li><Link to="/shop?category=kids" className="hover:text-white transition-colors block py-0.5">Kid's Wear</Link></li>
              <li><Link to="/shop?productType=trending" className="hover:text-white transition-colors block py-0.5">Trending Styles</Link></li>
              <li><Link to="/shop?productType=featured" className="hover:text-white transition-colors block py-0.5">Featured Line</Link></li>
              <li>
                <Link to="/virtual-room" className="text-[#C19A6B] hover:text-white transition-colors inline-flex items-center gap-1.5 py-0.5 font-medium">
                  <Sparkles size={11} /> AI Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 2: CUSTOMER SERVICE */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white font-semibold">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li><Link to="/track-order" className="hover:text-white text-neutral-200 transition-colors block py-0.5 font-medium">Track Your Order</Link></li>
              <li><Link to="/returnexchange" className="hover:text-white transition-colors block py-0.5">Returns & Exchanges</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors block py-0.5">FAQs & Help</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors block py-0.5">Shipping Guidelines</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors block py-0.5">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* COL 3: COMPANY & DIRECT HELP */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white font-semibold">
              About TryLo
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li><Link to="/Aboutus" className="hover:text-white transition-colors block py-0.5">Our Story</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors block py-0.5">Careers & Hiring</Link></li>
              <li><Link to="/Aboutus" className="hover:text-white transition-colors block py-0.5">AI Fitting Engine</Link></li>
              <li className="pt-2 text-[11px] font-mono text-neutral-500">
                <span>Direct Support:</span>
                <a href="tel:+923484236919" className="text-neutral-300 block hover:text-[#C19A6B] transition-colors mt-0.5">
                  +92 348 4236919
                </a>
              </li>
              <li className="text-[11px] font-mono text-neutral-500">
                <a href="mailto:support@trylo.com" className="text-neutral-300 hover:text-[#C19A6B] transition-colors">
                  support@trylo.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── 3. SOCIAL MEDIA & REGION STRIP ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-b border-neutral-800/80">
          {/* Social Links (Clean Uppercase Monospace Links like High Fashion Houses) */}
          <div className="flex items-center gap-6 text-[11px] font-mono tracking-widest text-neutral-400">
            <span className="text-neutral-600 hidden md:inline">// FOLLOW:</span>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C19A6B] transition-colors">INSTAGRAM</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C19A6B] transition-colors">TIKTOK</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C19A6B] transition-colors">FACEBOOK</a>
            <a href="https://wa.me/923484236919" target="_blank" rel="noopener noreferrer" className="hover:text-[#C19A6B] transition-colors">WHATSAPP</a>
          </div>

          {/* Region / Currency Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PAKISTAN / PKR (RS)</span>
          </div>
        </div>

        {/* ── 4. BOTTOM COPYRIGHT & TRUST PILLS ── */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] text-neutral-500 font-mono tracking-wider uppercase">
            © {new Date().getFullYear()} TRYLO CLOTHING CO. ALL RIGHTS RESERVED.
          </p>

          {/* Payment Badges (Clean, Minimalist Text Pills) */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] font-mono text-neutral-400">
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">Cash On Delivery</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">Visa / Mastercard</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">Bank Transfer</span>
            <span className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-emerald-400 inline-flex items-center gap-1">
              <ShieldCheck size={11} /> 100% Secured
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}