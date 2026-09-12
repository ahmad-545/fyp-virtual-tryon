import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  DollarSign
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/orders/admin/all");
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      showToast("Error loading orders data", "error");
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
        showToast(`Order status set to "${newStatus}"!`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status.", "error");
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    let revenue = 0;
    let processing = 0;
    let delivered = 0;
    let cancelled = 0;
    let shipped = 0;

    orders.forEach((o) => {
      revenue += Number(o.totalAmount) || 0;
      if (o.orderStatus === "Processing") processing++;
      else if (o.orderStatus === "Delivered") delivered++;
      else if (o.orderStatus === "Cancelled") cancelled++;
      else if (o.orderStatus === "Shipped") shipped++;
    });

    return { total, revenue, processing, delivered, cancelled, shipped };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase().trim();
      const orderIdStr = `ord-${(o._id || "").slice(-6)}`.toLowerCase();
      const fullName = `${o.customerInfo?.firstName || ""} ${o.customerInfo?.lastName || ""}`.toLowerCase();
      const email = (o.customerInfo?.email || "").toLowerCase();
      const phone = (o.customerInfo?.phone || "").toLowerCase();
      const city = (o.customerInfo?.city || "").toLowerCase();

      const matchSearch =
        !q ||
        orderIdStr.includes(q) ||
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        city.includes(q);

      const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
      const matchPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return showToast("No orders to export", "error");

    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Shipping Address",
      "City",
      "Items Count",
      "Total Amount (PKR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Date Placed"
    ];

    const rows = orders.map((o) => [
      `"ORD-${(o._id || "").slice(-6).toUpperCase()}"`,
      `"${o.customerInfo?.firstName || ""} ${o.customerInfo?.lastName || ""}"`,
      `"${o.customerInfo?.email || ""}"`,
      `"${o.customerInfo?.phone || ""}"`,
      `"${(o.customerInfo?.address || "").replace(/"/g, '""')}"`,
      `"${o.customerInfo?.city || ""}"`,
      o.items?.length || 0,
      o.totalAmount || 0,
      `"${o.paymentMethod || ""}"`,
      `"${o.paymentStatus || ""}"`,
      `"${o.orderStatus || ""}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Store_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast("Orders exported successfully as CSV!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative font-sans antialiased text-gray-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white transition-all transform animate-bounce ${
            toastMessage.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {toastMessage.type === "error" ? <XCircle size={20} /> : <CheckCircle size={20} />}
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#C19A6B] via-[#b38a59] to-[#8c673b] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <ShoppingBag size={14} /> Orders Fulfillment Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Master Orders Repository
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Track user checkouts, manage shipment logistics, review payment gateways, and fulfill orders.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 transition px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 active:scale-95 transition px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg"
          >
            <Download size={16} className="text-[#C19A6B]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</p>
          <span className="text-xs text-gray-500 mt-1 block">Lifetime store checkouts</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            PKR {stats.revenue.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">Gross booked revenue</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Processing</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{stats.processing}</p>
          <span className="text-xs text-amber-600/80 mt-1 block">Pending warehouse pack</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Shipped</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Truck size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-600 mt-2">{stats.shipped}</p>
          <span className="text-xs text-purple-600/80 mt-1 block">In transit with courier</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Delivered</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.delivered}</p>
          <span className="text-xs text-emerald-600/80 mt-1 block">Successfully completed</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-gray-100/80 p-1.5 rounded-xl gap-1 w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Orders", count: stats.total },
              { id: "Processing", label: "Processing", count: stats.processing },
              { id: "Shipped", label: "Shipped", count: stats.shipped },
              { id: "Delivered", label: "Delivered", count: stats.delivered },
              { id: "Cancelled", label: "Cancelled", count: stats.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? "bg-[#C19A6B]/15 text-[#9d7647]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Payment Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ORD-#, Name, City, Phone..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
            >
              <option value="all">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-500">
            <Loader2 className="w-10 h-10 text-[#C19A6B] animate-spin mb-3" />
            <p className="font-medium text-sm">Loading placed orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
            <AlertCircle className="w-12 h-12 mb-2 text-gray-300" />
            <p className="text-lg font-bold text-gray-700">No Orders Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              No orders matched your current search criteria or status filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 hover:border-[#C19A6B]/40 transition duration-200"
            >
              {/* 1. LEFT BLOCK: CUSTOMER & DELIVERY INFO */}
              <div className="col-span-1 lg:col-span-4 p-6 bg-gray-50/50 lg:border-r border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-[#C19A6B] text-white px-2.5 py-1 rounded-md font-mono font-bold tracking-wider shadow-sm">
                    ORD-{(order._id || "").slice(-6).toUpperCase()}
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
                      <p className="font-bold text-gray-900 uppercase tracking-tight">
                        {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                      </p>
                      <p className="text-gray-400 text-[11px] font-mono">{order.customerInfo?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-[#C19A6B] shrink-0" />
                    <span className="font-semibold text-gray-800">{order.customerInfo?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#C19A6B] shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-gray-700">
                      <span className="font-bold text-[#C19A6B] block text-[10px] uppercase tracking-wider">
                        Shipping Address
                      </span>
                      {order.customerInfo?.address}, {order.customerInfo?.city} ({order.customerInfo?.postalCode || "54000"})
                    </p>
                  </div>
                </div>

                {order.billingAddress && (
                  <div className="pt-3.5 border-t border-gray-200/60 text-xs text-gray-600 space-y-1">
                    <span className="font-bold text-[#C19A6B] block text-[10px] uppercase tracking-wider">
                      Billing Address
                    </span>
                    <p className="font-bold text-gray-900 uppercase">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </p>
                    <p className="leading-relaxed text-gray-600 text-[11px]">
                      {order.billingAddress.address}, {order.billingAddress.city} ({order.billingAddress.postalCode || "54000"})
                    </p>
                  </div>
                )}

                <div className="pt-3.5 border-t border-gray-200/60 flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <CreditCard size={13} /> Gateway:
                  </span>
                  <span className="text-gray-900 font-bold tracking-wider text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-lg shadow-sm">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* 2. CENTER BLOCK: LISTING OF PRODUCTS */}
              <div className="col-span-1 lg:col-span-5 p-6 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#C19A6B] mb-1">
                  Purchased Products ({order.items?.length || 0})
                </p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      className="w-12 h-14 object-cover rounded-xl bg-gray-50 border border-gray-200 shadow-sm shrink-0"
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 uppercase tracking-tight leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
                        Size: <span className="font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{item.size || "M"}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        Qty: <span className="font-bold text-gray-800">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-900 text-right shrink-0">
                      Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* 3. RIGHT BLOCK: PRICE BREAKDOWN & STATUS CONTROLS */}
              <div className="col-span-1 lg:col-span-3 p-6 flex flex-col justify-between items-stretch bg-gray-50/30 lg:border-l border-gray-200 space-y-5 lg:space-y-0">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Gross Invoice Bill
                  </p>
                  <p className="text-xl font-black text-gray-900 tracking-tight mt-1 flex items-baseline">
                    <span className="text-[11px] font-bold text-gray-400 mr-1.5 uppercase">PKR</span>
                    Rs. {Number(order.totalAmount || 0).toLocaleString()}
                  </p>

                  <div className="mt-3.5 flex items-center justify-between text-xs border-b border-gray-100 pb-2.5">
                    <span className="text-gray-400 font-medium">Payment:</span>
                    <span
                      className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-md shadow-sm ${
                        order.paymentStatus === "Paid"
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                          : "text-amber-700 bg-amber-50 border border-amber-200"
                      }`}
                    >
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
                        ? "text-purple-700 border-purple-200 bg-purple-50/40"
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
          ))
        )}
      </div>
    </div>
  );
}