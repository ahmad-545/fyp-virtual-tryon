import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Search, Check, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const TryOnModel = ({ isOpen = true, onClose, product }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get product if passed via router state from product card
  const routeProduct = location.state?.product || product;

  const [allProducts, setAllProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [activeProduct, setActiveProduct] = useState(routeProduct);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [aiResult, setAiResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // 🌐 FETCH ALL PRODUCTS ON MATRIX OPEN
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        setFetching(true);
        const res = await axios.get("http://localhost:8000/api/products/");
        const data = res.data;
        
        if (data.success && Array.isArray(data.products)) {
          const reversedData = [...data.products].reverse();
          setAllProducts(reversedData);
          setFilteredProducts(reversedData); 
          
          if (!activeProduct && reversedData.length > 0) {
            setActiveProduct(reversedData[0]);
          }
        }
      } catch (error) {
        console.error("Express router sync failure inside TryOnModel:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchLiveProducts();
  }, []);

  // ⚡ DYNAMIC LIVE ENGINE FILTER MATRIX
  useEffect(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    
    if (cleanQuery === "") {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter((item) => {
        return (
          item.name?.toLowerCase().includes(cleanQuery) ||
          item.category?.toLowerCase().includes(cleanQuery) ||
          item.subcategory?.toLowerCase().includes(cleanQuery) ||
          item.styleType?.toLowerCase().includes(cleanQuery) ||
          item.productType?.toLowerCase().includes(cleanQuery)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    if (routeProduct) {
      setActiveProduct(routeProduct);
    }
  }, [routeProduct]);

  if (isOpen === false) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ⚡ DYNAMIC TRY-ON ENGINE
  const handleTryOnSubmit = async () => {
    if (!selectedFile) return alert("Please upload or capture a profile photo first.");
    if (!activeProduct) return alert("Please select a target apparel item first.");

    setLoading(true);
    setAiResult(null); 

    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("upload_preset", "your_cloudinary_preset_name"); 

      const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", { 
        method: "POST",
        body: uploadData,
      });
      
      const uploadedImage = await cloudinaryRes.json();
      const userCloudinaryUrl = uploadedImage.secure_url;

      if (!userCloudinaryUrl) {
        throw new Error("Cloudinary profile upload failed.");
      }

      const targetClothUrl = activeProduct.images?.[0]?.url || activeProduct.images?.[0] || "";

      const response = await axios.post("http://localhost:8000/api/ai/process-tryon", {
        personImageUrl: userCloudinaryUrl,
        clothImageUrl: targetClothUrl
      });

      if (response.data.success) {
        setAiResult({ renderOutput2D: response.data.tryOnImage });
      } else {
        alert(response.data.message || "AI execution pipeline error.");
      }
    } catch (error) {
      console.error("Express router pipeline failure:", error);
      alert("AI Pipeline Connection Refused or Image upload timeout.");
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (item) => {
    if (!item.images || item.images.length === 0) return "https://placehold.co/150x200?text=No+Image";
    const imgObj = item.images[0];
    if (typeof imgObj === "string") return imgObj;
    return imgObj?.url || imgObj?.secure_url || "https://placehold.co/150x200?text=No+Image";
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] text-white flex flex-col overflow-y-auto animate-in fade-in duration-300 font-sans">
      
      {/* HEADER BLOCK */}
      <header className="w-full border-b border-neutral-800/80 bg-[#0d0d0d]/95 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C19A6B] font-mono block mb-0.5">Interactive Studio</span>
          <h2 className="text-xl font-serif tracking-wide text-neutral-100 uppercase">Virtual Try-On Center</h2>
        </div>
        <button 
          onClick={handleClose} 
          className="px-5 py-2.5 rounded-xl border border-neutral-800 text-xs tracking-widest uppercase text-neutral-400 hover:bg-[#C19A6B] hover:text-black hover:border-[#C19A6B] transition-all duration-300 cursor-pointer flex items-center gap-2 font-semibold"
        >
          <span>Close Studio</span> <X size={14} />
        </button>
      </header>

      {/* THREE COLUMN GRID */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 flex-1 items-start">
        
        {/* COLUMN 1: USER IMAGE UPLOAD */}
        <section className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
              <Upload size={14} /> 01 / Your Portrait
            </h3>
            <div className="border border-neutral-800 bg-neutral-950 rounded-xl aspect-[3/4] flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
              {imagePreview ? (
                <img src={imagePreview} alt="User Frame" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center space-y-3 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#C19A6B]">
                    <ImageIcon size={22} />
                  </div>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">Upload a clear full-body or portrait photo for accurate AI fitting.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <input type="file" accept="image/*" id="userPhotoInput" onChange={handleFileChange} className="hidden" />
            <label htmlFor="userPhotoInput" className="w-full block text-center text-xs font-bold tracking-widest uppercase bg-black border border-neutral-800 hover:border-[#C19A6B] text-white py-3.5 rounded-xl cursor-pointer transition shadow-md">
              {selectedFile ? "Change Portrait" : "Upload Portrait"}
            </label>
          </div>
        </section>

        {/* COLUMN 2: LIVE PRODUCTS PANEL */}
        <section className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4 w-full">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
                <Sparkles size={14} /> 02 / Select Apparel
              </h3>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {filteredProducts.length} Items Available
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search fabrics, eastern, western styles..." 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-200 focus:outline-none focus:border-[#C19A6B] transition shadow-inner placeholder-neutral-600" 
              />
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 text-xs font-mono text-neutral-500 gap-3">
                <Loader2 className="w-6 h-6 text-[#C19A6B] animate-spin" />
                <span>Syncing Database Catalog...</span>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3.5 custom-scrollbar">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center text-xs text-neutral-500 font-mono py-16">No matching apparel found.</div>
                ) : (
                  filteredProducts.map((fab) => {
                    const currentImage = getProductImage(fab);
                    const isSelected = activeProduct?._id === fab._id;
                    return (
                      <div 
                        key={fab._id} 
                        onClick={() => setActiveProduct(fab)} 
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all duration-300 bg-neutral-950 flex flex-col gap-2 relative group ${
                          isSelected ? 'border-[#C19A6B] shadow-[0_0_20px_rgba(193,154,107,0.2)] bg-neutral-900/50' : 'border-neutral-800/80 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-full aspect-[4/5] bg-neutral-900 rounded-lg overflow-hidden relative">
                          <img src={currentImage} alt={fab.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#C19A6B] text-black text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-md">
                              <Check size={10} /> Active
                            </div>
                          )}
                        </div>
                        <h4 className="text-[11px] text-neutral-300 font-semibold truncate px-0.5">{fab.name}</h4>
                        <span className="text-[10px] text-[#C19A6B] font-extrabold px-0.5">Rs. {fab.price?.toLocaleString()}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: PREVIEW & GENERATE */}
        <section className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#C19A6B] font-mono font-bold flex items-center gap-2">
              <RefreshCw size={14} /> 03 / AI Generation
            </h3>

            {activeProduct && (
              <div className="flex gap-3 items-center p-3 bg-neutral-950 border border-neutral-800 rounded-xl shadow-inner">
                <img src={getProductImage(activeProduct)} className="w-12 h-14 object-cover rounded-lg bg-neutral-900 shrink-0 border border-neutral-800" alt="" />
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono block">Selected Target</span>
                  <h5 className="text-xs text-neutral-200 truncate font-bold uppercase">{activeProduct.name}</h5>
                  <span className="text-[10px] text-[#C19A6B] font-mono">Rs. {activeProduct.price?.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex-1 w-full border border-neutral-800 bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden shadow-inner">
              {aiResult ? (
                <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={aiResult.renderOutput2D} alt="Virtual Try-On Result" className="w-full h-full object-cover rounded-lg" />
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs font-light text-neutral-400 max-w-[200px] mx-auto leading-relaxed">
                    Upload your portrait and select an outfit to generate your AI try-on preview.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleTryOnSubmit} 
            disabled={loading || !activeProduct || !selectedFile} 
            className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg mt-6 cursor-pointer flex items-center justify-center gap-2 ${
              loading || !activeProduct || !selectedFile 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/30' 
                : 'bg-[#C19A6B] text-black hover:bg-[#b0895b] font-extrabold'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>AI Rendering...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Try-On</span>
              </>
            )}
          </button>
        </section>

      </main>
    </div>
  );
};

export default TryOnModel;