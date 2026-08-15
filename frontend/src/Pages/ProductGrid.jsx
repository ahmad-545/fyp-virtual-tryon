import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart, AiOutlineCamera } from "react-icons/ai";
import { X, SlidersHorizontal, Filter, Check } from "lucide-react"; 
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js"; 

export default function ProductGrid() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); 
  const [hoveredId, setHoveredId] = useState(null); 

  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const styleParam = searchParams.get("styleType") || "";
  const subcatParam = searchParams.get("subcategory") || "";
  const typeParam = searchParams.get("productType") || "";
  const searchQuery = searchParams.get("search") || "";

  // ============================================
  // FETCH PRODUCTS MATRIX WITH CASE-INSENSITIVE FALLBACK
  // ============================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let queryUrl = `http://localhost:8000/api/products?${searchParams.toString()}`;
      const res = await fetch(queryUrl);
      const data = await res.json();
      
      let fetchedProducts = data.products || data || [];

      // Fallback: Agar exact subcategory/style query par kuch na mile, toh category ya style par fetch karke client side match karein
      if (fetchedProducts.length === 0 && (subcatParam || styleParam || categoryParam)) {
        const fallbackUrl = `http://localhost:8000/api/products?${categoryParam ? `category=${categoryParam}` : styleParam ? `styleType=${styleParam}` : ""}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        const allCatProducts = fallbackData.products || fallbackData || [];

        fetchedProducts = allCatProducts.filter(item => {
          const matchStyle = styleParam ? item.styleType?.toLowerCase() === styleParam.toLowerCase() : true;
          const matchSubcat = subcatParam ? item.subcategory?.toLowerCase() === subcatParam.toLowerCase() : true;
          const matchCategory = categoryParam ? item.category?.toLowerCase() === categoryParam.toLowerCase() : true;
          return matchStyle && matchSubcat && matchCategory;
        });
      }

      setProducts(fetchedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Matrix compilation lookup crash:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // ============================================
  // FILTER TOGGLE HANDLERS (URL UPDATERS)
  // ============================================
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "") {
      newParams.delete(key); 
    } else {
      newParams.set(key, value);
    }
    if (key === "category") {
      newParams.delete("subcategory");
    }
    setSearchParams(newParams);
  };

  // ============================================
  // DISPATCH TO REDUX CART
  // ============================================
  const handleAddToCart = (e, item) => {
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

  // Reusable Modern Filter Element with Conditional Subcategories
  const FilterElements = () => (
    <div className="space-y-8">
      {/* HEADER TITLE */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[2px] flex items-center gap-2">
          <Filter size={14} className="text-[#C19A6B]" /> Filters
        </h3>
        {(styleParam || categoryParam || subcatParam || typeParam) && (
          <button 
            type="button"
            onClick={() => setSearchParams({})}
            className="text-[11px] text-[#C19A6B] hover:underline font-semibold uppercase tracking-wider cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* 1. PRODUCT STYLE (Eastern / Western) */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">
          Product Style
        </h4>
        <div className="space-y-2">
          {[
            { label: "All Styles", value: "" },
            { label: "Eastern Wear", value: "eastern" },
            { label: "Western Wear", value: "western" }
          ].map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleFilterChange("styleType", style.value)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                styleParam === style.value 
                  ? "bg-[#C19A6B]/10 text-[#C19A6B] font-bold shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
              }`}
            >
              <span className="text-left">{style.label}</span>
              {styleParam === style.value && <Check size={14} className="text-[#C19A6B] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. DYNAMIC SUBCATEGORIES BASED ON STYLE SELECTION */}
      {(styleParam === "western" || styleParam === "eastern" || !styleParam) && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">
            {styleParam ? `${styleParam} Options` : "Cloth Types"}
          </h4>
          <div className="flex flex-wrap gap-2">
            {(styleParam === "western" 
              ? ["polo", "shirt", "jeans"] 
              : styleParam === "eastern" 
              ? ["kurta", "suit"] 
              : ["kurta", "polo", "shirt", "jeans", "suit"]
            ).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleFilterChange("subcategory", subcatParam === sub ? "" : sub)}
                className={`text-[11px] px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                  subcatParam === sub 
                    ? "bg-[#C19A6B] text-white shadow-sm" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. CATEGORY FILTER */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">
          Category
        </h4>
        <div className="space-y-2">
          {[
            { label: "All Categories", value: "" },
            { label: "Men", value: "men" },
            { label: "Women", value: "women" },
            { label: "Kids", value: "kids" },
            { label: "Accessories", value: "accessories" }
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleFilterChange("category", cat.value)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer capitalize ${
                categoryParam === cat.value 
                  ? "bg-[#C19A6B]/10 text-[#C19A6B] font-bold shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
              }`}
            >
              <span>{cat.label}</span>
              {categoryParam === cat.value && <Check size={14} className="text-[#C19A6B] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Active Subcategory Feedback */}
      {subcatParam && (
        <div className="bg-[#C19A6B]/5 border border-[#C19A6B]/20 rounded-2xl p-4">
          <span className="text-[10px] text-[#C19A6B] font-bold uppercase tracking-wider block mb-1">Active Tag:</span>
          <span className="text-xs bg-[#C19A6B] text-white px-2.5 py-1 rounded-md capitalize font-semibold inline-block mb-3 shadow-sm">{subcatParam}</span>
          <button 
            type="button"
            onClick={() => handleFilterChange("subcategory", "")}
            className="text-[11px] text-red-600 block hover:underline font-bold transition cursor-pointer"
          >
            Clear Subcategory Filter
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-12 sm:px-6 lg:px-12 min-h-screen bg-white">
      
      {/* MOBILE FLOATING STICKY BUTTON */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button 
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="bg-black text-white text-xs font-bold tracking-[2px] uppercase px-6 py-3.5 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md bg-opacity-90 active:scale-95 transition-transform cursor-pointer"
        >
          <SlidersHorizontal size={14} className="text-[#C19A6B]" /> Filter & Sort
        </button>
      </div>

      <div className="flex gap-12">
        
        {/* DESKTOP SIDEBAR PANEL */}
        <div className="hidden lg:block w-[280px] shrink-0 border-r border-gray-100 pr-8 sticky top-28 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          <FilterElements />
        </div>

        {/* RIGHT VIEWPORT CONTAINER */}
        <div className="flex-1">
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-2xl font-serif font-extrabold text-gray-900 tracking-tight uppercase">
                {categoryParam ? `${categoryParam} Collection` : "Our Collection"}
              </h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                Showing {products.length} refined style articles
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {styleParam && <span className="bg-[#C19A6B]/10 text-[#C19A6B] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{styleParam} wear</span>}
              {typeParam && <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{typeParam} view</span>}
              {searchQuery && <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Search: "{searchQuery}"</span>}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#C19A6B] rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium text-xs tracking-[2px] uppercase">Synchronizing Display Engine...</p>
            </div>
          ) : products.length > 0 ? (
            /* Updated Grid layout: Exactly 4 cards per row on large screens */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12 sm:gap-x-6 sm:gap-y-14">
              {products.map((item) => {
                const imageUrl = item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/600x800?text=No+Image";
                const secondImageUrl = item.images?.[1]?.url || item.images?.[1] || imageUrl;
                const displayImage = hoveredId === item._id ? secondImageUrl : imageUrl;

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
                    <div className="relative overflow-hidden bg-gray-100 rounded-2xl w-full aspect-[3/4] shadow-sm">
                      <img
                        src={displayImage}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {item.status && item.status !== "normal" && (
                        <span className={`absolute top-3 left-3 text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10 ${
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
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, item)}
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-900 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                          title="Add to Basket"
                        >
                          <AiOutlineShoppingCart className="text-base" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/virtual-room`, { state: { product: item } });
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-900 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
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
                          type="button"
                          onClick={(e) => handleAddToCart(e, item)}
                          className="bg-[#C19A6B] hover:bg-[#a8845a] py-3.5 px-2 text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <AiOutlineShoppingCart className="text-sm" />
                          <span>Basket</span>
                        </button>

                        <button
                          type="button"
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
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        {item.subcategory || item.category} {item.styleType ? `| ${item.styleType}` : ""}
                      </span>

                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#C19A6B] transition-colors uppercase tracking-tight">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-2.5 mt-2">
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
            <div className="text-center py-32 border border-dashed rounded-2xl bg-gray-50/50 border-gray-200 text-gray-400 font-medium">
              No clothing articles match your requested filters matrix.
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FLOATING DRAWER PANEL SHEET */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden flex items-end animate-fadeIn" onClick={() => setIsMobileFilterOpen(false)}>
          <div 
            className="bg-white w-full rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto transform transition-transform shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#C19A6B]" /> Filter Configuration
              </h3>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <FilterElements />

            <button 
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-[2px] py-4 rounded-xl mt-4 cursor-pointer shadow-md hover:bg-[#C19A6B] transition-colors"
            >
              Apply Filter Parameters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}