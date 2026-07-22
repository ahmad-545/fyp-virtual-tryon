import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminDataContext } from '../context/AdminContext'; // Aapka Admin Context
import { AuthDataContext } from '../../context/AuthContext'; // Aapka Auth Context

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
        <p className="text-center text-gray-400 mb-6">Welcome back! Please login to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <div className="mb-6">
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;