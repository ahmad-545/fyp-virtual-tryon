import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Search, Check, RefreshCw, Loader2, Image as ImageIcon, Star, Send, CheckCircle, MessageSquareHeart } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================
// INTERACTIVE STAR RATING COMPONENT
// ============================================
function InteractiveStarRating({ rating, setRating }) {
  const [hovered, setHovered] = useState(0);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent ✨'];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all duration-150 hover:scale-125 cursor-pointer focus:outline-none"
          >
            <Star
              size={32}
              className={`transition-all duration-150 ${
                star <= (hovered || rating)
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                  : 'text-neutral-700 fill-neutral-800 hover:text-neutral-500'
              }`}
            />
          </button>
        ))}
      </div>
      <span className={`text-xs font-mono transition-all duration-200 ${
        (hovered || rating) > 0 ? 'text-amber-400' : 'text-neutral-600'
      }`}>
        {labels[hovered || rating] || 'Tap a star to rate'}
      </span>
    </div>
  );
}

// ============================================
// MAIN TRY-ON MODEL COMPONENT
// ============================================
const TryOnModel = ({ isOpen = true, onClose, product }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const routeProduct = location.state?.product || product;

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(routeProduct);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Review Form State
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    name: '',
    role: '',
    rating: 0,
    comment: '',
  });

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  // 🌐 FETCH ALL PRODUCTS
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setFetching(true);
        const res = await axios.get('http://localhost:8000/api/products/');
        const data = res.data;
        if (data.success && Array.isArray(data.products)) {
          const reversedData = [...data.products].reverse();
          setAllProducts(reversedData);
          setFilteredProducts(reversedData);
          if (!activeProduct && reversedData.length > 0) {
            setActiveProduct(reversedData[0]);
          }
        }
      } catch (error) {
        console.error('Product fetch error:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchLiveProducts();
  }, []);

  // ⚡ SEARCH FILTER
  useEffect(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (cleanQuery === '') {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter((item) =>
          item.name?.toLowerCase().includes(cleanQuery) ||
          item.category?.toLowerCase().includes(cleanQuery) ||
          item.subcategory?.toLowerCase().includes(cleanQuery) ||
          item.styleType?.toLowerCase().includes(cleanQuery) ||
          item.productType?.toLowerCase().includes(cleanQuery)
        )
      );
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    if (routeProduct) setActiveProduct(routeProduct);
  }, [routeProduct]);

  if (isOpen === false) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ⚡ TRY-ON ENGINE
  const handleTryOnSubmit = async () => {
    if (!selectedFile) return alert('Please upload a portrait photo first.');
    if (!activeProduct) return alert('Please select an apparel item first.');

    setLoading(true);
    setAiResult(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('upload_preset', 'your_cloudinary_preset_name');

      const cloudinaryRes = await fetch(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        { method: 'POST', body: uploadData }
      );
      const uploadedImage = await cloudinaryRes.json();
      const userCloudinaryUrl = uploadedImage.secure_url;

      if (!userCloudinaryUrl) throw new Error('Cloudinary upload failed.');

      const targetClothUrl =
        activeProduct.images?.[0]?.url || activeProduct.images?.[0] || '';

      const response = await axios.post(
        'http://localhost:8000/api/ai/process-tryon',
        { personImageUrl: userCloudinaryUrl, clothImageUrl: targetClothUrl }
      );

      if (response.data.success) {
        setAiResult({ renderOutput2D: response.data.tryOnImage });
      } else {
        alert(response.data.message || 'AI execution error.');
      }
    } catch (error) {
      console.error('Try-On pipeline error:', error);
      alert('AI Pipeline error or image upload timeout.');
    } finally {
      setLoading(false);
    }
  };

  // ── REVIEW SUBMIT ─────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewData.rating === 0) return alert('Please select a star rating.');
    if (!reviewData.name.trim()) return alert('Please enter your name.');
    if (!reviewData.comment.trim()) return alert('Please write about your experience.');

    setReviewLoading(true);
    try {
      await axios.post('http://localhost:8000/api/reviews', {
        name: reviewData.name.trim(),
        role: reviewData.role.trim() || 'Virtual Try-On User',
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
        productName: activeProduct?.name || '',
      });
      setReviewSubmitted(true);
    } catch (error) {
      console.error('Review submit error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const getProductImage = (item) => {
    if (!item?.images || item.images.length === 0)
      return 'https://placehold.co/150x200?text=No+Image';
    const imgObj = item.images[0];
    if (typeof imgObj === 'string') return imgObj;
    return imgObj?.url || imgObj?.secure_url || 'https://placehold.co/150x200?text=No+Image';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] text-white flex flex-col overflow-y-auto font-sans">

      {/* ── HEADER ─────────────────────────────── */}
      <header className="w-full border-b border-neutral-800/80 bg-[#0d0d0d]/95 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C19A6B] font-mono block mb-0.5">
            Interactive Studio
          </span>
          <h2 className="text-xl font-serif tracking-wide text-neutral-100 uppercase">
            Virtual Try-On Center
          </h2>
        </div>
        <button
          onClick={handleClose}
          className="px-5 py-2.5 rounded-xl border border-neutral-800 text-xs tracking-widest uppercase text-neutral-400 hover:bg-[#C19A6B] hover:text-black hover:border-[#C19A6B] transition-all duration-300 cursor-pointer flex items-center gap-2 font-semibold"
        >
          <span>Close Studio</span> <X size={14} />
        </button>
      </header>

      {/* ── THREE COLUMN GRID ──────────────────── */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 items-start">

        {/* COL 1: PORTRAIT UPLOAD */}
        <section className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
              <Upload size={14} /> 01 / Your Portrait
            </h3>
            <div className="border border-neutral-800 bg-neutral-950 rounded-xl aspect-[3/4] flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
              {imagePreview ? (
                <img src={imagePreview} alt="User Frame" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#C19A6B]">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Upload a clear full-body or portrait photo for accurate AI fitting.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <input type="file" accept="image/*" id="userPhotoInput" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor="userPhotoInput"
              className="w-full block text-center text-xs font-bold tracking-widest uppercase bg-black border border-neutral-800 hover:border-[#C19A6B] text-white py-3.5 rounded-xl cursor-pointer transition shadow-md"
            >
              {selectedFile ? 'Change Portrait' : 'Upload Portrait'}
            </label>
          </div>
        </section>

        {/* COL 2: LIVE PRODUCTS */}
        <section className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
              <Sparkles size={14} /> 02 / Select Apparel
            </h3>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">
              {filteredProducts.length} Items
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fabrics, eastern, western styles..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-200 focus:outline-none focus:border-[#C19A6B] transition placeholder-neutral-600"
            />
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 text-xs font-mono text-neutral-500 gap-3">
              <Loader2 className="w-6 h-6 text-[#C19A6B] animate-spin" />
              <span>Syncing Database Catalog...</span>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3.5 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-xs text-neutral-500 font-mono py-16">
                  No matching apparel found.
                </div>
              ) : (
                filteredProducts.map((fab) => {
                  const isSelected = activeProduct?._id === fab._id;
                  return (
                    <div
                      key={fab._id}
                      onClick={() => setActiveProduct(fab)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-300 bg-neutral-950 flex flex-col gap-2 relative group ${
                        isSelected
                          ? 'border-[#C19A6B] shadow-[0_0_20px_rgba(193,154,107,0.2)] bg-neutral-900/50'
                          : 'border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="w-full aspect-[4/5] bg-neutral-900 rounded-lg overflow-hidden relative">
                        <img
                          src={getProductImage(fab)}
                          alt={fab.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-[#C19A6B] text-black text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-md">
                            <Check size={10} /> Active
                          </div>
                        )}
                      </div>
                      <h4 className="text-[11px] text-neutral-300 font-semibold truncate px-0.5">
                        {fab.name}
                      </h4>
                      <span className="text-[10px] text-[#C19A6B] font-extrabold px-0.5">
                        Rs. {fab.price?.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* COL 3: AI GENERATION */}
        <section className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
              <RefreshCw size={14} /> 03 / AI Generation
            </h3>

            {activeProduct && (
              <div className="flex gap-3 items-center p-3 bg-neutral-950 border border-neutral-800 rounded-xl shadow-inner">
                <img
                  src={getProductImage(activeProduct)}
                  className="w-12 h-14 object-cover rounded-lg bg-neutral-900 shrink-0 border border-neutral-800"
                  alt=""
                />
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono block">
                    Selected Target
                  </span>
                  <h5 className="text-xs text-neutral-200 truncate font-bold uppercase">
                    {activeProduct.name}
                  </h5>
                  <span className="text-[10px] text-[#C19A6B] font-mono">
                    Rs. {activeProduct.price?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex-1 w-full border border-neutral-800 bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden shadow-inner">
              {aiResult ? (
                <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={aiResult.renderOutput2D}
                    alt="Virtual Try-On Result"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs font-light text-neutral-400 max-w-[200px] mx-auto leading-relaxed">
                    Upload your portrait and select an outfit to generate your AI try-on preview.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleTryOnSubmit}
            disabled={loading || !activeProduct || !selectedFile}
            className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg mt-6 cursor-pointer flex items-center justify-center gap-2 ${
              loading || !activeProduct || !selectedFile
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/30'
                : 'bg-[#C19A6B] text-black hover:bg-[#b0895b] font-extrabold'
            }`}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /><span>AI Rendering...</span></>
            ) : (
              <><Sparkles size={16} /><span>Generate Try-On</span></>
            )}
          </button>
        </section>
      </main>

      {/* REVIEW SECTION — ALWAYS VISIBLE AT BOTTOM */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-12 mt-2">

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-800 to-neutral-800" />
          <div className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900/60">
            <MessageSquareHeart size={14} className="text-[#C19A6B]" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#C19A6B]">
              Share Your Experience
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-neutral-800 to-neutral-800" />
        </div>

        {/* ── SUCCESS STATE ───────────────────────── */}
        {reviewSubmitted ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-neutral-900/70 border border-[#C19A6B]/30 rounded-2xl p-10 text-center shadow-[0_0_60px_rgba(193,154,107,0.1)]">
              {/* Glow ring */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-[#C19A6B]/10 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-[#C19A6B]/15 border border-[#C19A6B]/40 flex items-center justify-center">
                  <CheckCircle size={36} className="text-[#C19A6B]" />
                </div>
              </div>
              <h3 className="text-2xl font-serif text-neutral-100 mb-3">
                Thank You! 🎉
              </h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-xs mx-auto">
                Your review has been submitted successfully and is now visible in the{' '}
                <span className="text-[#C19A6B] font-medium">Testimonials</span>{' '}
                section in real-time.
              </p>
              {/* Stars display */}
              <div className="flex items-center justify-center gap-1 mt-5">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    size={18}
                    className={s <= reviewData.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-neutral-800 text-neutral-700'}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setReviewSubmitted(false);
                  setReviewData({ name: '', role: '', rating: 0, comment: '' });
                }}
                className="mt-6 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-[#C19A6B] transition cursor-pointer"
              >
                + Add Another Review
              </button>
            </div>
          </div>

        ) : (

          /* ── REVIEW FORM ──────────────────────── */
          <div className="max-w-2xl mx-auto">
            <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.3)]">

              {/* Top accent bar */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent" />

              <div className="p-8">

                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C19A6B] animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#C19A6B]">
                      Virtual Try-On · Customer Review
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif text-neutral-100 leading-snug">
                    How was your Try-On experience?
                  </h3>
                  <p className="text-sm text-neutral-500 font-light mt-1.5">
                    Your feedback helps other customers make better choices. ✨
                  </p>
                </div>

                {/* Tried product badge */}
                {activeProduct && (
                  <div className="flex items-center gap-3 p-3.5 bg-neutral-950 border border-neutral-800/60 rounded-xl mb-7">
                    <img
                      src={getProductImage(activeProduct)}
                      className="w-11 h-13 object-cover rounded-lg border border-neutral-800 shrink-0"
                      alt=""
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-600 font-mono block mb-0.5">
                        Selected Outfit
                      </span>
                      <span className="text-xs text-neutral-200 font-semibold truncate block">
                        {activeProduct.name}
                      </span>
                      <span className="text-[10px] text-[#C19A6B] font-mono">
                        Rs. {activeProduct.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-6">

                  {/* ── STAR RATING ──────────────────── */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-500 block">
                      Rating <span className="text-red-500/70">*</span>
                    </label>
                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                      <InteractiveStarRating
                        rating={reviewData.rating}
                        setRating={(r) => setReviewData((p) => ({ ...p, rating: r }))}
                      />
                    </div>
                  </div>

                  {/* ── NAME + ROLE ───────────────────── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-500 block">
                        Your Name <span className="text-red-500/70">*</span>
                      </label>
                      <input
                        type="text"
                        value={reviewData.name}
                        onChange={(e) => setReviewData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Ayesha Khan"
                        maxLength={50}
                        className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#C19A6B] rounded-xl px-4 py-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-500 block">
                        City / Role{' '}
                        <span className="text-neutral-700 normal-case tracking-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={reviewData.role}
                        onChange={(e) => setReviewData((p) => ({ ...p, role: e.target.value }))}
                        placeholder="e.g. Fashion Lover · Lahore"
                        maxLength={60}
                        className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#C19A6B] rounded-xl px-4 py-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* ── COMMENT ──────────────────────── */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-mono text-neutral-500 block">
                      Your Experience <span className="text-red-500/70">*</span>
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData((p) => ({ ...p, comment: e.target.value }))}
                      placeholder="How was the fit, accuracy, and overall look? Share your honest experience..."
                      rows={4}
                      maxLength={300}
                      className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-[#C19A6B] rounded-xl px-4 py-3.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none transition resize-none leading-relaxed"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-700 font-light">
                        Minimum 20 characters recommended
                      </span>
                      <span className={`text-[10px] font-mono transition-colors ${
                        reviewData.comment.length > 250 ? 'text-amber-500' : 'text-neutral-600'
                      }`}>
                        {reviewData.comment.length}/300
                      </span>
                    </div>
                  </div>

                  {/* ── SUBMIT BUTTON ─────────────────── */}
                  <button
                    type="submit"
                    disabled={reviewLoading || reviewData.rating === 0}
                    className={`w-full py-4 rounded-xl font-mono text-sm uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
                      reviewLoading || reviewData.rating === 0
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/30'
                        : 'bg-gradient-to-r from-[#C19A6B] to-[#a8834e] text-black font-extrabold hover:shadow-[0_0_30px_rgba(193,154,107,0.35)] hover:scale-[1.01] cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    {reviewLoading ? (
                      <><Loader2 size={16} className="animate-spin" /><span>Submitting...</span></>
                    ) : (
                      <><Send size={16} /><span>Submit Review</span></>
                    )}
                  </button>

                  {/* Privacy Note */}
                  <p className="text-center text-[11px] text-neutral-700 font-light">
                    🔒 Reviews are published instantly · No personal info required
                  </p>

                </form>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TryOnModel;