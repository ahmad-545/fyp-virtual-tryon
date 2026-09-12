import React, { useEffect, useRef, useState, useCallback } from "react";
import { Star, Quote, Sparkles, RefreshCw, Wifi } from "lucide-react";
import axios from "axios";
import socket from "../utils/socket";

// ============================================
// HELPER: Get initials from name
// ============================================
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

// ============================================
// HELPER: Format date nicely
// ============================================
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-PK", { month: "short", year: "numeric" });
}

// ============================================
// STAR DISPLAY COMPONENT
// ============================================
function StarRating({ count = 5, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= count
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          }
        />
      ))}
    </div>
  );
}

// ============================================
// AVATAR COLOR PALETTE (cycling)
// ============================================
const avatarColors = [
  "bg-[#C19A6B]/15 border-[#C19A6B]/25 text-[#9c7746]",
  "bg-violet-500/10 border-violet-500/25 text-violet-400",
  "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  "bg-rose-500/10 border-rose-500/25 text-rose-400",
  "bg-sky-500/10 border-sky-500/25 text-sky-400",
  "bg-amber-500/10 border-amber-500/25 text-amber-400",
];

// ============================================
// SINGLE REVIEW CARD
// ============================================
function ReviewCard({ review, index, visible, isNew = false }) {
  const colorClass = avatarColors[index % avatarColors.length];
  const initials = getInitials(review.name);

  return (
    <div
      className={`
        group relative bg-white rounded-2xl p-7 border border-[#EADBCE]/70
        shadow-[0_2px_15px_-3px_rgba(193,154,107,0.05)]
        hover:shadow-xl hover:border-[#C19A6B]/50 hover:-translate-y-1.5
        transition-all duration-400 flex flex-col justify-between overflow-hidden
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        ${isNew ? "ring-2 ring-[#C19A6B]/40 shadow-[0_0_20px_rgba(193,154,107,0.15)]" : ""}
      `}
      style={{ transitionDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      {/* NEW badge for real-time arrivals */}
      {isNew && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#C19A6B] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">
          <Wifi size={8} /> Live
        </div>
      )}

      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C19A6B]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top: Quote + Comment */}
      <div>
        <Quote size={26} className="text-[#C19A6B]/25 fill-[#C19A6B]/12 mb-4" />
        <p className="text-sm text-gray-600 leading-relaxed font-light mb-3 line-clamp-4">
          "{review.comment}"
        </p>
        {review.productName && (
          <div className="flex items-center gap-1.5 mb-4">
            <Sparkles size={10} className="text-[#C19A6B]" />
            <span className="text-[10px] text-[#C19A6B] font-mono font-semibold truncate max-w-[160px]">
              Tried: {review.productName}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: User info + Stars + Time */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold tracking-wider shrink-0 ${colorClass}`}
          >
            {initials || "U"}
          </div>
          {/* Name + Role */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
              {review.name}
            </p>
            <p className="text-[11px] text-gray-400 font-light mt-0.5 truncate">
              {review.role || "Virtual Try-On User"}
            </p>
          </div>
        </div>

        {/* Stars + Time */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StarRating count={review.rating} />
          {review.createdAt && (
            <span className="text-[9px] text-gray-300 font-mono">
              {timeAgo(review.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SKELETON LOADER CARD
// ============================================
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-7 border border-[#EADBCE]/50 flex flex-col gap-4 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full" />
          <div className="space-y-1.5">
            <div className="h-2.5 bg-gray-100 rounded w-24" />
            <div className="h-2 bg-gray-100 rounded w-16" />
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-gray-100 rounded-sm" />)}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN TESTIMONIALS COMPONENT
// ============================================
export default function Testimonials() {
  const [visible, setVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0); // tracks real-time additions
  const [newReviewIds, setNewReviewIds] = useState(new Set()); // for "Live" badge
  const sectionRef = useRef(null);

  // ── Intersection Observer ──────────────────
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

  // ── Fetch Approved Reviews from DB ─────────
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/reviews");
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.warn("Could not fetch reviews:", err.message);
      // Fallback to static on error — no crash
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Socket.IO: Real-time Events ────────────
  useEffect(() => {
    // ✅ New review approved by admin — add it live at the top
    const handleApproved = ({ review }) => {
      setReviews((prev) => {
        // avoid duplicates
        if (prev.find((r) => r._id === review._id)) return prev;
        return [review, ...prev];
      });
      setNewReviewIds((prev) => new Set([...prev, review._id]));
      setLiveCount((c) => c + 1);

      // Remove "Live" badge after 10 seconds
      setTimeout(() => {
        setNewReviewIds((prev) => {
          const next = new Set(prev);
          next.delete(review._id);
          return next;
        });
      }, 10000);
    };

    // ❌ Review hidden by admin — remove it
    const handleHidden = ({ reviewId }) => {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    };

    // 🗑️ Review deleted
    const handleDeleted = ({ reviewId }) => {
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    };

    socket.on("review:approved", handleApproved);
    socket.on("review:hidden", handleHidden);
    socket.on("review:deleted", handleDeleted);

    return () => {
      socket.off("review:approved", handleApproved);
      socket.off("review:hidden", handleHidden);
      socket.off("review:deleted", handleDeleted);
    };
  }, []);

  // Use only real DB reviews
  const displayReviews = reviews;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  const totalReviews = reviews.length > 0 ? reviews.length : null;

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-12 bg-[#fafafa] overflow-hidden"
    >
      {/* ── HEADER ─────────────────────────────── */}
      <div className="text-center mb-14 sm:mb-16">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2.5">
          CUSTOMER STORIES
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
          What our customers{" "}
          <span className="text-[#C19A6B] italic">say</span>
        </h2>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-2 mt-3.5">
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
          <div className="w-2 h-2 rounded-full bg-[#C19A6B]" />
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
        </div>

        {/* Stats Row — only show if reviews exist */}
        {totalReviews && (
          <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
          {/* Average Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i <= Math.round(parseFloat(avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">{avgRating}</span>
            <span className="text-xs text-gray-400 font-light">
              ({totalReviews} reviews)
            </span>
          </div>

          {/* Separator dot */}
          <div className="w-1 h-1 rounded-full bg-gray-300" />

          {/* Source badge */}
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#C19A6B]" />
            <span className="text-xs text-gray-500 font-light">
              From Virtual Try-On experiences
            </span>
          </div>

          {/* Live indicator */}
          {liveCount > 0 && (
            <>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {liveCount} new live
                </span>
              </div>
            </>
          )}
        </div>
        )}

        <p className="text-sm sm:text-base text-gray-500 font-light mt-3 max-w-md mx-auto">
          Unedited, from real Virtual Try-On orders
        </p>
      </div>

      {/* ── LOADING SKELETONS ──────────────────── */}
      {loading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── REVIEW CARDS GRID ──────────────────── */}
      {!loading && (
        <>
          {/* Empty state when no real reviews yet */}
          {displayReviews.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#C19A6B]/10 border border-[#C19A6B]/20 flex items-center justify-center mx-auto mb-5">
                <Star size={28} className="text-[#C19A6B]/50" />
              </div>
              <h3 className="text-lg font-serif text-gray-600 mb-2">Abhi tak koi review nahi</h3>
              <p className="text-sm text-gray-400 font-light">
                Pehle Virtual Try-On karein aur apna experience share karein!
              </p>
            </div>
          )}

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayReviews.map((review, i) => (
              <ReviewCard
                key={review._id || i}
                review={review}
                index={i}
                visible={visible}
                isNew={newReviewIds.has(review._id)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── BOTTOM CTA ────────────────────────── */}
      {!loading && (
        <div className="text-center mt-14">
          <div className="inline-flex items-center gap-2 text-[11px] text-gray-400 font-light">
            <span className="w-1.5 h-1.5 bg-[#C19A6B] rounded-full animate-pulse" />
            Reviews update in real-time after Virtual Try-On
            <span className="w-1.5 h-1.5 bg-[#C19A6B] rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </section>
  );
}
