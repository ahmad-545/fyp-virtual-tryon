import React, { useState } from "react";
import { ImagePlus, Plus, Trash2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function AddProduct() {
  const [files, setFiles] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    oldPrice: "",
    category: "men",
    subcategory: "",
    styleType: "eastern",
    productType: "normal",
    status: "new", // 👈 Updated default status to match model enum
    sizes: [{ size: "S", stock: "" }],
    isVirtualTryOnEnabled: false,
  });

  const handleFileChange = (i, e) => {
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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...product.sizes];
    updated[index][field] = value;

    setProduct((prev) => ({
      ...prev,
      sizes: updated,
    }));
  };

  const addSize = () => {
    setProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "S", stock: "" }],
    }));
  };

  const removeSize = (index) => {
    if (product.sizes.length === 1) return;

    const updated = product.sizes.filter((_, i) => i !== index);

    setProduct((prev) => ({
      ...prev,
      sizes: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files[0]) {
      alert("Please upload at least the primary product image (Image 1).");
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Explicitly append all regular product fields
    formData.append("name", product.name);
    formData.append("sku", product.sku);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("oldPrice", product.oldPrice || "");
    formData.append("category", product.category);
    formData.append("subcategory", product.subcategory);
    formData.append("styleType", product.styleType);
    formData.append("productType", product.productType);
    formData.append("status", product.status);
    formData.append("isVirtualTryOnEnabled", product.isVirtualTryOnEnabled);
    formData.append("sizes", JSON.stringify(product.sizes));

    // Explicitly append image files as image1, image2, image3
    if (files[0]) formData.append("image1", files[0]);
    if (files[1]) formData.append("image2", files[1]);
    if (files[2]) formData.append("image3", files[2]);

    try {
      const res = await fetch("http://localhost:8000/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Product Added Successfully!");
        setProduct({
          name: "",
          sku: "",
          description: "",
          price: "",
          oldPrice: "",
          category: "men",
          subcategory: "",
          styleType: "eastern",
          productType: "normal",
          status: "new",
          sizes: [{ size: "S", stock: "" }],
          isVirtualTryOnEnabled: false,
        });
        setFiles([null, null, null]);
        setPreviews([null, null, null]);
      } else {
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      alert("Server Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 md:px-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-yellow-300" />
              Add New Product
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Fill in the details below to list a new item in your inventory.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

          {/* Images Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Product Images (Upload up to 3 images, 1st is required)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <label
                  key={i}
                  className={`border-2 border-dashed rounded-2xl h-52 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group ${
                    previews[i]
                      ? "border-blue-500 bg-blue-50/20 shadow-md"
                      : "border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-gray-50"
                  }`}
                >
                  {previews[i] ? (
                    <>
                      <img
                        src={previews[i]}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                        alt={`Preview ${i + 1}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                        Change Image {i + 1}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <ImagePlus size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Upload Image {i + 1} {i === 0 && <span className="text-red-500">*</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(i, e)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Basic Details Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product Name *</label>
                <input
                  name="name"
                  value={product.name}
                  placeholder="e.g. Elegant Silk Kurta"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">SKU *</label>
                <input
                  name="sku"
                  value={product.sku}
                  placeholder="e.g. M-SILK-01"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Price (PKR) *</label>
                <input
                  name="price"
                  type="number"
                  value={product.price}
                  placeholder="e.g. 4500"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Old Price (Optional)</label>
                <input
                  name="oldPrice"
                  type="number"
                  value={product.oldPrice}
                  placeholder="e.g. 6000"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Category *</label>
                <select
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Subcategory *</label>
                <input
                  name="subcategory"
                  value={product.subcategory}
                  placeholder="e.g. Kurta Shalwar"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Style Type</label>
                <select
                  name="styleType"
                  value={product.styleType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="eastern">Eastern</option>
                  <option value="western">Western</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product Type</label>
                <select
                  name="productType"
                  value={product.productType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="featured">Featured</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
                <select
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white capitalize"
                >
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="sold">Sold</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Product Description *</label>
            <textarea
              name="description"
              rows={4}
              value={product.description}
              onChange={handleChange}
              placeholder="Write a detailed description about the product..."
              className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              required
            />
          </div>

          <hr className="border-gray-100" />

          {/* Sizes and Stock */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Product Sizes & Stock</h3>
                <p className="text-xs text-gray-500">Add size variants and individual available quantities.</p>
              </div>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Plus size={16} />
                Add Size
              </button>
            </div>

            <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-200">
              {product.sizes.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <select
                      value={item.size}
                      onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <input
                      type="number"
                      placeholder="Stock quantity"
                      value={item.stock}
                      onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="w-full sm:w-auto p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition"
                      title="Remove Size"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Try On Checkbox */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isVirtualTryOnEnabled"
                checked={product.isVirtualTryOnEnabled}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-gray-800 text-sm">Enable Virtual Try-On</span>
                <p className="text-xs text-gray-500">Allow customers to preview this clothing item using AI virtual try-on.</p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition text-white font-semibold px-10 py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Product
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}