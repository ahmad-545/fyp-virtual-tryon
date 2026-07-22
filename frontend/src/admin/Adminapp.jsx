import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDataContext } from './context/AdminContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AddProduct from './pages/AddProduct.jsx';
import ListProducts from './pages/ListProduct.jsx';


const AdminApp = () => {
  const { adminData, loading } = useContext(AdminDataContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <Routes>
      {/* Agar adminData nahi hai (Not Logged In) */}
      {!adminData ? (
        <Route path="/*" element={<AdminLogin />} />
      ) : (
        /* Agar adminData hai (Logged In) */
        <Route path="/*" element={
          <Layout>
            <Routes>
              {/* Dashboard ko default path par rakhein */}
              <Route path="/" element={<Dashboard />} />
              {/* Add Product Page */}
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/list-products" element={<ListProducts />} />

             

              {/* Agar koi wrong URL type kare, Dashboard par redirect karein */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      )}
    </Routes>
  );
};

export default AdminApp;