import React, { useEffect, useState } from "react";
import { Search, Trash2, Edit, Package, AlertCircle, Filter, X, Plus, ImagePlus, Loader2, Star, TrendingUp } from "lucide-react";

export default function ListProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [files, setFiles] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [existingImages, setExistingImages] = useState([]);

  // ============================================
  // FETCH PRODUCTS WITH ENHANCED SEARCH LOGIC
  // ============================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8000/api/products/";
      const queryParams = [];
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      let fetchedProducts = data.products || data || [];

      // Enhanced Client-side Search Matching all fields (Name, SKU, Category, Subcategory, StyleType, Status)
      if (search) {
        const queryKeywords = search.toLowerCase().split(" ").filter(Boolean);
        fetchedProducts = fetchedProducts.filter(item => {
          const nameMatch = item.name?.toLowerCase() || "";
          const skuMatch = item.sku?.toLowerCase() || "";
          const catMatch = item.category?.toLowerCase() || "";
          const subMatch = item.subcategory?.toLowerCase() || "";
          const styleMatch = item.styleType?.toLowerCase() || "";
          const statusMatch = item.status?.toLowerCase() || "";
          
          return queryKeywords.every(keyword => 
            nameMatch.includes(keyword) || 
            skuMatch.includes(keyword) || 
            catMatch.includes(keyword) || 
            subMatch.includes(keyword) || 
            styleMatch.includes(keyword) ||
            statusMatch.includes(keyword)
          );
        });
      }

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
        alert("Product deleted successfully");
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      alert("Server Error: " + err.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      category: product.category || "men",
      subcategory: product.subcategory || "",
      styleType: product.styleType || "eastern",
      productType: product.productType || "normal",
      status: product.status || "new",
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : [{ size: "S", stock: "" }],
      isVirtualTryOnEnabled: product.isVirtualTryOnEnabled || false,
    });
    setExistingImages(product.images || []);
    setFiles([null, null, null]);
    setPreviews([null, null, null]);
  };

  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSizeChange = (index, field, value) => {
    const updated = [...editForm.sizes];
    updated[index][field] = value;
    setEditForm((prev) => ({ ...prev, sizes: updated }));
  };

  const addEditSize = () => {
    setEditForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "S", stock: "" }],
    }));
  };

  const removeEditSize = (index) => {
    if (editForm.sizes.length === 1) return;
    const updated = editForm.sizes.filter((_, i) => i !== index);
    setEditForm((prev) => ({ ...prev, sizes: updated }));
  };

  const handleEditFileChange = (i, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => {
      const arr = [...prev];
      arr[i] = file;
      return arr;
    });
    setPreviews((prev) => {
      const arr = [...prev];
      arr[i] = URL.createObjectURL(file);
      return arr;
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    const formData = new FormData();

    Object.keys(editForm).forEach((key) => {
      if (key === "sizes") {
        formData.append("sizes", JSON.stringify(editForm.sizes));
      } else {
        formData.append(key, editForm[key]);
      }
    });

    files.forEach((file, index) => {
      if (file) {
        formData.append(`image${index + 1}`, file);
      }
    });

    try {
      const res = await fetch(`http://localhost:8000/api/products/${editingProduct._id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Product Updated Successfully!");
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? data.product : p))
        );
        setEditingProduct(null);
      } else {
        alert(data.message || "Failed to update product");
      }
    } catch (err) {
      alert("Server Error: " + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const getProductImage = (item) => {
    if (!item.images || item.images.length === 0) return "https://placehold.co/100x100?text=No+Image";
    const imgObj = item.images[0];
    if (typeof imgObj === "string") return imgObj;
    return imgObj?.url || imgObj?.secure_url || "https://placehold.co/100x100?text=No+Image";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <style>{`
        select {
          accent-color: #C19A6B;
        }
        select option:checked {
          background: #C19A6B linear-gradient(0deg, #C19A6B 0%, #C19A6B 100%);
          color: white;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#C19A6B] to-[#A97A4D] px-6 py-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Package className="w-7 h-7 text-white" />
              All Products Inventory
            </h2>
            <p className="text-[#F5EBE0] text-sm mt-1">
              Manage, search, edit, and monitor your store's active product listings.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold border border-white/20">
            Total Items: {products.length}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, category, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B] transition text-sm"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <Filter className="text-gray-500 w-5 h-5 hidden sm:block" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-48 bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C19A6B] transition text-sm font-medium text-gray-700"
            >
              <option value="">All Categories</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-10 h-10 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-medium text-sm">Loading inventory items...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">No Products Found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4 font-bold">Product</th>
                      <th className="py-3 px-3 font-bold">SKU</th>
                      <th className="py-3 px-3 font-bold">Category</th>
                      <th className="py-3 px-3 font-bold">Type</th>
                      <th className="py-3 px-3 font-bold">Price</th>
                      <th className="py-3 px-3 font-bold">Stock</th>
                      <th className="py-3 px-3 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {products.map((item) => (
                      <tr key={item._id} className="hover:bg-[#C19A6B]/10 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover border border-gray-200 shadow-sm bg-gray-50 shrink-0"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate max-w-[180px]">{item.name}</p>
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded mt-0.5 uppercase font-semibold">
                              {item.styleType}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600 text-xs whitespace-nowrap">{item.sku}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="capitalize font-semibold text-gray-800 text-xs block">{item.category}</span>
                          <span className="text-[11px] text-gray-400 capitalize">{item.subcategory}</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                            item.productType === "featured" 
                              ? "bg-purple-100 text-purple-700" 
                              : item.productType === "trending" 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {item.productType === "featured" && <Star size={10} className="fill-current" />}
                            {item.productType === "trending" && <TrendingUp size={10} />}
                            {item.productType || "normal"}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-extrabold text-gray-900 text-xs">Rs. {item.price}</span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.totalStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {item.totalStock} left
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`capitalize px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            item.status === "new" ? "bg-emerald-100 text-emerald-700" :
                            item.status === "sale" ? "bg-rose-100 text-rose-700" :
                            item.status === "sold" ? "bg-gray-200 text-gray-700" : "bg-[#C19A6B]/20 text-[#C19A6B]"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1.5 bg-[#C19A6B]/10 hover:bg-[#C19A6B]/20 text-[#C19A6B] rounded-lg transition shadow-sm"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition shadow-sm"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {products.map((item) => (
                  <div key={item._id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border shrink-0 bg-gray-50"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100?text=No+Image";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                              item.productType === "featured" ? "bg-purple-100 text-purple-700" :
                              item.productType === "trending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {item.productType || "normal"}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-gray-500 mt-0.5">SKU: {item.sku}</p>
                          <p className="text-[11px] text-[#C19A6B] font-semibold capitalize mt-0.5">
                            {item.category} / {item.subcategory}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-gray-900 text-sm">Rs. {item.price}</span>
                        <span className="font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          {item.totalStock} units in stock
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <button onClick={() => handleEditClick(item)} className="py-2 bg-[#C19A6B]/10 text-[#C19A6B] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================
          EDIT PRODUCT MODAL
      =========================================== */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
                <p className="text-xs text-gray-500 mt-1">Updating ID: {editingProduct._id}</p>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="editProductForm" onSubmit={handleUpdateSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Update Images (Optional)</label>
                  <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg inline-block">
                    Note: If you upload ANY new image, all old images will be replaced. Leave empty to keep existing images.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <label key={i} className="border-2 border-dashed border-gray-300 rounded-xl h-40 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#C19A6B]">
                        {previews[i] ? (
                          <img src={previews[i]} className="w-full h-full object-cover" alt="" />
                        ) : existingImages[i] ? (
                          <img src={existingImages[i].url || existingImages[i]} className="w-full h-full object-cover opacity-60" alt="Existing" />
                        ) : (
                          <>
                            <ImagePlus className="text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500">New Image {i + 1}</span>
                          </>
                        )}
                        <input hidden type="file" accept="image/*" onChange={(e) => handleEditFileChange(i, e)} />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Product Name</label>
                    <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">SKU</label>
                    <input name="sku" value={editForm.sku} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Price</label>
                    <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Old Price</label>
                    <input type="number" name="oldPrice" value={editForm.oldPrice} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Category</label>
                    <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none bg-white">
                      <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option><option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Subcategory</label>
                    <input name="subcategory" value={editForm.subcategory} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Style / Status</label>
                    <div className="flex gap-2 mt-1">
                      <select name="styleType" value={editForm.styleType} onChange={handleEditChange} className="w-1/2 border rounded-xl p-2.5 focus:ring-2 focus:ring-[#C19A6B] outline-none bg-white">
                        <option value="eastern">Eastern</option><option value="western">Western</option>
                      </select>
                      <select name="status" value={editForm.status} onChange={handleEditChange} className="w-1/2 border rounded-xl p-2.5 focus:ring-2 focus:ring-[#C19A6B] outline-none bg-white capitalize">
                        <option value="new">New</option>
                        <option value="sale">Sale</option>
                        <option value="sold">Sold</option>
                        <option value="normal">Normal</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase">Product Type</label>
                    <select name="productType" value={editForm.productType} onChange={handleEditChange} className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none bg-white">
                      <option value="normal">Normal</option><option value="featured">Featured</option><option value="trending">Trending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Description</label>
                  <textarea name="description" rows={3} value={editForm.description} onChange={handleEditChange} className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-[#C19A6B] outline-none resize-none" required />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-sm">Sizes & Stock</h4>
                    <button type="button" onClick={addEditSize} className="text-xs bg-[#C19A6B] hover:bg-[#A97A4D] text-white px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus size={14}/> Add</button>
                  </div>
                  <div className="space-y-2">
                    {editForm.sizes.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select value={item.size} onChange={(e) => handleEditSizeChange(index, "size", e.target.value)} className="w-1/3 border rounded-lg p-2 text-sm outline-none bg-white">
                          <option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                        </select>
                        <input type="number" placeholder="Stock" value={item.stock} onChange={(e) => handleEditSizeChange(index, "stock", e.target.value)} className="w-1/3 border rounded-lg p-2 text-sm outline-none bg-white" required />
                        <button type="button" onClick={() => removeEditSize(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-[#C19A6B]/10 p-3 rounded-xl border border-[#C19A6B]/20">
                  <input type="checkbox" name="isVirtualTryOnEnabled" checked={editForm.isVirtualTryOnEnabled} onChange={handleEditChange} className="w-4 h-4 text-[#C19A6B] rounded border-gray-300 focus:ring-[#C19A6B]" />
                  <span className="text-sm font-semibold text-gray-700">Enable Virtual Try-On for this product</span>
                </label>

              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition">
                Cancel
              </button>
              <button type="submit" form="editProductForm" disabled={updateLoading} className="px-6 py-2.5 bg-[#C19A6B] hover:bg-[#A97A4D] disabled:bg-[#C19A6B]/50 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2">
                {updateLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}