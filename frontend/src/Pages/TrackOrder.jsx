import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
  Phone,
  Mail,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

const TRACKING_STEPS = [
  {
    step: 1,
    title: "Order Placed",
    subtitle: "Order verified & logged in system",
    icon: ShoppingBag,
  },
  {
    step: 2,
    title: "Quality Check & Packing",
    subtitle: "Apparel inspected at Trylo fulfillment hub",
    icon: Clock,
  },
  {
    step: 3,
    title: "Dispatched & In Transit",
    subtitle: "Handed over to Leopards / TCS Express",
    icon: Truck,
  },
  {
    step: 4,
    title: "Delivered",
    subtitle: "Safely received at shipping address",
    icon: CheckCircle2,
  },
];

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery =
    searchParams.get("id") ||
    searchParams.get("orderId") ||
    searchParams.get("email") ||
    searchParams.get("phone") ||
    "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-search if URL query param exists
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery.trim());
    }
  }, []);

  const handleSearch = async (queryVal) => {
    const q = (queryVal !== undefined ? queryVal : searchInput).trim();
    if (!q) {
      setErrorMsg("Please enter your Order ID, Email, or Phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders/track`, {
        params: { query: q },
      });

      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
        setOrdersList(res.data.orders || [res.data.order]);
        setTrackingDetails(res.data.trackingDetails || null);
        // update URL without page reload
        setSearchParams({ id: res.data.order._id });
      } else {
        setErrorMsg(res.data?.message || "Order not found.");
        setOrder(null);
        setTrackingDetails(null);
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Could not locate an order matching those details. Please check your Order ID or contact email."
      );
      setOrder(null);
      setTrackingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const selectOrderFromList = (selected) => {
    setOrder(selected);
    setSearchParams({ id: selected._id });

    // Recalculate tracking details for selected order
    const createdAt = new Date(selected.createdAt);
    const orderStatus = selected.orderStatus || "Processing";
    const estimatedMin = new Date(createdAt);
    estimatedMin.setDate(estimatedMin.getDate() + 3);
    const estimatedMax = new Date(createdAt);
    estimatedMax.setDate(estimatedMax.getDate() + 5);

    setTrackingDetails({
      courier: "Leopards Courier / TCS Express",
      trackingNumber: `TRK-${selected._id.toString().slice(-8).toUpperCase()}`,
      estimatedDelivery: `${estimatedMin.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${estimatedMax.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      currentStep:
        orderStatus === "Delivered"
          ? 4
          : orderStatus === "Shipped"
          ? 3
          : orderStatus === "Processing"
          ? 2
          : 1,
      isCancelled: orderStatus === "Cancelled",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Truck size={12} /> Out For Delivery
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-600 border border-red-500/20">
            <AlertCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#C19A6B]/15 text-[#9E7846] border border-[#C19A6B]/30">
            <Clock size={12} /> In Processing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans antialiased pb-20">
      {/* ── TOP HERO HEADER ──────────────────────── */}
      <section className="bg-neutral-950 text-white pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C19A6B_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[#C19A6B] text-[11px] font-mono uppercase tracking-[0.25em]">
            <Package size={13} />
            Real-Time Logistics
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight uppercase">
            Track Your Order
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed font-light">
            Stay updated with every stage of your wardrobe dispatch — from tailoring & packaging to doorstep delivery across Pakistan.
          </p>

          {/* ── SEARCH INPUT FORM ────────────────── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="pt-6 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1.5 shadow-2xl focus-within:border-[#C19A6B] transition-all">
              <Search size={18} className="text-neutral-500 ml-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. 6AA39F27...), Email or Phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent px-3.5 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#C19A6B] hover:bg-[#b0895b] text-black font-mono font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition duration-200 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Tracking..." : "Track"}
              </button>
            </div>

            {/* Quick helper pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-neutral-400">
              <span className="text-neutral-500">Search using:</span>
              <span className="bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono text-[10px]">
                Full Order ID
              </span>
              <span className="bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono text-[10px]">
                Last 6/8 Digits
              </span>
              <span className="bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono text-[10px]">
                Customer Email
              </span>
              <span className="bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded text-neutral-300 font-mono text-[10px]">
                Phone Number
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* ── MAIN CONTENT AREA ────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm mb-8 animate-in fade-in duration-300">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Tracking Lookup Notice</p>
              <p className="text-red-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* MULTI-ORDER TABS (If multiple orders found for an email/phone) */}
        {ordersList.length > 1 && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm mb-6">
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2.5 font-bold">
              Found {ordersList.length} orders associated with this account:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {ordersList.map((ord) => {
                const isSelected = order?._id === ord._id;
                return (
                  <button
                    key={ord._id}
                    onClick={() => selectOrderFromList(ord)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-left border transition text-xs font-mono cursor-pointer ${
                      isSelected
                        ? "bg-neutral-950 text-white border-neutral-950 shadow"
                        : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{ord._id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        ord.orderStatus === "Delivered" ? "bg-emerald-500/20 text-emerald-300" : "bg-[#C19A6B]/20 text-[#C19A6B]"
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? "text-neutral-400" : "text-neutral-500"}`}>
                      {new Date(ord.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • Rs. {ord.totalAmount.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDER DETAILS CARD ────────────────── */}
        {order && (
          <div className="space-y-6">
            {/* TOP METRICS BANNER */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#C19A6B] font-bold block mb-1">
                    Official Consignment Details
                  </span>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-neutral-900 uppercase">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>
                    <button
                      onClick={() => copyToClipboard(order._id)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-black bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 transition cursor-pointer"
                      title="Copy full Order ID"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copied ? "Copied" : "Copy ID"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    Placed on: {new Date(order.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1.5">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-xs font-mono text-neutral-500">
                    Est. Delivery: <strong className="text-neutral-900 font-bold">{trackingDetails?.estimatedDelivery || "3-5 business days"}</strong>
                  </span>
                </div>
              </div>

              {/* CANCELLED ALERT (IF APPLICABLE) */}
              {trackingDetails?.isCancelled ? (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="block font-bold">This order has been cancelled</strong>
                    <p className="text-red-700 mt-0.5">Inventory has been automatically restored. If you were charged, your refund will be processed within 3-5 business days.</p>
                  </div>
                </div>
              ) : (
                /* ── PROGRESS STEPPER ────────────────── */
                <div className="mt-8 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {TRACKING_STEPS.map((stepItem) => {
                      const Icon = stepItem.icon;
                      const currentStep = trackingDetails?.currentStep || 2;
                      const isCompleted = currentStep > stepItem.step;
                      const isCurrent = currentStep === stepItem.step;

                      return (
                        <div
                          key={stepItem.step}
                          className={`relative p-4 rounded-xl border transition-all ${
                            isCurrent
                              ? "bg-amber-500/5 border-[#C19A6B] shadow-sm ring-1 ring-[#C19A6B]/30"
                              : isCompleted
                              ? "bg-emerald-50/50 border-emerald-200/80"
                              : "bg-neutral-50/60 border-neutral-200/60 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : isCurrent
                                  ? "bg-[#C19A6B] text-black shadow-sm animate-pulse"
                                  : "bg-neutral-200 text-neutral-600"
                              }`}
                            >
                              {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                              Step 0{stepItem.step}
                            </span>
                          </div>

                          <h3 className={`text-xs font-bold uppercase tracking-tight ${
                            isCurrent ? "text-[#9E7846]" : isCompleted ? "text-emerald-950" : "text-neutral-700"
                          }`}>
                            {stepItem.title}
                          </h3>
                          <p className="text-[11px] text-neutral-500 mt-1 leading-snug font-light">
                            {stepItem.subtitle}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* COURIER INFO STRIP */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-neutral-600 bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-[#C19A6B]" />
                      <span>Logistics Partner: <strong>{trackingDetails?.courier}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Tracking Ref:</span>
                      <strong className="text-black bg-white px-2 py-0.5 rounded border border-neutral-200 font-bold">
                        {trackingDetails?.trackingNumber}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── TWO COLUMN LOWER DETAILS ───────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: ORDER ITEMS (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-bold flex items-center gap-2">
                    <ShoppingBag size={14} />
                    Package Items ({order.items?.length || 0})
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono font-medium">
                    Verified SKU Package
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                      <img
                        src={item.image || "https://placehold.co/100x120?text=Apparel"}
                        alt={item.name}
                        className="w-14 h-16 object-cover rounded-xl border border-neutral-200 bg-neutral-50 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-tight truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold uppercase bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                            Size: {item.size || "Standard"}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Qty: x{item.quantity || 1}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-neutral-900 font-mono">
                          Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-mono">
                          (Rs. {(item.price || 0).toLocaleString()} ea)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FINANCIAL TOTALS */}
                <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs font-mono text-neutral-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-neutral-900">
                      Rs. {order.totalAmount?.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Standard Express Shipping</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      FREE DELIVERY
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-black text-neutral-900 pt-3 border-t border-neutral-200">
                    <span className="uppercase tracking-wider text-xs font-bold">Gross Total</span>
                    <span className="text-[#C19A6B]">
                      Rs. {order.totalAmount?.toLocaleString()}.00
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SHIPPING & PAYMENT (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* SHIPPING PROFILE */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-bold flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <MapPin size={14} /> Shipping Destination
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">Recipient</span>
                      <p className="font-bold text-neutral-900 uppercase">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono block">Address</span>
                      <p className="text-neutral-700 leading-relaxed font-medium">
                        {order.customerInfo?.address}
                      </p>
                      <p className="text-neutral-500 font-mono">
                        {order.customerInfo?.city} - {order.customerInfo?.postalCode || "54000"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex flex-col gap-1 text-[11px] font-mono text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-[#C19A6B]" />
                        {order.customerInfo?.phone}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail size={12} className="text-[#C19A6B]" />
                        {order.customerInfo?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT SUMMARY */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-bold flex items-center gap-2 border-b border-neutral-100 pb-3">
                    <CreditCard size={14} /> Payment Status
                  </h3>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">Method</span>
                    <span className="font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">Settlement</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                    }`}>
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>

                {/* NEED HELP / SUPPORT CTA */}
                <div className="bg-neutral-950 text-white rounded-2xl p-6 shadow-sm space-y-3 border border-neutral-800">
                  <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C19A6B] font-bold flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Need Help with this Order?
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                    Have questions regarding your dispatch, delivery timing, or returns? Our customer care specialists are available 24/7.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://wa.me/923484236919?text=Hello%2C%20I%20need%20an%20update%20on%20my%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-[#C19A6B] hover:bg-[#b0895b] text-black text-[11px] font-mono font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition"
                    >
                      WhatsApp Support
                    </a>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] font-mono uppercase tracking-wider py-2.5 px-4 rounded-xl border border-neutral-800 transition"
                    >
                      Contact Page
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* BOTTOM NAV BACK TO CATALOG */}
            <div className="text-center pt-8">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-600 hover:text-black transition"
              >
                <ArrowLeft size={14} /> Back to Catalog Collection
              </Link>
            </div>
          </div>
        )}

        {/* EMPTY INITIAL STATE (NO SEARCH PERFORMED YET) */}
        {!order && !loading && !errorMsg && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Package size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 uppercase tracking-tight">
              Ready to Trace Your Package
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              Enter the Order Reference ID provided in your checkout receipt or confirmation email. You can also search using your registered email address or contact phone number.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-[#C19A6B] text-white hover:text-black px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
