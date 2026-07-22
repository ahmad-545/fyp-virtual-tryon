import React, { useEffect, useRef, useState } from "react";
import { AiOutlineShoppingCart, AiOutlineCamera, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js";
import { useNavigate } from "react-router-dom";

function Feature() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const sliderRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================
  // FETCH FEATURED PRODUCTS
  // ============================================
  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/products?productType=featured");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (error) {
      console.log("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFeatured(); 
  }, []);

  const slideLeft = () => sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
  const slideRight = () => sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });

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
    <section className="py-20 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden">
      {/* Modern Stylish Header Matching Theme */}
      <div className="text-center mb-16 relative">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#C19A6B] block mb-2">
          Handpicked Selection
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 tracking-tight">
          Featured <span className="text-[#C19A6B] font-light italic">Products</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
          <div className="w-2 h-2 rounded-full bg-[#C19A6B]" />
          <div className="w-8 h-[1px] bg-[#C19A6B]/40" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-light mt-3 max-w-sm mx-auto tracking-wide">
          Discover our exclusive range of premium pieces tailored for perfection.
        </p>
      </div>

      {loading ? (
        <div className="flex gap-5 overflow-hidden px-12">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="min-w-[220px] sm:min-w-[250px] animate-pulse">
              <div className="w-full h-[320px] sm:h-[350px] bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="relative">
          {/* Slider Controls */}
          <button
            onClick={slideLeft}
            className="absolute left-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-[#C19A6B] hover:text-white transition duration-300"
          >
            <AiOutlineLeft className="text-[16px]" />
          </button>
          <button
            onClick={slideRight}
            className="absolute right-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-[#C19A6B] hover:text-white transition duration-300"
          >
            <AiOutlineRight className="text-[16px]" />
          </button>

          {/* Slider Container */}
          <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide px-10 py-4">
            {products.map((item) => {
              const imageUrl = item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/600x800?text=No+Image";
              const secondImageUrl = item.images?.[1]?.url || item.images?.[1] || imageUrl;
              const displayImage = hoveredId === item._id ? secondImageUrl : imageUrl;

              // Strict validation for valid oldPrice
              const oldPriceVal = Number(item.oldPrice);
              const currentPriceVal = Number(item.price);
              const hasValidOldPrice = !isNaN(oldPriceVal) && oldPriceVal > 0 && oldPriceVal > currentPriceVal;

              return (
                <div
                  key={item._id}
                  className="group relative min-w-[220px] sm:min-w-[250px] md:min-w-[270px] flex-shrink-0 bg-white rounded-xl overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="relative overflow-hidden bg-gray-100 rounded-xl w-full h-[320px] sm:h-[350px]">
                    <img
                      src={displayImage}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                    />

                    {/* Status / Badge */}
                    {item.status && item.status !== "normal" && (
                      <span className={`absolute top-2.5 left-2.5 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm z-10 ${
                        item.status === "sale" 
                          ? "bg-rose-600" 
                          : item.status === "new" 
                          ? "bg-[#C19A6B]" 
                          : "bg-gray-800"
                      }`}>
                        {item.status}
                      </span>
                    )}

                    {/* Slide-up Action Buttons Bar on Hover */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-[1px] bg-gray-200 shadow-2xl transition-all duration-300 z-10 ${
                        hoveredId === item._id ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                      }`}
                    >
                      {/* Add to Basket Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, item)}
                        className="bg-[#C19A6B] hover:bg-[#a8845a] py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1 transition-colors"
                      >
                        <AiOutlineShoppingCart className="text-sm" />
                        <span>Basket</span>
                      </button>

                      {/* Try Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${item._id}`);
                        }}
                        className="bg-gray-900 hover:bg-black py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1 transition-colors"
                      >
                        <AiOutlineCamera className="text-sm" />
                        <span>Try</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Info Section */}
                  <div className="pt-3 px-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-0.5">
                      {item.subcategory || item.category} {item.styleType ? `| ${item.styleType}` : ""}
                    </span>

                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#C19A6B] transition-colors uppercase tracking-tight">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
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
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 max-w-xl mx-auto">
          <p className="text-gray-500 text-sm font-medium">No featured products found</p>
        </div>
      )}
    </section>
  );
}

export default Feature;