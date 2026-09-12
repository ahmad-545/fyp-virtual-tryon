import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Mail,
  ShoppingBag,
  Trash2,
  Search,
  Download,
  Calendar,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function AdminCustomers() {
  const [activeTab, setActiveTab] = useState("subscribers"); // "subscribers" or "customers"
  const [subscribers, setSubscribers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, ordRes] = await Promise.all([
        axios.get("http://localhost:8000/api/subscribers/all").catch(() => ({ data: { subscribers: [] } })),
        axios.get("http://localhost:8000/api/orders/admin/all").catch(() => ({ data: { orders: [] } }))
      ]);

      setSubscribers(subRes.data.subscribers || []);
      setOrders(ordRes.data.orders || []);
    } catch (err) {
      console.error("Fetch data error:", err);
      showToast("Error loading customer data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process unique customers from orders
  const customerList = useMemo(() => {
    const customerMap = {};

    orders.forEach((order) => {
      const email = order.customerInfo?.email || order.customerInfo?.emailOrPhone || "Unknown";
      const key = email.toLowerCase().trim();

      if (!customerMap[key]) {
        customerMap[key] = {
          email,
          name: `${order.customerInfo?.firstName || ""} ${order.customerInfo?.lastName || ""}`.trim() || "Guest Customer",
          phone: order.customerInfo?.phone || "N/A",
          city: order.customerInfo?.city || "N/A",
          address: order.customerInfo?.address || "N/A",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
        };
      }

      customerMap[key].totalOrders += 1;
      customerMap[key].totalSpent += Number(order.totalAmount) || 0;
      if (new Date(order.createdAt) > new Date(customerMap[key].lastOrderDate)) {
        customerMap[key].lastOrderDate = order.createdAt;
      }
    });

    return Object.values(customerMap);
  }, [orders]);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    if (!search) return subscribers;
    const q = search.toLowerCase();
    return subscribers.filter((s) => s.email && s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!search) return customerList;
    const q = search.toLowerCase();
    return customerList.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
    );
  }, [customerList, search]);

  // Delete subscriber
  const handleDeleteSubscriber = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove "${email}" from subscribers?`)) return;
    try {
      const res = await axios.delete(`http://localhost:8000/api/subscribers/${id}`);
      if (res.data.success) {
        showToast("Subscriber removed successfully.");
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Delete subscriber error:", err);
      showToast("Failed to remove subscriber.", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (activeTab === "subscribers") {
      if (subscribers.length === 0) return showToast("No subscribers to export", "error");
      const headers = ["Email", "Subscribed Date"];
      const rows = subscribers.map((s) => [
        `"${s.email}"`,
        `"${new Date(s.createdAt).toLocaleDateString()}"`,
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `Subscribers_List_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      if (customerList.length === 0) return showToast("No customers to export", "error");
      const headers = ["Name", "Email", "Phone", "City", "Total Orders", "Total Spent (PKR)", "Last Order Date"];
      const rows = customerList.map((c) => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.city}"`,
        c.totalOrders,
        c.totalSpent,
        `"${new Date(c.lastOrderDate).toLocaleDateString()}"`,
      ]);
      const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = `Customers_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
    showToast("Export downloaded successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans antialiased text-gray-800">
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
            <Users size={14} /> CRM & Audience Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Customers & Subscribers
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Manage newsletter subscribers, view buyer history, and analyze customer engagement.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchData}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Newsletter Subscribers</span>
            <div className="p-2.5 bg-amber-50 text-[#C19A6B] rounded-xl">
              <Mail size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{subscribers.length}</p>
          <span className="text-xs text-gray-500 mt-1 block">Active email subscriptions</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Unique Order Customers</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">{customerList.length}</p>
          <span className="text-xs text-gray-500 mt-1 block">Customers with placed orders</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Store Orders</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{orders.length}</p>
          <span className="text-xs text-gray-500 mt-1 block">Lifetime orders recorded</span>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-gray-100 p-1.5 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => { setActiveTab("subscribers"); setSearch(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "subscribers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Mail size={15} />
            Newsletter Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => { setActiveTab("customers"); setSearch(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "customers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Users size={15} />
            Order Customers ({customerList.length})
          </button>
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "subscribers" ? "Search email..." : "Search name, phone, city..."}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C19A6B]" />
            <p className="text-sm font-medium">Loading data...</p>
          </div>
        ) : activeTab === "subscribers" ? (
          filteredSubscribers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No subscribers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3.5 px-6">Subscriber Email</th>
                    <th className="py-3.5 px-6">Subscribed Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredSubscribers.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#C19A6B]/15 text-[#9d7647] flex items-center justify-center font-bold text-xs">
                          {item.email?.[0]?.toUpperCase()}
                        </div>
                        {item.email}
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(item._id, item.email)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Subscriber"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredCustomers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3.5 px-6">Customer Name & Email</th>
                    <th className="py-3.5 px-6">Contact & Location</th>
                    <th className="py-3.5 px-6 text-center">Total Orders</th>
                    <th className="py-3.5 px-6 text-center">Total Spent</th>
                    <th className="py-3.5 px-6 text-right">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredCustomers.map((cust, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{cust.name}</p>
                        <span className="text-xs text-gray-500">{cust.email}</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{cust.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate max-w-xs">{cust.city}, {cust.address}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-xs">
                          {cust.totalOrders} {cust.totalOrders === 1 ? "order" : "orders"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-700">
                        PKR {cust.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-gray-500">
                        {new Date(cust.lastOrderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
