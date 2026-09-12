import React, { useState, useRef } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";

const SERVER_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://fyp-virtual-tryon.vercel.app";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");
      const res = await axios.post(`${SERVER_URL}/api/subscriber/subscribe`, {
        email,
      });
      if (res.data.success !== false) {
        setStatus("success");
        setMessage("You're in! Welcome to the Trylo family. 🎉");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(res.data.message || "Something went wrong. Try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Could not subscribe. Please try again."
      );
    }
  };

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Modern Curved Banner - Trylo Brand Theme */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1c1917] via-[#26201a] to-[#181412] px-6 sm:px-14 py-16 sm:py-20 text-center shadow-[0_20px_50px_-15px_rgba(193,154,107,0.22)] border border-[#C19A6B]/25">
          {/* Subtle Ambient Brand Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#C19A6B]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#C19A6B]/15 blur-3xl pointer-events-none" />

          {/* Tag */}
          <span className="inline-block text-[11px] uppercase font-semibold tracking-[0.25em] text-[#C19A6B] bg-[#C19A6B]/10 px-3.5 py-1 rounded-full border border-[#C19A6B]/20 mb-4">
            Trylo Insider
          </span>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-normal text-white tracking-tight mb-2.5">
            Stay in the <span className="text-[#C19A6B] italic font-serif">loop</span>
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base font-light mb-8 max-w-md mx-auto">
            New seasonal drops, style guides and exclusive member offers.
          </p>

          {/* Form / States */}
          {status === "success" ? (
            <div className="flex flex-col items-center gap-2.5 py-4 bg-white/10 backdrop-blur-md rounded-2xl max-w-md mx-auto border border-white/20">
              <CheckCircle2 size={36} className="text-[#C19A6B]" />
              <p className="text-white font-medium text-sm sm:text-base">
                {message}
              </p>
              <p className="text-neutral-400 text-xs">
                Unsubscribe with a single click anytime.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto"
            >
              <div className="relative w-full sm:w-72">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="you@example.com"
                  className="w-full px-5 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B] shadow-md transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#C19A6B] hover:bg-[#ad8758] active:scale-95 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    Subscribe <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error message */}
          {status === "error" && (
            <p className="mt-3 text-rose-300 text-xs font-medium bg-rose-900/40 py-1.5 px-4 rounded-lg inline-block border border-rose-800/40">
              {message}
            </p>
          )}

          {/* Footnote */}
          {status !== "success" && (
            <p className="mt-5 text-neutral-400 text-xs font-light">
              One email a fortnight. Unsubscribe with a single click.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

