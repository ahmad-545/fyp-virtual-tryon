import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart, AiOutlineCamera } from "react-icons/ai";
import {
  X, SlidersHorizontal, Filter, Check, Search,
  LayoutGrid, List, ChevronDown, Tag, ArrowUpDown, ChevronRight
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart, openCart } from "../redux/cartSlice.js";
import socket from "../utils/socket.js";

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className="flex flex-col animate-pulse">
    <div className="aspect-[3/4] rounded-2xl bg-gray-200 w-full mb-4" />
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/3" />
  </div>
);

/* ─── Sort options ─── */
const SORT_OPTIONS = [
  { label: "Newest First",    value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Most Popular",   value: "popular" },
];

export default function ProductGrid() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  /* ── State ── */
  const [products,            setProducts]            = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [isMobileFilterOpen,  setIsMobileFilterOpen]  = useState(false);
  const [hoveredId,           setHoveredId]           = useState(null);
  const [viewMode,            setViewMode]            = useState("grid"); // "grid" | "list"
  const [sortOpen,            setSortOpen]            = useState(false);
  const [priceRange,          setPriceRange]          = useState([0, 50000]);
  const [activePriceFilter,   setActivePriceFilter]   = useState(false);
  const [sortValue,           setSortValue]           = useState("newest");
  const [localSearch,         setLocalSearch]         = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category")    || "";
  const styleParam    = searchParams.get("styleType")   || "";
  const subcatParam   = searchParams.get("subcategory") || "";
  const typeParam     = searchParams.get("productType") || "";
  const statusParam   = searchParams.get("status")      || "";
  const searchQuery   = searchParams.get("search")      || "";

  /* ── Fetch ── */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryParam) params.set("category", categoryParam);
      if (styleParam)    params.set("styleType", styleParam);
      if (subcatParam)   params.set("subcategory", subcatParam);
      if (typeParam)     params.set("productType", typeParam);
      if (statusParam)   params.set("status", statusParam);
      if (searchQuery)   params.set("search", searchQuery);

      const qs = params.toString();
      const queryUrl = qs ? `http://localhost:8000/api/products?${qs}` : `http://localhost:8000/api/products`;
      const res  = await fetch(queryUrl);
      const data = await res.json();
      let list   = data.products || data || [];

      // Flexible fallback if backend returns empty list for subcategory or casing mismatches
      if (list.length === 0 && (categoryParam || styleParam || subcatParam || searchQuery || statusParam)) {
        const r2  = await fetch(`http://localhost:8000/api/products`);
        const d2  = await r2.json();
        const all = d2.products || d2 || [];
        list = all.filter(p => {
          const matchCat = categoryParam ? p.category?.toLowerCase() === categoryParam.toLowerCase() : true;
          const matchStyle = styleParam ? p.styleType?.toLowerCase() === styleParam.toLowerCase() : true;
          const matchSub = subcatParam ? (
            (p.subcategory?.toLowerCase() || "").includes(subcatParam.toLowerCase()) ||
            subcatParam.toLowerCase().includes(p.subcategory?.toLowerCase() || "")
          ) : true;
          const matchStat = statusParam ? (
            p.status?.toLowerCase() === statusParam.toLowerCase() ||
            (statusParam === "sale" && (Number(p.oldPrice) > Number(p.price) || p.productType === "featured"))
          ) : true;
          const matchKw = searchQuery ? (
            (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.subcategory?.toLowerCase() || "").includes(searchQuery.toLowerCase())
          ) : true;
          return matchCat && matchStyle && matchSub && matchStat && matchKw;
        });
      }

      setProducts(list);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Socket.IO real-time ── */
  useEffect(() => {
    const onAdded   = ({ product }) => setProducts(p => p.find(x => x._id === product._id) ? p : [product, ...p]);
    const onUpdated = ({ product }) => setProducts(p => p.map(x => x._id === product._id ? product : x));
    const onDeleted = ({ productId }) => setProducts(p => p.filter(x => x._id !== productId.toString()));
    socket.on("product:added",   onAdded);
    socket.on("product:updated", onUpdated);
    socket.on("product:deleted", onDeleted);
    return () => {
      socket.off("product:added",   onAdded);
      socket.off("product:updated", onUpdated);
      socket.off("product:deleted", onDeleted);
    };
  }, []);

  /* ── Filter helpers ── */
  const handleFilterChange = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value === "" ? p.delete(key) : p.set(key, value);
    if (key === "category") p.delete("subcategory");
    setSearchParams(p);
  };

  const clearAll = () => {
    setSearchParams({});
    setActivePriceFilter(false);
    setPriceRange([0, 50000]);
    setSortValue("newest");
  };

  /* ── Cart ── */
  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    dispatch(addToCart({
      _id:      item._id,
      name:     item.name,
      price:    item.price,
      image:    item.images?.[0]?.url || item.images?.[0] || "",
      size:     item.sizes?.[0]?.size || "M",
      quantity: 1,
    }));
    dispatch(openCart());
  };

  /* ── Derived: sort + price filter ── */
  const activeFiltersCount = [styleParam, categoryParam, subcatParam, typeParam, searchQuery, activePriceFilter ? "price" : ""].filter(Boolean).length;

  const displayProducts = [...products]
    .filter(p => {
      if (!activePriceFilter) return true;
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    })
    .filter(p => {
      if (!localSearch) return true;
      return p.name?.toLowerCase().includes(localSearch.toLowerCase());
    })
    .sort((a, b) => {
      if (sortValue === "price_asc")  return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortValue === "price_desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0; // newest — server order
    });

  /* ── Discount % ── */
  const getDiscount = (price, old) => {
    if (!old || old <= price) return null;
    return Math.round(((old - price) / old) * 100);
  };

  /* ══════════════════════════════════════
     FILTER PANEL (shared desktop + mobile)
  ══════════════════════════════════════ */
  const FilterPanel = () => (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[2px] flex items-center gap-2">
          <Filter size={14} className="text-[#C19A6B]" /> Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-[#C19A6B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button type="button" onClick={clearAll}
            className="text-[11px] text-[#C19A6B] hover:underline font-semibold uppercase tracking-wider cursor-pointer">
            Reset All
          </button>
        )}
      </div>

      {/* In-panel search */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">Quick Search</h4>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#C19A6B] bg-gray-50 text-gray-700 placeholder-gray-400 transition"
          />
          {localSearch && (
            <button type="button" onClick={() => setLocalSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Product Style */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">Product Style</h4>
        <div className="space-y-1.5">
          {[{ label: "All Styles", value: "" }, { label: "Eastern Wear", value: "eastern" }, { label: "Western Wear", value: "western" }].map(s => (
            <button key={s.value} type="button"
              onClick={() => handleFilterChange("styleType", s.value)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                styleParam === s.value
                  ? "bg-[#C19A6B]/10 text-[#C19A6B] font-bold shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
              }`}>
              <span>{s.label}</span>
              {styleParam === s.value && <Check size={13} className="text-[#C19A6B] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">
          {styleParam ? `${styleParam} Types` : "Cloth Types"}
        </h4>
        <div className="flex flex-wrap gap-2">
          {(styleParam === "western"
            ? ["polo", "shirt", "jeans"]
            : styleParam === "eastern"
            ? ["kurta", "suit"]
            : ["kurta", "polo", "shirt", "jeans", "suit"]
          ).map(sub => (
            <button key={sub} type="button"
              onClick={() => handleFilterChange("subcategory", subcatParam === sub ? "" : sub)}
              className={`text-[11px] px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                subcatParam === sub
                  ? "bg-[#C19A6B] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
              }`}>
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">Category</h4>
        <div className="space-y-1.5">
          {[{ label: "All Categories", value: "" }, { label: "Men", value: "men" }, { label: "Women", value: "women" }, { label: "Kids", value: "kids" }, { label: "Accessories", value: "accessories" }].map(cat => (
            <button key={cat.value} type="button"
              onClick={() => handleFilterChange("category", cat.value)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer capitalize ${
                categoryParam === cat.value
                  ? "bg-[#C19A6B]/10 text-[#C19A6B] font-bold shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black font-medium"
              }`}>
              <span>{cat.label}</span>
              {categoryParam === cat.value && <Check size={13} className="text-[#C19A6B] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px]">Price Range</h4>
          {activePriceFilter && (
            <button type="button" onClick={() => { setActivePriceFilter(false); setPriceRange([0, 50000]); }}
              className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer">Clear</button>
          )}
        </div>
        <div className="px-1">
          <input type="range" min={0} max={50000} step={500}
            value={priceRange[1]}
            onChange={e => { setPriceRange([0, Number(e.target.value)]); setActivePriceFilter(true); }}
            className="w-full accent-[#C19A6B] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 mt-1.5 font-medium">
            <span>Rs 0</span>
            <span className="text-[#C19A6B] font-bold">Rs {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-[1.5px]">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {styleParam && (
              <span className="flex items-center gap-1 bg-[#C19A6B]/10 text-[#C19A6B] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {styleParam}
                <button type="button" onClick={() => handleFilterChange("styleType", "")} className="cursor-pointer"><X size={10} /></button>
              </span>
            )}
            {categoryParam && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize">
                {categoryParam}
                <button type="button" onClick={() => handleFilterChange("category", "")} className="cursor-pointer"><X size={10} /></button>
              </span>
            )}
            {subcatParam && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize">
                {subcatParam}
                <button type="button" onClick={() => handleFilterChange("subcategory", "")} className="cursor-pointer"><X size={10} /></button>
              </span>
            )}
            {activePriceFilter && (
              <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                ≤ Rs {priceRange[1].toLocaleString()}
                <button type="button" onClick={() => { setActivePriceFilter(false); setPriceRange([0, 50000]); }} className="cursor-pointer"><X size={10} /></button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════
     PRODUCT CARD
  ══════════════════════════════════════ */
  const ProductCard = ({ item }) => {
    const img1       = item.images?.[0]?.url || item.images?.[0] || "https://placehold.co/600x800?text=No+Image";
    const img2       = item.images?.[1]?.url || item.images?.[1] || img1;
    const displayImg = hoveredId === item._id ? img2 : img1;
    const currentPrice = Number(item.price)    || 0;
    const oldPrice     = Number(item.oldPrice) || 0;
    const discount     = getDiscount(currentPrice, oldPrice);
    const isSoldOut    = (Number(item.totalStock) || 0) === 0 || item.status === "sold";
    const sizes        = item.sizes?.slice(0, 4).map(s => s.size || s) || [];

    if (viewMode === "list") {
      return (
        <div
          className="group flex gap-5 bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:border-[#C19A6B]/30 transition-all duration-300"
          onClick={() => navigate(`/product/${item._id}`)}
        >
          {/* Image */}
          <div className="relative w-32 sm:w-40 shrink-0 rounded-xl overflow-hidden bg-gray-100 aspect-[3/4]"
            onMouseEnter={() => setHoveredId(item._id)}
            onMouseLeave={() => setHoveredId(null)}>
            <img src={displayImg} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {discount && <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">-{discount}%</span>}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                {item.subcategory || item.category}{item.styleType ? ` · ${item.styleType}` : ""}
              </p>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#C19A6B] transition-colors uppercase tracking-tight line-clamp-2">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 font-light">{item.description}</p>
              )}
              {sizes.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {sizes.map(sz => (
                    <span key={sz} className="text-[10px] border border-gray-200 px-2 py-0.5 rounded font-medium text-gray-500">{sz}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-gray-900">Rs {currentPrice.toLocaleString()}</span>
                {oldPrice > currentPrice && <span className="text-xs text-gray-400 line-through">Rs {oldPrice.toLocaleString()}</span>}
                {isSoldOut && <span className="text-[10px] font-bold text-rose-500 uppercase">Sold Out</span>}
              </div>
              <div className="flex gap-2">
                <button type="button"
                  disabled={isSoldOut}
                  onClick={(e) => handleAddToCart(e, item)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider transition-all ${
                    isSoldOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#C19A6B] text-white hover:bg-[#a8845a] cursor-pointer shadow-sm"
                  }`}>
                  <AiOutlineShoppingCart /> Add to Cart
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); navigate("/virtual-room", { state: { product: item } }); }}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-xl uppercase tracking-wider bg-gray-900 text-white hover:bg-[#C19A6B] transition-all cursor-pointer shadow-sm">
                  <AiOutlineCamera /> Try On
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // GRID VIEW
    return (
      <div
        key={item._id}
        className="group relative flex flex-col bg-white cursor-pointer"
        onMouseEnter={() => setHoveredId(item._id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => navigate(`/product/${item._id}`)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 rounded-2xl w-full aspect-[3/4] shadow-sm">
          <img
            src={displayImg}
            alt={item.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />


          {/* Badge */}
          {isSoldOut ? (
            <span className="absolute top-3 left-3 bg-gray-900/95 backdrop-blur-sm text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10">
              Sold Out
            </span>
          ) : discount ? (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
              -{discount}%
            </span>
          ) : item.status && item.status !== "normal" ? (
            <span className={`absolute top-3 left-3 text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10 ${
              item.status === "sale" ? "bg-rose-600" : item.status === "new" ? "bg-[#C19A6B]" : "bg-gray-800"
            }`}>
              {item.status}
            </span>
          ) : null}

          {/* Mobile floating action buttons */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20 sm:hidden">
            <button type="button" disabled={isSoldOut}
              onClick={(e) => handleAddToCart(e, item)}
              className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all ${
                isSoldOut ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70" : "bg-white/95 text-gray-900 hover:bg-[#C19A6B] hover:text-white cursor-pointer active:scale-90"
              }`}
              title="Add to Cart">
              <AiOutlineShoppingCart className="text-base" />
            </button>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); navigate("/virtual-room", { state: { product: item } }); }}
              className="w-9 h-9 rounded-full bg-black/90 shadow-lg text-white flex items-center justify-center hover:bg-[#C19A6B] transition-all cursor-pointer active:scale-90"
              title="Virtual Try-On">
              <AiOutlineCamera className="text-base" />
            </button>
          </div>

          {/* Desktop Luxury Hover Action Bar - Sleek Floating Pills with gradient */}
          <div className={`absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent hidden sm:flex items-center gap-2 transition-all duration-300 z-10 ${
            hoveredId === item._id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
          }`}>
            <button
              type="button"
              disabled={isSoldOut}
              onClick={(e) => handleAddToCart(e, item)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 whitespace-nowrap shadow-md ${
                isSoldOut
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#C19A6B] hover:bg-[#a8845a] text-white active:scale-95 cursor-pointer hover:shadow-lg"
              }`}
            >
              <AiOutlineShoppingCart className="text-sm shrink-0" />
              <span>{isSoldOut ? "Sold Out" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/virtual-room", { state: { product: item } });
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/95 hover:bg-white text-gray-900 hover:text-[#C19A6B] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
              title="Virtual Try-On"
            >
              <AiOutlineCamera className="text-sm text-[#C19A6B] shrink-0" />
              <span>Try On</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1 flex flex-col flex-grow px-0.5">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
            {item.subcategory || item.category}{item.styleType ? ` · ${item.styleType}` : ""}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-[#C19A6B] transition-colors uppercase tracking-tight">
            {item.name}
          </h3>

          {/* Sizes preview */}
          {sizes.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {sizes.map(sz => (
                <span key={sz} className="text-[9px] border border-gray-200 px-1.5 py-0.5 rounded text-gray-400 font-medium">{sz}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900">Rs {currentPrice.toLocaleString()}</span>
            {oldPrice > currentPrice && (
              <span className="text-[11px] text-gray-400 line-through">Rs {oldPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════ */
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-10 min-h-screen bg-white">

      {/* ── Mobile Filter FAB ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button type="button" onClick={() => setIsMobileFilterOpen(true)}
          className="bg-black text-white text-xs font-bold tracking-[2px] uppercase px-6 py-3.5 rounded-full flex items-center gap-2 shadow-2xl active:scale-95 transition-transform cursor-pointer">
          <SlidersHorizontal size={14} className="text-[#C19A6B]" />
          Filter & Sort
          {activeFiltersCount > 0 && (
            <span className="bg-[#C19A6B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-10 xl:gap-14">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-[260px] xl:w-[280px] shrink-0 border-r border-gray-100 pr-6 sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto">
          <FilterPanel />
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">
            <Link to="/" className="hover:text-black transition">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <Link to="/shop" className="hover:text-black transition">Shop</Link>
            {categoryParam && (
              <>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="capitalize">{categoryParam}</span>
              </>
            )}
            {styleParam && (
              <>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="capitalize">{styleParam}</span>
              </>
            )}
            {subcatParam && (
              <>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-[#C19A6B] capitalize font-bold">{subcatParam}</span>
              </>
            )}
          </nav>

          {/* Top Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-gray-900 tracking-tight capitalize">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : subcatParam
                  ? `${categoryParam ? categoryParam + " " : ""}${subcatParam}`
                  : categoryParam
                  ? `${categoryParam} Collection`
                  : styleParam
                  ? `${styleParam} Wear`
                  : "All Products"}
              </h1>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                {loading ? "Loading products..." : `${displayProducts.length} items found`}
              </p>
            </div>

            {/* Controls: Sort + View toggle */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Sort dropdown */}
              <div className="relative">
                <button type="button" onClick={() => setSortOpen(o => !o)}
                  className="flex items-center gap-2 text-xs font-semibold border border-gray-200 px-4 py-2.5 rounded-xl hover:border-[#C19A6B] transition-colors cursor-pointer bg-white shadow-sm">
                  <ArrowUpDown size={13} className="text-[#C19A6B]" />
                  <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sortValue)?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown size={13} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 w-52 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => { setSortValue(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer ${sortValue === opt.value ? "text-[#C19A6B] font-bold" : "text-gray-700"}`}>
                        {opt.label}
                        {sortValue === opt.value && <Check size={13} className="text-[#C19A6B]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button type="button" onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#C19A6B] text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                  <LayoutGrid size={15} />
                </button>
                <button type="button" onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#C19A6B] text-white" : "bg-white text-gray-400 hover:bg-gray-50"}`}>
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Subcategory Filter Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            <button
              type="button"
              onClick={() => handleFilterChange("subcategory", "")}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                !subcatParam
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
              }`}
            >
              All {styleParam ? `${styleParam}` : categoryParam ? `${categoryParam}` : "Items"}
            </button>
            {(styleParam === "western"
              ? ["polo", "shirt", "jeans"]
              : styleParam === "eastern"
              ? ["kurta", "suit"]
              : ["polo", "shirt", "jeans", "kurta", "suit"]
            ).map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => handleFilterChange("subcategory", subcatParam === sub ? "" : sub)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  subcatParam === sub
                    ? "bg-[#C19A6B] text-white shadow-sm font-bold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Active filter chips row (mobile visible) */}
          {activeFiltersCount > 0 && (
            <div className="flex gap-2 flex-wrap mb-6 lg:hidden">
              {styleParam && (
                <span className="flex items-center gap-1 bg-[#C19A6B]/10 text-[#C19A6B] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  {styleParam} <button type="button" onClick={() => handleFilterChange("styleType", "")} className="cursor-pointer"><X size={10} /></button>
                </span>
              )}
              {categoryParam && (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize">
                  {categoryParam} <button type="button" onClick={() => handleFilterChange("category", "")} className="cursor-pointer"><X size={10} /></button>
                </span>
              )}
              {subcatParam && (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize">
                  {subcatParam} <button type="button" onClick={() => handleFilterChange("subcategory", "")} className="cursor-pointer"><X size={10} /></button>
                </span>
              )}
              <button type="button" onClick={clearAll} className="text-[10px] text-rose-500 font-bold underline cursor-pointer">Clear all</button>
            </div>
          )}

          {/* Products grid / list / loading / empty */}
          {loading ? (
            <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-5 gap-y-10"}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className={
              viewMode === "list"
                ? "flex flex-col gap-4"
                : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12"
            }>
              {displayProducts.map(item => <ProductCard key={item._id} item={item} />)}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Tag size={36} className="text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No products found</h3>
                <p className="text-sm text-gray-400 max-w-xs">Try adjusting your filters or search term to find what you're looking for.</p>
              </div>
              <button type="button" onClick={clearAll}
                className="mt-2 px-6 py-3 bg-[#C19A6B] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#a8845a] transition-colors cursor-pointer shadow-sm">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden flex items-end" onClick={() => setIsMobileFilterOpen(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-6 max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#C19A6B]" /> Filters & Sort
              </h3>
              <button type="button" onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Sort (mobile inline) */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[1.5px]">Sort By</h4>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setSortValue(opt.value)}
                    className={`py-2.5 px-3 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer text-left ${
                      sortValue === opt.value
                        ? "border-[#C19A6B] bg-[#C19A6B]/10 text-[#C19A6B]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <FilterPanel />

            <button type="button" onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-black text-white text-xs font-bold uppercase tracking-[2px] py-4 rounded-xl cursor-pointer shadow-md hover:bg-[#C19A6B] transition-colors">
              Show {displayProducts.length} Results
            </button>
          </div>
        </div>
      )}

      {/* Close sort dropdown on outside click */}
      {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
    </div>
  );
}