import React from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, MapPin, CreditCard, ShoppingBag, ArrowRight, ShieldAlert, PackageCheck } from "lucide-react";

function OrderConfirmation() {
  const location = useLocation();
  const orderData = location.state?.order;

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white text-gray-600 font-sans p-4">
        <div className="bg-amber-50 p-4 rounded-full mb-3 text-amber-600 border border-amber-100">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-bold text-base text-gray-900 uppercase tracking-wider">No active transaction summary found</h2>
        <p className="text-xs text-gray-400 mt-1 mb-6">We couldn't locate any recent checkout payload data.</p>
        <Link to="/" className="bg-black text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#C19A6B] transition shadow-md">
          Return to catalog homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[900px] mx-auto">
        
        {/* HEADER BLOCK NOTIFICATION SUCCESS BRAND */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center justify-center text-emerald-600 bg-emerald-50 p-4 rounded-2xl mb-1 shadow-sm border border-emerald-100">
            <CheckCircle size={40} />
          </div>
          <span className="text-[11px] text-[#C19A6B] font-bold tracking-[3px] uppercase block">Order Authenticated Successfully</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-gray-900 tracking-tight uppercase">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed font-light">
            Your tracking lifecycle sequence has been activated. A stylized invoice receipt dashboard has been compiled for your records.
          </p>
          
          {/* MASTER DATABASE TRANSACTION TRACK ID */}
          <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl shadow-lg tracking-wider mt-3">
            <PackageCheck size={16} className="text-[#C19A6B]" />
            REFERENCE MASTER ID: #{orderData._id.toString().slice(-8).toUpperCase()}
          </div>
        </div>

        {/* TWO-COLUMN LOWER BILL DETAILS WRAPPER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT INNER COMPONENT BLOCK: LOGISTICS METRICS */}
          <div className="lg:col-span-7 bg-gray-50/50 rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* User Info & Sizing Parameters Display */}
            <div className="space-y-1.5">
              <h3 className="font-bold uppercase tracking-[2px] text-[10px] text-[#C19A6B]">
                Logistics Customer Profile
              </h3>
              <p className="font-bold text-gray-900 text-sm sm:text-base uppercase tracking-tight">
                {orderData.customerInfo.firstName} {orderData.customerInfo.lastName}
              </p>
              <p className="text-gray-500 text-xs font-mono">{orderData.customerInfo.email}</p>
              <p className="text-gray-700 text-xs font-medium">{orderData.customerInfo.phone}</p>
            </div>

            {/* Complete Targeted Shipping Destinations */}
            <div className="pt-4 border-t border-gray-200/60 space-y-2">
              <span className="font-bold uppercase tracking-[2px] text-[10px] text-[#C19A6B] flex items-center gap-1.5">
                <MapPin size={13} /> Shipping Destination Address
              </span>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-medium">
                {orderData.customerInfo.address}, {orderData.customerInfo.city} ({orderData.customerInfo.postalCode || "54000"})
              </p>
            </div>

            {/* Targeted Dynamic Billing Blocks Layout Context Match */}
            {orderData.billingAddress && (
              <div className="pt-4 border-t border-gray-200/60 space-y-1.5 bg-white p-4 rounded-xl border border-dashed border-gray-200">
                <span className="font-bold uppercase tracking-[2px] text-[10px] text-[#C19A6B] block mb-1">
                  Billing Reconciliation Registry
                </span>
                <p className="font-bold text-gray-900 text-xs uppercase">
                  {orderData.billingAddress.firstName} {orderData.billingAddress.lastName}
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {orderData.billingAddress.address}, {orderData.billingAddress.city} ({orderData.billingAddress.postalCode || "54000"})
                </p>
              </div>
            )}

            {/* Gate Transaction Pipeline Methods */}
            <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <span className="text-[#C19A6B] font-bold uppercase tracking-[2px] text-[10px] flex items-center gap-1.5">
                <CreditCard size={13} /> Payment Pipeline
              </span>
              <span className="font-bold text-gray-900 text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                {orderData.paymentMethod}
              </span>
            </div>

          </div>

          {/* RIGHT INNER COMPONENT BLOCK: CHECKOUT ITEMS METRICS */}
          <div className="lg:col-span-5 bg-gray-50/50 rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-5 shadow-sm">
            <h3 className="font-bold uppercase tracking-[2px] text-[10px] text-[#C19A6B] flex items-center gap-1.5">
              <ShoppingBag size={13} /> Package Items ({orderData.items.length})
            </h3>
            
            {/* Products Data Lists Submap Rendering Loop */}
            <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
              {orderData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 text-xs border-b border-gray-200/60 pb-3 last:border-0 last:pb-0">
                  <div className="relative shrink-0 select-none">
                    <img src={item.image} className="w-12 h-14 object-cover rounded-xl bg-white border border-gray-200 shadow-sm" alt={item.name} />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 uppercase tracking-tight truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">Size: {item.size || "M"}</p>
                  </div>
                  <span className="font-extrabold text-gray-900 shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Gross Summary Valuation Invoicing Layout */}
            <div className="border-t border-gray-200/60 pt-4 text-xs space-y-2.5 text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-gray-900 font-bold">Rs. {orderData.totalAmount.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Operations</span>
                <span className="text-emerald-600 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200 items-baseline">
                <span className="uppercase tracking-wider text-xs">Gross Paid Bill</span>
                <span className="text-lg font-black text-gray-900">
                  Rs. {orderData.totalAmount.toLocaleString()}.00
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM BACK TO SHOP REDIRECT CATALYST CTA */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-xs font-bold tracking-[2px] uppercase shadow-lg hover:bg-[#C19A6B] transition duration-300 cursor-pointer"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default OrderConfirmation;