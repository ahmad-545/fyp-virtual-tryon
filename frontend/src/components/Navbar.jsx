import React, { useEffect, useState, useRef } from "react";
import { Menu, X, Search, Plus, Minus, ChevronDown, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, openCart, closeCart, addToCart } from "../redux/cartSlice"; 
import logo from "../assets/logo2.png"; 
import { FaWhatsapp } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [isScrolled, setIsScrolled] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef(null);

  // Check if current route is the homepage with the hero section
  const isHome = location.pathname === "/" || location.pathname === "/home";
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    };
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSearch]);

  // Live search debounced preview
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`http://localhost:8000/api/products?search=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        const list = data.products || data || [];
        setLiveResults(list.slice(0, 4));
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const isCartOpen = useSelector((state) => state.cart.isCartOpen);

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const handleIncreaseQuantity = (item) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const handleDecreaseQuantity = (index, currentQty) => {
    if (currentQty <= 1) {
      dispatch(removeFromCart(index));
    } else {
      dispatch({ type: "cart/decreaseQuantity", payload: index });
    }
  };

  const executeSearch = (query) => {
    const q = (typeof query === "string" ? query : searchQuery).trim();
    if (q !== "") {
      navigate(`/shop?search=${encodeURIComponent(q)}`);
      setShowSearch(false); 
      setSearchQuery("");
      setLiveResults([]);
      setIsOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      executeSearch();
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent border-b border-neutral-200/20 shadow-none backdrop-blur-[1px]"
          : "bg-white border-b border-gray-100 shadow-sm"
      }`}
    >

      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className={`md:hidden p-2 transition cursor-pointer ${
              isTransparent ? "text-gray-900 hover:text-[#C19A6B]" : "text-gray-800 hover:text-[#C19A6B]"
            }`}
            onClick={() => setIsOpen(true)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* LOGO */}
          <Link to="/" className="flex items-center h-full py-2">
            <img 
              src={logo} 
              alt="TryLo Logo" 
              className="h-20 sm:h-24 md:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105" 
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className={`hidden md:flex items-center space-x-6 lg:space-x-7 font-semibold text-sm uppercase tracking-wide relative ${
            isTransparent ? "text-gray-900" : "text-gray-800"
          }`}>

            <Link
              to="/"
              className="relative group transition duration-300 hover:text-[#C19A6B]"
            >
              HOME
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#C19A6B] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* SHOP ALL */}
            <Link
              to="/shop"
              className="relative group transition duration-300 hover:text-[#C19A6B]"
            >
              SHOP
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#C19A6B] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* MEN */}
            <div className="relative group py-2">
              <Link
                to="/shop?category=men"
                className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer"
              >
                MEN
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <Link to="/shop?category=men" className="block font-bold text-xs text-[#C19A6B] uppercase tracking-wider pb-2 mb-3 border-b border-gray-100 hover:underline">
                  All Men's Collection →
                </Link>
                <div className="mb-4">
                  <h3 className="font-bold text-gray-400 mb-2 uppercase text-[11px] tracking-wider">
                    Eastern Wear
                  </h3>
                  <Link to="/shop?category=men&styleType=eastern&subcategory=kurta" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Men Kurta
                  </Link>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 mb-2 uppercase text-[11px] tracking-wider">
                    Western Wear
                  </h3>
                  <Link to="/shop?category=men&styleType=western&subcategory=polo" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Men Polo
                  </Link>
                  <Link to="/shop?category=men&styleType=western&subcategory=shirt" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Men Shirt
                  </Link>
                  <Link to="/shop?category=men&styleType=western&subcategory=jeans" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Men Jeans
                  </Link>
                </div>
              </div>
            </div>

            {/* WOMEN */}
            <div className="relative group py-2">
              <Link
                to="/shop?category=women"
                className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer"
              >
                WOMEN
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <Link to="/shop?category=women" className="block font-bold text-xs text-[#C19A6B] uppercase tracking-wider pb-2 mb-3 border-b border-gray-100 hover:underline">
                  All Women's Collection →
                </Link>
                <div className="mb-4">
                  <h3 className="font-bold text-gray-400 mb-2 uppercase text-[11px] tracking-wider">
                    Eastern Wear
                  </h3>
                  <Link to="/shop?category=women&styleType=eastern&subcategory=suit" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Women Suit
                  </Link>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 mb-2 uppercase text-[11px] tracking-wider">
                    Western Wear
                  </h3>
                  <Link to="/shop?category=women&styleType=western&subcategory=polo" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Women Polo
                  </Link>
                  <Link to="/shop?category=women&styleType=western&subcategory=shirt" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                    Women Shirt
                  </Link>
                </div>
              </div>
            </div>

            {/* KIDS */}
            <div className="relative group py-2">
              <Link
                to="/shop?category=kids"
                className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer"
              >
                KIDS
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 w-56 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <Link to="/shop?category=kids" className="block font-bold text-xs text-[#C19A6B] uppercase tracking-wider pb-2 mb-3 border-b border-gray-100 hover:underline">
                  All Kids Collection →
                </Link>
                <Link to="/shop?category=kids&subcategory=boys" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                  Boys Collection
                </Link>
                <Link to="/shop?category=kids&subcategory=girls" className="block py-1.5 text-xs text-gray-600 hover:text-black hover:font-medium transition">
                  Girls Collection
                </Link>
              </div>
            </div>

            {/* SALE */}
            <Link to="/shop?status=sale" className="text-[#C19A6B] font-semibold hover:text-red-600 transition">
              SALES
            </Link>

            {/* TRACK ORDER */}
            <Link
              to="/track-order"
              className="relative group transition duration-300 hover:text-[#C19A6B]"
            >
              TRACK ORDER
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#C19A6B] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* TRY ON CLOTH */}
            <Link
              to="/virtual-room"
              className={`px-4 py-2 rounded-full transition-all duration-300 font-bold text-xs tracking-wider uppercase ${
                isTransparent
                  ? "bg-neutral-950 text-white hover:bg-[#C19A6B] shadow-sm"
                  : "bg-[#C19A6B]/10 text-[#C19A6B] hover:bg-[#C19A6B] hover:text-white"
              }`}
            >
              TRY ON CLOTH
            </Link>

          </div>

          {/* ICONS */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">

            {/* SEARCH CONTAINER */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`flex items-center justify-center p-2 transition cursor-pointer ${
                  showSearch
                    ? "text-[#C19A6B]"
                    : isTransparent
                    ? "text-gray-900 hover:text-[#C19A6B]"
                    : "text-gray-800 hover:text-[#C19A6B]"
                }`}
                aria-label="Search"
              >
                <Search size={22} />
              </button>

              {showSearch && (
                <div className="absolute top-14 right-0 w-[300px] sm:w-[380px] md:w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in duration-200">
                  {/* Search Bar Input */}
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchSubmit}
                      className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#C19A6B] focus:bg-white transition"
                      placeholder="Search clothes, polo, kurta, jeans..."
                      autoFocus
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => { setSearchQuery(""); setLiveResults([]); }}
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => executeSearch()}
                        className="bg-[#C19A6B] hover:bg-[#a8845a] text-white p-1.5 rounded-lg transition cursor-pointer"
                        title="Search"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Quick trending suggestions when no search query */}
                  {!searchQuery && (
                    <div className="mt-3.5 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Popular Searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Kurta", "Polo", "Shirt", "Jeans", "Suit", "Western"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => executeSearch(tag)}
                            className="text-[11px] font-medium bg-gray-100 hover:bg-[#C19A6B] hover:text-white text-gray-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Results Preview */}
                  {searchQuery && (
                    <div className="mt-3.5 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {isSearching ? "Searching..." : liveResults.length > 0 ? "Suggestions" : "Press Enter to search"}
                        </p>
                        {liveResults.length > 0 && (
                          <button
                            type="button"
                            onClick={() => executeSearch()}
                            className="text-[10px] font-bold text-[#C19A6B] hover:underline cursor-pointer"
                          >
                            View All Results →
                          </button>
                        )}
                      </div>

                      {isSearching ? (
                        <div className="py-4 flex justify-center items-center gap-2 text-xs text-gray-400">
                          <Loader2 size={16} className="animate-spin text-[#C19A6B]" />
                          <span>Searching catalog...</span>
                        </div>
                      ) : liveResults.length > 0 ? (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto">
                          {liveResults.map((item) => {
                            const img = item.images?.[0]?.url || item.images?.[0] || "";
                            return (
                              <div
                                key={item._id}
                                onClick={() => {
                                  navigate(`/product/${item._id}`);
                                  setShowSearch(false);
                                  setSearchQuery("");
                                  setLiveResults([]);
                                }}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition cursor-pointer group"
                              >
                                {img ? (
                                  <img src={img} alt={item.name} className="w-10 h-12 object-cover rounded-lg bg-gray-100" />
                                ) : (
                                  <div className="w-10 h-12 bg-gray-100 rounded-lg" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-[#C19A6B] transition-colors">
                                    {item.name}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 capitalize">
                                    {item.category} · {item.subcategory || item.styleType || "Cloth"}
                                  </p>
                                </div>
                                <span className="text-xs font-extrabold text-gray-900 shrink-0">
                                  Rs {Number(item.price || 0).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-3">
                          Press enter or click arrow to search for "{searchQuery}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CART ICON */}
            <button
              className={`relative p-2 transition cursor-pointer ${
                isTransparent ? "text-gray-900 hover:text-[#C19A6B]" : "text-gray-800 hover:text-[#C19A6B]"
              }`}
              onClick={() => dispatch(openCart())}
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={22} />
              <span className="absolute top-1 right-1 bg-[#C19A6B] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cartItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
              </span>
            </button>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/923484236919?text=Hi%20I%20want%20to%20know%20more%20about%20your%20products"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: '6px', color: '#25D366', fontSize: '28px' }}
              className="flex items-center hover:scale-110 transition-transform"
              aria-label="WhatsApp Contact"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      {/* CART SIDEBAR */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          onClick={() => dispatch(closeCart())}
        >
          <div
            className="fixed right-0 top-0 h-full w-[380px] bg-white flex flex-col shadow-2xl z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <h1 className="text-sm font-bold tracking-wider uppercase text-gray-900">Shopping Cart</h1>
              <button className="text-gray-400 hover:text-black transition p-1 cursor-pointer" onClick={() => dispatch(closeCart())}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {cartItems.length === 0 ? (
                <p className="text-gray-400 text-center mt-12 text-sm font-light">Your cart is currently empty.</p>
              ) : (
                cartItems.map((item, index) => {
                  const itemQty = item.quantity || 1;
                  return (
                    <div key={index} className="flex gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <img src={item.image} className="w-20 h-24 object-cover bg-gray-50 rounded-lg shadow-sm" alt={item.name} />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase text-gray-800 tracking-tight leading-tight pr-4">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-gray-400 mt-1">Size: {item.size}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 h-7 rounded bg-white overflow-hidden shadow-sm">
                            <button 
                              onClick={() => handleDecreaseQuantity(index, itemQty)}
                              className="px-2 text-gray-400 hover:text-black transition flex items-center justify-center h-full bg-gray-50 border-r border-gray-200 cursor-pointer"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-xs font-semibold w-7 text-center select-none text-gray-800">
                              {itemQty}
                            </span>
                            <button 
                              onClick={() => handleIncreaseQuantity(item)}
                              className="px-2 text-gray-400 hover:text-black transition flex items-center justify-center h-full bg-gray-50 border-l border-gray-200 cursor-pointer"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900">
                            Rs.{item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="w-full p-6 border-t border-gray-100 bg-white shadow-lg">
              {cartItems.length > 0 && (
                <div className="flex justify-between mb-5 font-semibold text-xs uppercase tracking-wider text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-extrabold text-sm">Rs.{totalAmount.toFixed(0)}</span>
                </div>
              )}
              <Link to="/Checkout" onClick={() => dispatch(closeCart())}>
                <button className="w-full bg-black text-white py-4 font-bold tracking-widest text-xs uppercase transition duration-300 hover:bg-[#C19A6B] rounded-xl shadow-md cursor-pointer">
                  Check Out
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 📥 RESPONSIVE MOBILE MENU DRAWER (EXACT ORIGINAL LAYOUT RESTORED) */}
      <div
        className={`fixed inset-0 bg-black/50 md:hidden z-[99999] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`bg-white w-[280px] h-full p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="flex justify-between mb-3 items-center border-b border-gray-100 pb-3">
              <h2 className="font-bold text-black uppercase tracking-wider text-sm">Menu</h2>
              <X onClick={() => setIsOpen(false)} className="text-black cursor-pointer" size={20} />
            </div>

            {/* MOBILE DRAWER SEARCH BOX */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search catalogue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-black focus:outline-none focus:border-[#C19A6B]"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* LINK MATRIX */}
            <div className="flex flex-col gap-4 text-black font-medium uppercase text-sm tracking-wide">
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-[#C19A6B] transition">Home</Link>
              
              {/* ⚡ SHOP ALL */}
              <Link to="/shop" onClick={() => setIsOpen(false)} className="hover:text-[#C19A6B] transition">
                Shop All Products
              </Link>

              {/* ⚡ MOBILE BUTTON: TRY ON CLOTH */}
              <Link to="/virtual-room" onClick={() => setIsOpen(false)} className="font-bold text-[#C19A6B]">
                Try On Cloth
              </Link>

              {/* ⚡ MOBILE BUTTON: TRACK ORDER */}
              <Link to="/track-order" onClick={() => setIsOpen(false)} className="font-semibold text-neutral-800 hover:text-[#C19A6B]">
                Track Order
              </Link>

              {/* MEN */}
              <div className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setMobileDropdown(mobileDropdown === "men" ? "" : "men")}
                  className="flex items-center justify-between w-full font-semibold cursor-pointer"
                >
                  <span>Men</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${mobileDropdown === "men" ? "rotate-180 text-[#C19A6B]" : ""}`} />
                </button>

                {mobileDropdown === "men" && (
                  <div className="pl-3 mt-2 flex flex-col gap-2 text-xs text-gray-600 font-normal normal-case">
                    <Link to="/shop?category=men" onClick={() => setIsOpen(false)} className="font-bold text-[#C19A6B] block pb-1 border-b border-gray-100">
                      All Men's Collection →
                    </Link>
                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mt-1">Eastern</p>
                    <Link to="/shop?category=men&styleType=eastern&subcategory=kurta" onClick={() => setIsOpen(false)}>Kurta</Link>

                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mt-2">Western</p>
                    <Link to="/shop?category=men&styleType=western&subcategory=polo" onClick={() => setIsOpen(false)}>Polo</Link>
                    <Link to="/shop?category=men&styleType=western&subcategory=shirt" onClick={() => setIsOpen(false)}>Shirt</Link>
                    <Link to="/shop?category=men&styleType=western&subcategory=jeans" onClick={() => setIsOpen(false)}>Jeans</Link>
                  </div>
                )}
              </div>

              {/* WOMEN */}
              <div className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setMobileDropdown(mobileDropdown === "women" ? "" : "women")}
                  className="flex items-center justify-between w-full font-semibold cursor-pointer"
                >
                  <span>Women</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${mobileDropdown === "women" ? "rotate-180 text-[#C19A6B]" : ""}`} />
                </button>

                {mobileDropdown === "women" && (
                  <div className="pl-3 mt-2 flex flex-col gap-2 text-xs text-gray-600 font-normal normal-case">
                    <Link to="/shop?category=women" onClick={() => setIsOpen(false)} className="font-bold text-[#C19A6B] block pb-1 border-b border-gray-100">
                      All Women's Collection →
                    </Link>
                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mt-1">Eastern</p>
                    <Link to="/shop?category=women&styleType=eastern&subcategory=suit" onClick={() => setIsOpen(false)}>Suit</Link>

                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider mt-2">Western</p>
                    <Link to="/shop?category=women&styleType=western&subcategory=polo" onClick={() => setIsOpen(false)}>Polo</Link>
                    <Link to="/shop?category=women&styleType=western&subcategory=shirt" onClick={() => setIsOpen(false)}>Shirt</Link>
                  </div>
                )}
              </div>

              {/* KIDS */}
              <div className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setMobileDropdown(mobileDropdown === "kids" ? "" : "kids")}
                  className="flex items-center justify-between w-full font-semibold cursor-pointer"
                >
                  <span>Kids</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${mobileDropdown === "kids" ? "rotate-180 text-[#C19A6B]" : ""}`} />
                </button>

                {mobileDropdown === "kids" && (
                  <div className="pl-3 mt-2 flex flex-col gap-2 text-xs text-gray-600 font-normal normal-case">
                    <Link to="/shop?category=kids" onClick={() => setIsOpen(false)} className="font-bold text-[#C19A6B] block pb-1 border-b border-gray-100">
                      All Kids Collection →
                    </Link>
                    <Link to="/shop?category=kids&subcategory=boys" onClick={() => setIsOpen(false)}>Boys Collection</Link>
                    <Link to="/shop?category=kids&subcategory=girls" onClick={() => setIsOpen(false)}>Girls Collection</Link>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <Link to="/shop?productType=trending" onClick={() => setIsOpen(false)} className="text-red-500 font-bold">
                  Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;