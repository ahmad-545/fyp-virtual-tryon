import React, { useEffect, useState } from "react";
import { AiOutlineShoppingCart, AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js";

export default function Trending() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================
  // FETCH TRENDING PRODUCTS
  // ============================================
  const fetchTrending = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/products?productType=trending");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (error) {
      console.log("Error fetching trending products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    const primaryImage = item.images?.[0]?.url || item.images?.[0] || "";
    dispatch(
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: primaryImage,
        size: item.sizes?.[0]?.size || "",
        quantity: 1,
      })
    );
    dispatch(openCart());
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-white">
      {/* Modern Stylish Header Matching Theme */}
      <div className="text-center mb-16 relative">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2">
          This Season's Highlights
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 tracking-tight">
          Trending <span className="text-[#C19A6B] font-light italic">Products</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
          <div className="w-2 h-2 rounded-full bg-[#C19A6B]" />
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-light mt-3 max-w-sm mx-auto tracking-wide">
          Explore our most-coveted styles, handpicked to elevate your everyday wardrobe.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="w-full aspect-[3/4] bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        /* Products Grid - 4 items per row on large screens */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
          {products.map((item) => {
            const imageUrl = item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/600x800?text=No+Image";
            const secondImageUrl = item.images?.[1]?.url || item.images?.[1] || imageUrl;

            const oldPriceVal = Number(item.oldPrice);
            const currentPriceVal = Number(item.price);
            const hasValidOldPrice = !isNaN(oldPriceVal) && oldPriceVal > 0 && oldPriceVal > currentPriceVal;

            return (
              <div
                key={item._id}
                className="group relative flex flex-col bg-white cursor-pointer"
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                {/* Full Width Edge-to-Edge Image Container */}
                <div className="block relative w-full overflow-hidden bg-gray-100 aspect-[3/4]">
                  <img
                    src={hoveredId === item._id ? secondImageUrl : imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Dynamic Status / Badge */}
                  {item.status && item.status !== "normal" && (
                    <span className={`absolute top-2.5 left-2.5 text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded shadow-sm z-10 ${
                      item.status === "sale" 
                        ? "bg-rose-600" 
                        : item.status === "new" 
                        ? "bg-[#C19A6B]" 
                        : "bg-gray-800"
                    }`}>
                      {item.status}
                    </span>
                  )}

                  {/* Mobile / Responsive Vertical Floating Circular Buttons with Hover Effect */}
                  <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20 sm:hidden">
                    {/* Add to Cart Circular Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-900 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
                      title="Add to Basket"
                    >
                      <AiOutlineShoppingCart className="text-base" />
                    </button>

                    {/* Virtual Try-On Circular Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/virtual-room`, { state: { product: item } });
                      }}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-900 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
                      title="Virtual Try-On"
                    >
                      <AiOutlineCamera className="text-base" />
                    </button>
                  </div>

                  {/* Desktop Hover Action Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 hidden sm:grid grid-cols-2 gap-[1px] bg-gray-200 shadow-2xl transition-all duration-300 z-10 ${
                      hoveredId === item._id ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="bg-[#C19A6B] hover:bg-[#a8845a] py-3 px-2 text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors"
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

                {/* Product Info Section */}
                <div className="pt-3 pb-1 flex flex-col flex-grow">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">
                    {item.subcategory || item.category} {item.styleType ? `| ${item.styleType}` : ""}
                  </span>
                  
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#C19A6B] transition-colors uppercase tracking-tight">
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-900">Rs {currentPriceVal.toLocaleString()}</span>
                    {hasValidOldPrice && (
                      <span className="text-[11px] text-gray-400 line-through">Rs {oldPriceVal.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 max-w-xl mx-auto">
          <p className="text-gray-500 text-sm font-medium">No trending products available right now.</p>
        </div>
      )}
    </section>
  );
}