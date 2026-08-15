import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag, User, Phone, MapPin, Calendar, CreditCard, AlertCircle, Loader2 } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/orders/admin/all");
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/orders/admin/update/${orderId}`, {
        orderStatus: newStatus,
      });
      if (response.data.success) {
        alert("Order status updated successfully!");
        fetchOrders(); 
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative font-sans antialiased text-gray-800">
      <style>{`
        select { accent-color: #C19A6B; }
        select option:checked { background: #C19A6B; color: white; }
      `}</style>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner - Theme Updated to #C19A6B */}
        <div className="bg-gradient-to-r from-[#C19A6B] to-[#A97A4D] px-6 py-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-white" />
              Master Orders Repository
            </h2>
            <p className="text-[#F5EBE0] text-sm mt-1">
              Track user checkouts, different billing addresses, and payment logs.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold border border-white/20">
            Total Orders: {orders.length}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-10 h-10 text-[#C19A6B] animate-spin mb-3" />
              <p className="font-medium text-sm">Loading placed orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">No Orders Found</p>
              <p className="text-xs text-gray-400 mt-1">No orders have been found inside the database collection.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-[#C19A6B]/30 transition duration-200"
                >
                  
                  {/* 1. LEFT BLOCK: CUSTOMER & DELIVERY INFO */}
                  <div className="col-span-1 lg:col-span-4 p-6 bg-gray-50/50 lg:border-r border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-[#C19A6B] text-white px-2.5 py-1 rounded-md font-mono font-bold tracking-wider shadow-sm">
                        ORD-{order._id.slice(-6).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
                        <Calendar size={13} />
                        {new Date(order.createdAt).toLocaleString("en-PK")}
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-3 text-xs text-gray-600">
                      <div className="flex items-start gap-2.5">
                        <User size={15} className="text-[#C19A6B] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-900 uppercase tracking-tight">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                          <p className="text-gray-400 text-[11px] font-mono">{order.customerInfo.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone size={15} className="text-[#C19A6B] shrink-0" />
                        <span className="font-semibold text-gray-800">{order.customerInfo.phone}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin size={15} className="text-[#C19A6B] shrink-0 mt-0.5" />
                        <p className="leading-relaxed text-gray-700">
                          <span className="font-bold text-[#C19A6B] block text-[10px] uppercase tracking-wider">Shipping Address</span>
                          {order.customerInfo.address}, {order.customerInfo.city} ({order.customerInfo.postalCode || "54000"})
                        </p>
                      </div>
                    </div>

                    {order.billingAddress && (
                      <div className="pt-3.5 border-t border-gray-200/60 text-xs text-gray-600 space-y-1">
                        <span className="font-bold text-[#C19A6B] block text-[10px] uppercase tracking-wider">Billing Address</span>
                        <p className="font-bold text-gray-900 uppercase">
                          {order.billingAddress.firstName} {order.billingAddress.lastName}
                        </p>
                        <p className="leading-relaxed text-gray-600 text-[11px]">
                          {order.billingAddress.address}, {order.billingAddress.city} ({order.billingAddress.postalCode || "54000"})
                        </p>
                      </div>
                    )}

                    <div className="pt-3.5 border-t border-gray-200/60 flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-400 flex items-center gap-1.5"><CreditCard size={13}/> Gateway:</span>
                      <span className="text-gray-900 font-bold tracking-wider text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-lg shadow-sm">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* 2. CENTER BLOCK: LISTING OF PRODUCTS */}
                  <div className="col-span-1 lg:col-span-5 p-6 space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#C19A6B] mb-1">Purchased Products ({order.items.length})</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <img 
                          src={item.image} 
                          className="w-12 h-14 object-cover rounded-xl bg-gray-50 border border-gray-200 shadow-sm shrink-0" 
                          alt={item.name} 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 uppercase tracking-tight leading-tight truncate">{item.name}</h4>
                          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                            Size: <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{item.size || "M"}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                          </p>
                        </div>
                        <span className="font-extrabold text-gray-900 text-right shrink-0">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 3. RIGHT BLOCK: PRICE BREAKDOWN & STATUS CONTROLS */}
                  <div className="col-span-1 lg:col-span-3 p-6 flex flex-col justify-between items-stretch bg-gray-50/30 lg:border-l border-gray-200 space-y-5 lg:space-y-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Gross Invoice Bill</p>
                      <p className="text-xl font-black text-gray-900 tracking-tight mt-1 flex items-baseline">
                        <span className="text-[11px] font-bold text-gray-400 mr-1.5 uppercase">PKR</span>
                        Rs. {order.totalAmount.toLocaleString()}
                      </p>
                      
                      <div className="mt-3.5 flex items-center justify-between text-xs border-b border-gray-100 pb-2.5">
                        <span className="text-gray-400 font-medium">Payment:</span>
                        <span className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md shadow-sm ${
                          order.paymentStatus === "Paid" 
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200" 
                            : "text-amber-700 bg-amber-50 border border-amber-200"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
                        Order Logistics Status
                      </label>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold border bg-white focus:outline-none cursor-pointer transition shadow-sm ${
                          order.orderStatus === "Delivered" 
                            ? "text-emerald-700 border-emerald-200 bg-emerald-50/40" 
                            : order.orderStatus === "Shipped"
                            ? "text-[#C19A6B] border-[#C19A6B]/20 bg-[#C19A6B]/5"
                            : order.orderStatus === "Cancelled"
                            ? "text-rose-700 border-rose-200 bg-rose-50/40"
                            : "text-amber-700 border-amber-200 bg-amber-50/40"
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}