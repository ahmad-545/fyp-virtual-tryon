import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  DollarSign,
  Search,
  RefreshCw,
  Download,
  Edit3,
  Plus,
  Minus,
  X,
  Loader2,
  Filter,
  ArrowUpDown,
  TrendingDown
} from "lucide-react";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStockUnits: 0,
    totalInventoryValue: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    healthyStockCount: 0,
  });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "low", "out", "in"
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State for Quick Restock
  const [editingProduct, setEditingProduct] = useState(null);
  const [editSizes, setEditSizes] = useState([]);
  const [savingStock, setSavingStock] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Standard sizes list
  const standardSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Inventory Data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [productsRes, summaryRes] = await Promise.all([
        axios.get("http://localhost:8000/api/products/"),
        axios.get("http://localhost:8000/api/products/inventory/summary").catch(() => null)
      ]);

      const fetchedProducts = productsRes.data.products || productsRes.data || [];
      setProducts(fetchedProducts);

      if (summaryRes && summaryRes.data && summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
      } else {
        // Fallback local calculation
        let units = 0;
        let value = 0;
        let outCount = 0;
        let lowCount = 0;

        fetchedProducts.forEach(p => {
          const st = Number(p.totalStock) || 0;
          const pr = Number(p.price) || 0;
          units += st;
          value += (st * pr);
          if (st === 0) outCount++;
          else if (st <= 5) lowCount++;
        });

        setSummary({
          totalProducts: fetchedProducts.length,
          totalStockUnits: units,
          totalInventoryValue: value,
          outOfStockCount: outCount,
          lowStockCount: lowCount,
          healthyStockCount: fetchedProducts.length - outCount - lowCount,
        });
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      showToast("Failed to fetch inventory data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search match
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      // Category match
      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;

      // Tab match
      const stock = Number(p.totalStock) || 0;
      let matchTab = true;
      if (activeTab === "low") matchTab = stock > 0 && stock <= 5;
      else if (activeTab === "out") matchTab = stock === 0;
      else if (activeTab === "in") matchTab = stock > 5;

      return matchSearch && matchCategory && matchTab;
    });
  }, [products, search, selectedCategory, activeTab]);

  // Open Quick Restock Modal
  const openRestockModal = (product) => {
    setEditingProduct(product);
    // Ensure all standard sizes exist in the edit list
    const sizeMap = {};
    (product.sizes || []).forEach(s => {
      sizeMap[s.size] = Number(s.stock) || 0;
    });

    const initialSizes = standardSizes.map(sz => ({
      size: sz,
      stock: sizeMap[sz] !== undefined ? sizeMap[sz] : 0
    }));

    setEditSizes(initialSizes);
  };

  // Adjust stock in modal
  const handleStockChange = (sizeName, delta) => {
    setEditSizes(prev =>
      prev.map(item => {
        if (item.size === sizeName) {
          const newQty = Math.max(0, (Number(item.stock) || 0) + delta);
          return { ...item, stock: newQty };
        }
        return item;
      })
    );
  };

  const handleStockDirectInput = (sizeName, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    setEditSizes(prev =>
      prev.map(item => (item.size === sizeName ? { ...item, stock: val } : item))
    );
  };

  const calculateModalTotal = () => {
    return editSizes.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
  };

  // Save Stock Update
  const handleSaveStock = async () => {
    if (!editingProduct) return;
    try {
      setSavingStock(true);
      const res = await axios.put(
        `http://localhost:8000/api/products/${editingProduct._id}/inventory`,
        { sizes: editSizes }
      );

      if (res.data.success) {
        showToast(`Stock updated for "${editingProduct.name}"!`);
        setEditingProduct(null);
        fetchInventoryData();
      }
    } catch (err) {
      console.error("Save stock error:", err);
      showToast(err.response?.data?.message || "Failed to update stock", "error");
    } finally {
      setSavingStock(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast("No products to export", "error");
      return;
    }

    const headers = ["SKU", "Name", "Category", "Price (PKR)", "XS", "S", "M", "L", "XL", "XXL", "Total Stock", "Inventory Value (PKR)", "Status"];
    
    const rows = products.map(p => {
      const sizeMap = {};
      (p.sizes || []).forEach(s => {
        sizeMap[s.size] = s.stock || 0;
      });

      const totalSt = Number(p.totalStock) || 0;
      const val = totalSt * (Number(p.price) || 0);

      return [
        `"${p.sku || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.category || ''}"`,
        p.price || 0,
        sizeMap["XS"] || 0,
        sizeMap["S"] || 0,
        sizeMap["M"] || 0,
        sizeMap["L"] || 0,
        sizeMap["XL"] || 0,
        sizeMap["XXL"] || 0,
        totalSt,
        val,
        `"${totalSt === 0 ? 'Out of Stock' : totalSt <= 5 ? 'Low Stock' : 'In Stock'}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trylo_Inventory_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Inventory report downloaded as CSV!");
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
          {toastMessage.type === "error" ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#C19A6B] via-[#b38a59] to-[#8c673b] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Boxes size={14} /> Real-Time Stock Control
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Inventory & Stock Management
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            Monitor size-wise stock levels, replenish units with instant one-click restock, and keep products synchronized.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchInventoryData}
            disabled={loading}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 transition px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 shadow-sm"
            title="Refresh Inventory"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Total Stock Units */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Units</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {summary.totalStockUnits.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">Across {summary.totalProducts} Products</span>
        </div>

        {/* Total Inventory Valuation */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Asset Valuation</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            PKR {summary.totalInventoryValue.toLocaleString()}
          </p>
          <span className="text-xs text-gray-500 mt-1 block">Stock Total Retail Value</span>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => setActiveTab("low")}
          className={`cursor-pointer bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
            activeTab === "low" ? "ring-2 ring-amber-500 border-amber-400 bg-amber-50/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Low Stock (≤ 5)</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {summary.lowStockCount}
          </p>
          <span className="text-xs text-amber-600/80 mt-1 block">Needs attention soon</span>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setActiveTab("out")}
          className={`cursor-pointer bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
            activeTab === "out" ? "ring-2 ring-rose-500 border-rose-400 bg-rose-50/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Out of Stock</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">
            {summary.outOfStockCount}
          </p>
          <span className="text-xs text-rose-600/80 mt-1 block">Unavailable to users</span>
        </div>

        {/* Healthy In-Stock */}
        <div
          onClick={() => setActiveTab("in")}
          className={`cursor-pointer bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${
            activeTab === "in" ? "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20" : "border-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">In Stock (&gt; 5)</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            {summary.healthyStockCount}
          </p>
          <span className="text-xs text-emerald-600/80 mt-1 block">Sufficient inventory</span>
        </div>
      </div>

      {/* Search, Filter & Tabs Section */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100/80 p-1.5 rounded-xl gap-1 w-full md:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Items", count: products.length },
              { id: "low", label: "Low Stock", count: summary.lowStockCount },
              { id: "out", label: "Out of Stock", count: summary.outOfStockCount },
              { id: "in", label: "In Stock", count: summary.healthyStockCount },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? "bg-[#C19A6B]/15 text-[#9d7647]"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input & Category Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by SKU, Product Name..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C19A6B] focus:bg-white transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#C19A6B]"
            >
              <option value="all">All Categories</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#C19A6B]" />
            <p className="text-sm font-medium">Loading inventory records...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-3">
              <Package size={40} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No inventory matches found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Try adjusting your search terms or filter tabs to view available items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Product & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Size Breakdown</th>
                  <th className="py-3.5 px-4 text-center">Total Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((product) => {
                  const totalSt = Number(product.totalStock) || 0;
                  const firstImg = product.images?.[0]?.url || "/placeholder.png";

                  // Check size stock status
                  const sizeMap = {};
                  (product.sizes || []).forEach(s => {
                    sizeMap[s.size] = Number(s.stock) || 0;
                  });

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Product & SKU */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImg}
                            alt={product.name}
                            className="w-12 h-14 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0 bg-gray-100"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-900 leading-tight line-clamp-1">
                              {product.name}
                            </p>
                            <span className="inline-block mt-1 font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              SKU: {product.sku || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="capitalize text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        PKR {Number(product.price || 0).toLocaleString()}
                      </td>

                      {/* Size Breakdown */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {standardSizes.map((sz) => {
                            const qty = sizeMap[sz] !== undefined ? sizeMap[sz] : 0;
                            let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            if (qty === 0) badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                            else if (qty <= 3) badgeClass = "bg-amber-50 text-amber-700 border-amber-200";

                            return (
                              <span
                                key={sz}
                                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badgeClass}`}
                                title={`Size ${sz}: ${qty} in stock`}
                              >
                                <span>{sz}:</span>
                                <span>{qty}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-base font-extrabold text-gray-900">
                          {totalSt}
                        </span>
                        <span className="text-[10px] text-gray-400 block">units</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {totalSt === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <XCircle size={12} /> Out of Stock
                          </span>
                        ) : totalSt <= 5 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={12} /> In Stock
                          </span>
                        )}
                      </td>

                      {/* Quick Restock Action */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => openRestockModal(product)}
                          className="inline-flex items-center gap-1.5 bg-[#C19A6B] hover:bg-[#b08756] active:scale-95 transition text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm"
                        >
                          <Edit3 size={14} />
                          Quick Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK RESTOCK MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#C19A6B] to-[#9d7647] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                  <Boxes size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-snug">Quick Inventory Adjustment</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{editingProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Product Info Summary */}
              <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <img
                  src={editingProduct.images?.[0]?.url || "/placeholder.png"}
                  alt={editingProduct.name}
                  className="w-14 h-16 object-cover rounded-xl border border-gray-200 bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{editingProduct.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {editingProduct.sku}</p>
                  <p className="text-xs font-semibold text-[#C19A6B] mt-0.5">
                    Price: PKR {Number(editingProduct.price).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sizes Input Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>Size & Units</span>
                  <span>Quick Increments</span>
                </div>

                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                  {editSizes.map((item) => (
                    <div key={item.size} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-10 h-8 flex items-center justify-center bg-gray-100 text-gray-800 font-bold text-xs rounded-lg font-mono">
                          {item.size}
                        </span>

                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.size, -1)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition"
                            title="Decrement 1"
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) => handleStockDirectInput(item.size, e.target.value)}
                            className="w-14 text-center font-bold text-sm text-gray-900 focus:outline-none py-1 border-x border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.size, 1)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 transition"
                            title="Increment 1"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Quick Bulk Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.size, 5)}
                          className="px-2 py-1 bg-gray-100 hover:bg-[#C19A6B]/15 hover:text-[#9d7647] transition rounded text-xs font-bold text-gray-600"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.size, 10)}
                          className="px-2 py-1 bg-gray-100 hover:bg-[#C19A6B]/15 hover:text-[#9d7647] transition rounded text-xs font-bold text-gray-600"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockDirectInput(item.size, 0)}
                          className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded transition font-bold"
                          title="Set to 0"
                        >
                          0
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time New Total Calculation */}
              <div className="bg-amber-50/70 border border-amber-200/70 p-3.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-amber-900">Total Resulting Stock:</span>
                <span className="font-extrabold text-amber-950 text-base">
                  {calculateModalTotal()} units
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                disabled={savingStock}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStock}
                disabled={savingStock}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#C19A6B] hover:bg-[#a98150] active:scale-95 rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {savingStock && <Loader2 size={16} className="animate-spin" />}
                {savingStock ? "Saving Changes..." : "Save Stock Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
