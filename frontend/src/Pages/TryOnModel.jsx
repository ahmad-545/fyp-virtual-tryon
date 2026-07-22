import React, { useState, useEffect } from 'react';


const TryOnModal = ({ isOpen, onClose, product }) => {
  const [allProducts, setAllProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [activeProduct, setActiveProduct] = useState(product);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); 
  const [aiResult, setAiResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 

  // 🌐 FETCH ALL PRODUCTS ON MATRIX OPEN
  useEffect(() => {
    const fetchLiveProducts = async () => {
      if (!isOpen) return;
      try {
        setFetching(true);
        const res = await fetch("http://localhost:8030/api/product/");
        const data = await res.json();
        
        if (data.success && Array.isArray(data.products)) {
          const reversedData = [...data.products].reverse();
          setAllProducts(reversedData);
          setFilteredProducts(reversedData); 
          
          if (!activeProduct && reversedData.length > 0) {
            setActiveProduct(reversedData[0]);
          }
        }
      } catch (error) {
        console.error("Express router sync failure inside TryOnModal:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchLiveProducts();
  }, [isOpen]);

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
    if (product) {
      setActiveProduct(product);
    }
  }, [product]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ⚡ UPDATED DYNAMIC TRY-ON ENGINE (Cloudinary Integration Ready)
  const handleTryOnSubmit = async () => {
    if (!selectedFile) return alert("Please upload or capture a profile photo first.");
    if (!activeProduct) return alert("Please select a target apparel item first.");

    setLoading(true);
    setAiResult(null); // Reset prev look

    try {
      // Step A: Pehle user ki profile image ko Cloudinary par upload karein (Node backend optimization)
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("upload_preset", "your_cloudinary_preset_name"); // ⚠️ Apna preset name yahan likhein

      const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", { // ⚠️ Cloud name update karein
        method: "POST",
        body: uploadData,
      });
      
      const uploadedImage = await cloudinaryRes.json();
      const userCloudinaryUrl = uploadedImage.secure_url;

      if (!userCloudinaryUrl) {
        throw new Error("Cloudinary profile upload failed.");
      }

      // Step B: Target Product Image URL trace karein
      const targetClothUrl = activeProduct.images?.[0] || "";

      // Step C: Apne Node.js Express backend controller ko dynamic simple JSON payload bhejein
      const response = await apiClient.post("/ai/process-tryon", {
        personImageUrl: userCloudinaryUrl,
        clothImageUrl: targetClothUrl
      });

      if (response.data.success) {
        // Response direct base64 image dynamic structure store karega
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

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] text-white flex flex-col overflow-y-auto animate-in fade-in duration-300">
      {/* HEADER BLOCK */}
      <header className="w-full border-b border-neutral-800/60 bg-[#0d0d0d]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a880] block mb-1">Interactive Studio</span>
          <h2 className="text-xl font-serif tracking-wide text-neutral-100">Virtual Try-On Center</h2>
        </div>
        <button onClick={onClose} className="px-5 py-2 rounded-sm border border-neutral-800 text-xs tracking-widest uppercase text-neutral-400 hover:bg-[#c5a880] hover:text-black hover:border-[#c5a880] transition-all duration-300">
          Close Studio ✕
        </button>
      </header>

      {/* THREE COLUMN GRID */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 p-6 lg:p-8 flex-1">
        {/* COLUMN 1: USER IMAGE UPLOAD */}
        <section className="col-span-1 lg:col-span-3 bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#c5a880] font-mono">01 / Your Photo</h3>
            <div className="border border-neutral-800 bg-neutral-900/80 rounded-xl aspect-[3/4] flex flex-col items-center justify-center p-4 relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="User Frame" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">📸</div>
                  <p className="text-[11px] text-neutral-500 font-light">Upload portrait photo.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <input type="file" accept="image/*" id="userPhotoInput" onChange={handleFileChange} className="hidden" />
            <label htmlFor="userPhotoInput" className="w-full block text-center text-[11px] tracking-widest uppercase bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 py-3 rounded cursor-pointer transition">
              {selectedFile ? "Change Image" : "Upload Image"}
            </label>
          </div>
        </section>

        {/* COLUMN 2: LIVE PRODUCTS PANEL */}
        <section className="col-span-1 lg:col-span-5 bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4 w-full h-full flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-[#c5a880] font-mono">02 / Select a Dress</h3>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search fabrics, western styles, categories..." className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-[#c5a880]/60 transition" />

            {fetching ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs font-mono text-neutral-500">
                <div className="w-4 h-4 border border-neutral-700 border-t-[#c5a880] animate-spin rounded-full"></div>
                <span>Syncing Database Catalog...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[340px] pr-2 grid grid-cols-2 gap-3 custom-scrollbar">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 text-center text-xs text-neutral-500 font-mono py-12">No matching apparel found.</div>
                ) : (
                  filteredProducts.map((fab, index) => {
                    const currentImage = fab.images?.[0] || "https://via.placeholder.com/150";
                    return (
                      <div key={fab._id || index} onClick={() => setActiveProduct(fab)} className={`p-2 rounded-xl border cursor-pointer transition-all duration-300 bg-neutral-950/60 flex flex-col gap-2 ${activeProduct?._id === fab._id ? 'border-[#c5a880] shadow-[0_0_15px_rgba(197,168,128,0.15)]' : 'border-neutral-800/80 hover:border-neutral-700'}`}>
                        <div className="w-full aspect-[4/5] bg-neutral-900 rounded-lg overflow-hidden relative">
                          <img src={currentImage} alt={fab.name} className="w-full h-full object-cover" />
                          {activeProduct?._id === fab._id && (
                            <div className="absolute top-2 right-2 bg-[#c5a880] text-black text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded font-bold">Active</div>
                          )}
                        </div>
                        <h4 className="text-[11px] text-neutral-300 font-light truncate px-1">{fab.name}</h4>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: PREVIEW */}
        <section className="col-span-1 md:col-span-2 lg:col-span-4 bg-neutral-900/40 border border-neutral-800/60 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-[#c5a880] font-mono">03 / Generate Look</h3>
            {activeProduct && (
              <div className="flex gap-3 items-center p-2.5 bg-neutral-950/80 border border-neutral-800/60 rounded-xl">
                <img src={activeProduct.images?.[0] || "https://via.placeholder.com/150"} className="w-12 h-14 object-cover rounded bg-neutral-900 shrink-0" alt="" />
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Target Selected</span>
                  <h5 className="text-xs text-neutral-300 truncate font-light">{activeProduct.name}</h5>
                </div>
              </div>
            )}

            <div className="flex-1 w-full border border-neutral-800 bg-neutral-950 rounded-xl p-1.5 flex flex-col items-center justify-center min-h-[220px] relative">
              {aiResult ? (
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <TryOnCanvas textureUrl={aiResult.renderOutput2D} />
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <p className="text-[11px] font-light text-neutral-500 max-w-[180px] mx-auto leading-relaxed">Select a dress from the center panel to begin.</p>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleTryOnSubmit} disabled={loading || !activeProduct} className={`w-full py-3.5 rounded-md font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl mt-4 ${loading ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/30' : 'bg-[#c5a880] text-black hover:bg-[#b0946f] font-bold'}`}>
            {loading ? "🧬 Blending..." : "Generate Try-On"}
          </button>
        </section>
      </main>
    </div>
  );
};

export default TryOnModal;