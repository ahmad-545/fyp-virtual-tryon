import axios from "axios";
import React, { useEffect, useContext, useState, createContext } from "react";
import { AuthDataContext } from "../../context/AuthContext"; // Path check kar lein (AuthContext root folder mein hai)

export const AdminDataContext = createContext();

function AdminContext({ children }) {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state add ki
  const { serverUrl } = useContext(AuthDataContext);

  const getAdmin = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // Key match ki
      if (!token) {
        setAdminData(null);
        setLoading(false);
        return;
      }

      let result = await axios.get(`${serverUrl}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdminData(result.data.admin);
    } catch (error) {
      console.log("Admin Auth Error:", error.response?.data || error.message);
      setAdminData(null);
      localStorage.removeItem("adminToken"); // Invalid token hone par remove kar dein
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdmin();
  }, [serverUrl]); // Dependency mein serverUrl zaroori hai

  const value = { adminData, getAdmin, setAdminData, loading };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export default AdminContext;