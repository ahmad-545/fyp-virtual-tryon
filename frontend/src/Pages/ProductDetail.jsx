import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; 
import {
  AiOutlineShoppingCart,
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineCamera,
  AiFillStar,
} from "react-icons/ai";
import { Sparkles } from "lucide-react"; 
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js"; 
import TryOnModal from "./TryOnModel.jsx"; 

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });

  // ============================================
  // FETCH PRODUCT DETAILS
  // ============================================
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/products/${id}`);
      const data = await res.json();
      
      const p = data.product || data;
      if (p) {
        setProduct(p);
        const firstImg = p.images?.[0]?.url || p.images?.[0] || "";
        setMainImage(firstImg);
        setSelectedSize(p.sizes?.[0]?.size || "M");
        if (p.reviews) setReviews(p.reviews);
        if (p.category) fetchRelatedProducts(p.category);
      }
    } catch (error) { 
      console.log("Error fetching product detail:", error); 
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const res = await fetch(`http://localhost:8000/api/products?category=${category}`);
      const data = await res.json();
      if (data.products) setRelatedProducts(data.products);
      else if (Array.isArray(data)) setRelatedProducts(data);
    } catch (error) { 
      console.log("Error fetching related products:", error); 
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const primaryImage = product.images?.[0]?.url || product.images?.[0] || "";
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: primaryImage,
        size: selectedSize,
        quantity: quantity,
      })
    );
    dispatch(openCart());
  };

  const handleRelatedAddToCart = (e, item) => {
    e.stopPropagation();
    const primaryImage = item.images?.[0]?.url || item.images?.[0] || "";
    dispatch(
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: primaryImage,
        size: item.sizes?.[0]?.size || "M",
        quantity: 1,
      })
    );
    dispatch(openCart());
  };

  // ============================================
  // SUBMIT REVIEW TO MONGODB BACKEND
  // ============================================
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    try {
      const reviewPayload = {
        user: newReview.name, // 👈 Schema ke mutabiq 'user' field pass ki gayi hai taake original name save ho
        rating: Number(newReview.rating),
        comment: newReview.comment,
      };

      const res = await fetch(`http://localhost:8000/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewPayload),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Review submitted successfully!");
        setNewReview({ name: "", rating: 5, comment: "" });
        fetchProduct();
      } else {
        alert(data.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#C19A6B] rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium text-xs tracking-[2px] uppercase">Loading Article...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-500 font-medium text-sm">Product not found.</p>
        <Link to="/" className="bg-black text-white text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  const oldPriceVal = Number(product.oldPrice);
  const currentPriceVal = Number(product.price);
  const hasValidOldPrice = !isNaN(oldPriceVal) && oldPriceVal > 0 && oldPriceVal > currentPriceVal;

  // Sirf approved reviews ko display aur average rating ke liye filter karna
  const approvedReviews = reviews.filter((r) => r.isApproved === true);

  const averageRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1) 
    : (product.averageRating || 0);

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-12 overflow-hidden">
      
      {/* 🎯 RESPONSIVE GRID SYSTEM (Fixed alignment so text and image stay balanced) */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

        {/* 🅰️ LEFT: GALLERY (Desktop 7, Mobile 12) */}
        <div className="w-full lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          
          {/* Thumbnails */}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-24 pb-2 md:pb-0 shrink-0 custom-scrollbar">
            {product.images?.filter(Boolean).map((imgObj, index) => {
              const imgUrl = imgObj?.url || imgObj || "";
              return (
                <div
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`cursor-pointer rounded-xl overflow-hidden w-16 h-20 sm:w-20 sm:h-24 shrink-0 transition-all border ${mainImage === imgUrl ? "border-black shadow-md ring-1 ring-black" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <img src={imgUrl} alt="thumb" className="w-full h-full object-cover object-center" />
                </div>
              );
            })}
          </div>

          {/* Main Display Image */}
          <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden w-full aspect-[3/4] lg:aspect-[4/5] shadow-sm relative group">
            <img src={mainImage || product.images?.[0]?.url || product.images?.[0]} alt={product.name} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            
            {product.status && product.status !== "normal" && (
              <span className={`absolute top-4 left-4 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-md shadow-sm z-10 ${
                product.status === "sale" ? "bg-rose-600" : product.status === "new" ? "bg-[#C19A6B]" : "bg-gray-800"
              }`}>
                {product.status}
              </span>
            )}
          </div>
        </div>

        {/* 🅱️ RIGHT: CONTENT (Desktop 5, Mobile 12) */}
        <div className="w-full lg:col-span-5 flex flex-col pt-2 min-w-0">
          
          <span className="uppercase text-[11px] tracking-[3px] text-[#C19A6B] font-bold mb-2 block">
            {product.category} {product.styleType ? `| ${product.styleType}` : ""}
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-gray-900 mb-4 tracking-tight uppercase break-words">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">Rs {currentPriceVal.toLocaleString()}</span>
            {hasValidOldPrice && (
              <span className="text-base sm:text-lg text-gray-400 line-through font-medium">Rs {oldPriceVal.toLocaleString()}</span>
            )}
          </div>

          {/* Overall Rating Badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <AiFillStar key={i} className={i < Math.floor(Number(averageRating)) ? "text-amber-500" : "text-gray-300"} size={16} />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-800">{averageRating}</span>
            <span className="text-xs text-gray-400">({approvedReviews.length} customer reviews)</span>
          </div>

          {/* Description */}
          <div className="text-gray-600 text-sm leading-relaxed mb-8 font-light break-words overflow-wrap-anywhere">
            <p>{product.description || "Crafted to perfection with premium quality fabric, designed to offer supreme comfort and effortless style for every occasion."}</p>
          </div>
          
          {/* SIZES */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Select Size</h3>
                <span 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[11px] text-[#C19A6B] font-semibold cursor-pointer hover:underline"
                >
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((item, index) => (
                  <button 
                    key={index} 
                    type="button"
                    onClick={() => setSelectedSize(item.size)} 
                    className={`border px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === item.size 
                        ? "bg-black text-white border-black shadow-md" 
                        : "bg-white text-gray-800 border-gray-200 hover:border-black"
                    }`}
                  >
                    {item.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center border border-gray-200 w-fit rounded-xl overflow-hidden bg-white shadow-sm">
              <button 
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition text-gray-600 cursor-pointer"
              >
                <AiOutlineMinus />
              </button>
              <span className="w-12 text-center text-xs font-bold text-gray-900">{quantity}</span>
              <button 
                type="button"
                onClick={() => setQuantity(q => q + 1)} 
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 transition text-gray-600 cursor-pointer"
              >
                <AiOutlinePlus />
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
            <button 
              type="button"
              onClick={handleAddToCart} 
              className="flex-[2] bg-black text-white py-4 rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-800 transition shadow-lg text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <AiOutlineShoppingCart className="text-base" /> Add To Cart
            </button>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 bg-[#C19A6B] text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#a88255] transition text-xs font-bold uppercase tracking-widest shadow-md cursor-pointer"
            >
              <Sparkles size={16} /> Try On Cloth
            </button>
          </div>

          {/* ADDITIONAL DETAILS */}
          <div className="border-t border-gray-100 pt-6 text-xs text-gray-500 space-y-2 font-medium">
            <p><strong className="text-gray-900 uppercase">Style:</strong> {product.styleType || "Standard"}</p>
            <p><strong className="text-gray-900 uppercase">Category:</strong> {product.subcategory || product.category}</p>
            <p><strong className="text-gray-900 uppercase">Availability:</strong> <span className="text-emerald-600 font-bold">In Stock</span></p>
          </div>
        </div>
      </div>

      {/* RATINGS & REVIEWS SECTION */}
      <div className="mt-28 border-t border-gray-100 pt-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xl font-serif font-extrabold text-gray-900 uppercase tracking-tight">Customer Reviews ({approvedReviews.length})</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {approvedReviews.length === 0 ? (
                <p className="text-xs text-gray-400 font-light">No reviews yet or pending admin approval. Be the first to review this product!</p>
              ) : (
                approvedReviews.map((rev, index) => (
                  <div key={rev._id || index} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">{rev.user || "Anonymous"}</h4>
                      <span className="text-[10px] text-gray-400">{rev.createdAt ? rev.createdAt.split('T')[0] : ""}</span>
                    </div>
                    <div className="flex text-amber-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <AiFillStar key={i} className={i < rev.rating ? "text-amber-500" : "text-gray-300"} size={14} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Write a Review Form */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-100 p-8 rounded-3xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Rating</label>
                <select 
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Good</option>
                  <option value="3">3 Stars - Average</option>
                  <option value="2">2 Stars - Poor</option>
                  <option value="1">1 Star - Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Review Comment</label>
                <textarea 
                  rows="4"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Write your experience with this product..."
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#C19A6B] transition-colors cursor-pointer shadow-md"
              >
                Submit Review
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.filter(i => i._id !== product._id).length > 0 && (
        <div className="mt-28 border-t border-gray-100 pt-16 max-w-[1440px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2">Complete Your Look</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-900 uppercase tracking-tight">Related Products</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {relatedProducts.filter(i => i._id !== product._id).slice(0, 4).map(item => {
              const itemImg = item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/600x800?text=No+Image";
              const secondItemImg = item.images?.[1]?.url || item.images?.[1] || itemImg;
              const displayRelImg = hoveredId === item._id ? secondItemImg : itemImg;
              const itemPrice = Number(item.price);

              return (
                <div 
                  key={item._id} 
                  className="group relative flex flex-col bg-white cursor-pointer"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="relative overflow-hidden bg-gray-100 rounded-2xl w-full aspect-[3/4] shadow-sm">
                    <img src={displayRelImg} alt={item.name} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />

                    {/* Hover Action Buttons */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-[1px] bg-gray-200 shadow-2xl transition-all duration-300 z-10 ${
                        hoveredId === item._id ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleRelatedAddToCart(e, item)}
                        className="bg-[#C19A6B] hover:bg-[#a8845a] py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AiOutlineShoppingCart className="text-sm" />
                        <span>Basket</span>
                      </button>

                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/virtual-room`, { state: { product: item } });
                        }}
                        className="bg-gray-900 hover:bg-[#C19A6B] py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AiOutlineCamera className="text-sm text-[#C19A6B] group-hover:text-white" />
                        <span>Try</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 pb-1 flex flex-col flex-grow px-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#C19A6B] transition-colors uppercase tracking-tight">{item.name}</h3>
                    <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1.5">Rs {itemPrice.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Size & Measurement Guide</h3>
              <button type="button" onClick={() => setIsSizeGuideOpen(false)} className="text-gray-400 hover:text-black font-bold cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-4 font-light">All measurements are provided in inches. Please compare with your best-fitting garment.</p>
            
            <table className="w-full text-left text-xs mb-6">
              <thead>
                <tr className="border-b text-gray-400 uppercase tracking-wider">
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Chest</th>
                  <th className="pb-2">Length</th>
                  <th className="pb-2">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                <tr><td className="py-2 font-bold">S</td><td className="py-2">36-38"</td><td className="py-2">28"</td><td className="py-2">17"</td></tr>
                <tr><td className="py-2 font-bold">M</td><td className="py-2">38-40"</td><td className="py-2">29"</td><td className="py-2">18"</td></tr>
                <tr><td className="py-2 font-bold">L</td><td className="py-2">40-42"</td><td className="py-2">30"</td><td className="py-2">19"</td></tr>
                <tr><td className="py-2 font-bold">XL</td><td className="py-2">42-44"</td><td className="py-2">31"</td><td className="py-2">20"</td></tr>
              </tbody>
            </table>

            <button 
              type="button" 
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl cursor-pointer hover:bg-[#C19A6B] transition-colors"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      <TryOnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={product} />
    </section>
  );
}