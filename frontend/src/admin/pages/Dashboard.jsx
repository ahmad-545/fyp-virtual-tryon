import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch products and orders simultaneously
        const [productsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:8000/api/products/"),
          axios.get("http://localhost:8000/api/orders/admin/all")
        ]);

        const products = productsRes.data.products || [];
        const orders = ordersRes.data.orders || [];

        // Calculate metrics
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        const pending = orders.filter(o => o.orderStatus === "Processing").length;
        const delivered = orders.filter(o => o.orderStatus === "Delivered").length;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          revenue: totalRevenue,
          pendingOrders: pending,
          deliveredOrders: delivered,
        });

        // Get top 5 recent orders
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      bg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      bg: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      bg: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      bg: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="font-medium text-sm tracking-widest uppercase">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-gray-800">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 md:px-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-yellow-300" />
            Admin Dashboard
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Welcome back! Here's your store's live performance overview.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold border border-white/20">
          Store Status: <span className="text-emerald-300 font-bold">Active</span>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm border ${card.border} p-6 hover:shadow-md transition`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h2 className="text-2xl font-black text-gray-900 mt-2">
                    {card.value}
                  </h2>
                </div>
                <div className={`${card.bg} p-3.5 rounded-2xl`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE SECTION: STATS & PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Overview Banner */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">Sales Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time performance metrics tracking</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-100">
              <TrendingUp size={16} />
              +18% Growth
            </div>
          </div>

          <div className="h-60 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <TrendingUp size={24} />
            </div>
            <p className="font-bold text-gray-700 text-sm">Analytics Stream Operational</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              All transactions and database logs are synchronizing smoothly with your store server.
            </p>
          </div>
        </div>

        {/* Quick Stats Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col justify-between">
          <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight mb-6">Quick Metrics</h2>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                <span>Total Inventory Items</span>
                <span className="text-blue-600">{stats.totalProducts}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full w-[70%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                <span>Delivered Orders</span>
                <span className="text-emerald-600">{stats.deliveredOrders}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                <span>Pending Processing</span>
                <span className="text-amber-600">{stats.pendingOrders}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full w-[35%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                <span>Target Completion</span>
                <span className="text-purple-600">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">Recent Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest customer checkouts registered in system</p>
          </div>
          <Link 
            to="/admin/orders" 
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            View All <ArrowUpRight size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle className="w-10 h-10 mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No Recent Orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white text-sm">
              <thead className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 font-bold">Order ID</th>
                  <th className="py-3 px-6 font-bold">Customer Name</th>
                  <th className="py-3 px-6 font-bold">Amount</th>
                  <th className="py-3 px-6 font-bold">Payment Status</th>
                  <th className="py-3 px-6 font-bold">Logistics Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50/20 transition">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-gray-700">
                      ORD-{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 uppercase text-xs">
                      {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-900 text-xs">
                      Rs. {order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === "Paid" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        order.orderStatus === "Delivered" 
                          ? "bg-green-100 text-green-700" 
                          : order.orderStatus === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "Cancelled"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.orderStatus === "Delivered" && <CheckCircle size={12} />}
                        {order.orderStatus === "Shipped" && <Truck size={12} />}
                        {order.orderStatus || "Processing"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;