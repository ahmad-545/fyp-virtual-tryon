import React, { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, Trash2, CheckCircle, XCircle, AlertCircle, Loader2, Star } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Saare products fetch kar ke unke andar se reviews nikalna
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/products/");
      if (res.data.success) {
        const allProducts = res.data.products;
        let allReviews = [];
        
        allProducts.forEach((product) => {
          if (product.reviews && product.reviews.length > 0) {
            product.reviews.forEach((review) => {
              allReviews.push({
                ...review,
                productId: product._id,
                productName: product.name,
                productImage: product.images?.[0]?.url || product.images?.[0] || "https://placehold.co/100x100?text=No+Image"
              });
            });
          }
        });
        
        // Latest reviews pehle show karne ke liye sort
        allReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setReviews(allReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Approve / Disapprove Toggle (true / false)
  const handleToggleStatus = async (productId, reviewId) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/products/${productId}/reviews/${reviewId}/toggle`);
      if (res.data.success) {
        // State update karein bina page reload kiye
        setReviews(reviews.map(rev => 
          rev._id === reviewId ? { ...rev, isApproved: !rev.isApproved } : rev
        ));
      }
    } catch (error) {
      alert("Error updating review status");
    }
  };

  // Delete Review
  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await axios.delete(`http://localhost:8000/api/products/${productId}/reviews/${reviewId}`);
      if (res.data.success) {
        setReviews(reviews.filter(rev => rev._id !== reviewId));
      }
    } catch (error) {
      alert("Error deleting review");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative font-sans antialiased text-gray-800">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#C19A6B] to-[#A97A4D] px-6 py-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <MessageSquare className="w-7 h-7 text-white" />
              Customer Reviews Management
            </h2>
            <p className="text-[#F5EBE0] text-sm mt-1">
              Approve, hide, or delete customer reviews for your store products.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-semibold border border-white/20">
            Total Reviews: {reviews.length}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-10 h-10 text-[#C19A6B] animate-spin mb-3" />
              <p className="font-medium text-sm">Loading all reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">No Reviews Found</p>
              <p className="text-xs text-gray-400 mt-1">Products currently have no reviews.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4 font-bold">Product</th>
                      <th className="py-3 px-4 font-bold">Reviewer</th>
                      <th className="py-3 px-4 font-bold">Rating & Comment</th>
                      <th className="py-3 px-4 font-bold text-center">Status</th>
                      <th className="py-3 px-4 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {reviews.map((rev) => (
                      <tr key={rev._id} className={`transition ${rev.isApproved ? "hover:bg-gray-50" : "bg-rose-50/30"}`}>
                        <td className="py-4 px-4 flex items-center gap-3 w-64">
                          <img src={rev.productImage} alt={rev.productName} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                          <p className="font-bold text-gray-800 text-xs truncate">{rev.productName}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {/* 👇 Yahan rev.name ki jagah rev.user kar diya gaya hai */}
                          <p className="font-bold text-gray-900 text-sm">{rev.user || "Anonymous"}</p>
                          <p className="text-[10px] text-gray-400">{rev.createdAt ? rev.createdAt.split('T')[0] : ""}</p>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex text-amber-500 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < rev.rating ? "fill-current text-amber-500" : "text-gray-300"} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{rev.comment}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            rev.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {rev.isApproved ? "Approved (True)" : "Pending (False)"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(rev.productId, rev._id)}
                              className={`p-2 rounded-xl transition shadow-sm font-bold text-xs flex items-center gap-1 cursor-pointer ${
                                rev.isApproved 
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700" 
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              }`}
                              title={rev.isApproved ? "Click to Hide (False)" : "Click to Approve (True)"}
                            >
                              {rev.isApproved ? <><XCircle size={14} /> Hide</> : <><CheckCircle size={14} /> Approve</>}
                            </button>
                            <button
                              onClick={() => handleDelete(rev.productId, rev._id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition shadow-sm cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {reviews.map((rev) => (
                  <div key={rev._id} className={`border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between ${rev.isApproved ? "bg-white" : "bg-rose-50/20"}`}>
                    <div>
                      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                        <div className="flex gap-2 items-center">
                          <img src={rev.productImage} className="w-8 h-8 rounded object-cover" alt="" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate w-32">{rev.productName}</p>
                            {/* 👇 Yahan bhi rev.name ki jagah rev.user kar diya gaya hai */}
                            <p className="font-bold text-gray-900 text-xs">{rev.user || "Anonymous"}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${rev.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {rev.isApproved ? "True" : "False"}
                        </span>
                      </div>
                      
                      <div className="flex text-amber-500 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < rev.rating ? "fill-current text-amber-500" : "text-gray-300"} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-3 mb-2">{rev.comment}</p>
                    </div>
                    
                    <div className="mt-2 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleToggleStatus(rev.productId, rev._id)} 
                        className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          rev.isApproved ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {rev.isApproved ? <><XCircle size={14}/> Hide</> : <><CheckCircle size={14}/> Approve</>}
                      </button>
                      <button 
                        onClick={() => handleDelete(rev.productId, rev._id)} 
                        className="py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
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
    </div>
  );
}