import React, { useEffect, useRef, useState } from "react";
import { AiOutlineShoppingCart, AiOutlineCamera, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

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

  const slideLeft = () => sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
  const slideRight = () => sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });

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
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Modern Clean Left-Aligned Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 pb-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-[1.5px] bg-[#C19A6B]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C19A6B]">
                Handpicked Selection
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-gray-900 tracking-tight">
              Featured <span className="text-[#C19A6B] font-light">Products</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 max-w-md">
              Discover our exclusive range of premium pieces tailored for perfection.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-end pb-1">
            <Link
              to="/shop?productType=featured"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-900 hover:text-[#C19A6B] transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#C19A6B]" />
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-gray-200">
              <button
                onClick={slideLeft}
                aria-label="Previous Slide"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={slideRight}
                aria-label="Next Slide"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-10">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="w-full aspect-[3/4] bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="relative px-8">
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

          {/* Slider Container with exactly 4 cards per view setup */}
          <div 
            ref={sliderRef} 
            className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide py-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
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
                  className="group relative flex-shrink-0 w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] bg-white cursor-pointer"
                  onMouseEnter={() => setHoveredId(item._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <div className="block relative w-full overflow-hidden bg-gray-100 aspect-[3/4]">
                    <img
                      src={displayImage}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Status / Badge */}
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

                    {/* Mobile / Responsive Vertical Floating Circular Buttons */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20 sm:hidden">
                      <button
                        onClick={(e) => handleAddToCart(e, item)}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-900 flex items-center justify-center hover:bg-[#C19A6B] hover:text-white hover:scale-110 active:scale-95 transition-all duration-300"
                        title="Add to Basket"
                      >
                        <AiOutlineShoppingCart className="text-base" />
                      </button>

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
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 max-w-xl mx-auto">
          <p className="text-gray-500 text-sm font-medium">No featured products found</p>
        </div>
      )}
      </div>
    </section>
  );
}

export default Feature;