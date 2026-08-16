import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminDataContext } from '../context/AdminContext'; // Aapka Admin Context
import { AuthDataContext } from '../../context/AuthContext'; // Aapka Auth Context
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const { serverUrl } = useContext(AuthDataContext); // AuthContext se URL
  const { getAdmin, setAdminData } = useContext(AdminDataContext); // AdminContext se functions
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("LOGIN DATA:", formData);
      console.log("SERVER URL:", serverUrl);
      // API Request
      const res = await axios.post(
        `${serverUrl}/api/admin/login`,
        formData,
        { withCredentials: true }
      );

      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        setAdminData(res.data.admin); // Context update
        getAdmin(); // Admin data refresh
        alert("Login Successful!");
        navigate('/admin');
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || "Invalid Credentials!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Decorative Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#C19A6B]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C19A6B]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-800 relative z-10">
        
        {/* Top Logo / Icon Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#C19A6B]/20 border border-[#C19A6B]/30 flex items-center justify-center text-[#C19A6B] mb-3 shadow-inner">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-wide uppercase">Trylo Admin</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-light tracking-wide text-center">
            Secure management portal for store administrators
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                name="email"
                type="email"
                placeholder="admin@trylo.store"
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-950/60 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] transition duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                name="password"
                type="password"
                placeholder="••••••••••••"
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-950/60 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] transition duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#C19A6B] hover:bg-[#b0885c] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#C19A6B]/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Access Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center border-t border-gray-800/80 pt-4">
          <p className="text-[11px] text-gray-500 tracking-wider uppercase font-medium">
            Protected Admin Environment &bull; Trylo Store
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;