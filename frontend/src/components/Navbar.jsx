import React, { useEffect, useState } from "react";
import { Menu, X, Search, Plus, Minus, ChevronDown, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, openCart, closeCart, addToCart } from "../redux/cartSlice"; 
import logo from "../assets/logo2.png"; 
import { FaWhatsapp } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate(); 
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 

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

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      if (searchQuery.trim() !== "") {
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setShowSearch(false); 
        setSearchQuery(""); 
      }
    }
  };

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">

      {/* TOP BAR */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">

          {/* MOBILE MENU BUTTON */}
          <button type="button" className="md:hidden p-2 text-gray-800 hover:text-[#C19A6B] transition cursor-pointer" onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>

          {/* LOGO */}
          <Link to="/" className="flex items-center h-full py-2">
            <img 
              src={logo} 
              alt="TryLo Logo" 
              className="h-24 sm:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105" 
            />
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8 font-semibold text-gray-800 text-sm uppercase tracking-wide relative">

            <Link
              to="/"
              className="relative group transition duration-300 hover:text-[#C19A6B]"
            >
              HOME
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#C19A6B] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* MEN */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer">
                MEN
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <div className="mb-5">
                  <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider text-[#C19A6B]">
                    Eastern
                  </h3>
                  <Link to="/shop?category=men&styleType=eastern&subcategory=kurta" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Men Kurta
                  </Link>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider text-[#C19A6B]">
                    Western
                  </h3>
                  <Link to="/shop?category=men&styleType=western&subcategory=polo" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Men Polo
                  </Link>
                  <Link to="/shop?category=men&styleType=western&subcategory=shirt" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Men Shirt
                  </Link>
                  <Link to="/shop?category=men&styleType=western&subcategory=jeans" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Men Jeans
                  </Link>
                </div>
              </div>
            </div>

            {/* WOMEN */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer">
                WOMEN
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <div className="mb-5">
                  <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider text-[#C19A6B]">
                    Eastern
                  </h3>
                  <Link to="/shop?category=women&styleType=eastern&subcategory=suit" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Women Suit
                  </Link>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider text-[#C19A6B]">
                    Western
                  </h3>
                  <Link to="/shop?category=women&styleType=western&subcategory=polo" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Women Polo
                  </Link>
                  <Link to="/shop?category=women&styleType=western&subcategory=shirt" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                    Women Shirt
                  </Link>
                </div>
              </div>
            </div>

            {/* KIDS */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-[#C19A6B] transition cursor-pointer">
                KIDS
                <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-56 bg-white shadow-2xl rounded-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 translate-y-2 group-hover:translate-y-0">
                <Link to="/shop?category=kids&subcategory=boys" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                  Boys Collection
                </Link>
                <Link to="/shop?category=kids&subcategory=girls" className="block py-2 text-xs text-gray-600 hover:text-black font-normal transition">
                  Girls Collection
                </Link>
              </div>
            </div>

            {/* SALE */}
            <Link to="/shop?productType=trending" className="text-[#C19A6B] font-semibold hover:text-red-600 transition">
              SALES
            </Link>

            {/* TRY ON CLOTH */}
            <Link to="/virtual-room" className="bg-[#C19A6B]/10 text-[#C19A6B] px-4 py-2 rounded-full hover:bg-[#C19A6B] hover:text-white transition-all duration-300 font-bold">
              TRY ON CLOTH
            </Link>

          </div>

          {/* ICONS */}
          <div className="flex items-center space-x-3 md:space-x-5">

            {/* SEARCH CONTAINER */}
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)} className="flex items-center justify-center p-2 text-gray-800 hover:text-[#C19A6B] transition cursor-pointer">
                <Search size={22} />
              </button>
              {showSearch && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit} 
                  className="absolute top-12 right-0 border border-gray-200 px-4 py-2.5 rounded-full w-56 sm:w-72 bg-white text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#C19A6B] placeholder-gray-400 shadow-xl"
                  placeholder="Search products..."
                  autoFocus
                />
              )}
            </div>

            {/* CART ICON */}
            <button className="relative p-2 text-gray-800 hover:text-[#C19A6B] transition cursor-pointer" onClick={() => dispatch(openCart())}>
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
              style={{ marginLeft: '10px', color: '#25D366', fontSize: '28px' }}
              className="flex items-center hover:scale-110 transition-transform"
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
            <div className="flex justify-between mb-5 items-center border-b border-gray-100 pb-3">
              <h2 className="font-bold text-black uppercase tracking-wider text-sm">Menu</h2>
              <X onClick={() => setIsOpen(false)} className="text-black cursor-pointer" size={20} />
            </div>
            
            {/* LINK MATRIX */}
            <div className="flex flex-col gap-4 text-black font-medium uppercase text-sm tracking-wide">
              <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-[#C19A6B] transition">Home</Link>

              {/* ⚡ MOBILE BUTTON: TRY ON CLOTH */}
              <Link to="/virtual-room" onClick={() => setIsOpen(false)} className="font-bold text-[#C19A6B]">
                Try On Cloth
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
                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider">Eastern</p>
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
                    <p className="font-semibold text-[10px] text-gray-400 uppercase tracking-wider">Eastern</p>
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