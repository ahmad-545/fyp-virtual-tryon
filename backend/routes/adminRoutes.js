import express from "express";

import {
  loginAdmin,
  getAdmin,
  logoutAdmin,
  getDashboardStats,
} from "../controllers/AdminController.js";

import adminAuth from "../middleware/authAdmin.js";


const adminRoute = express.Router();


// Login
adminRoute.post("/login", loginAdmin);


// Check Admin
adminRoute.get(
  "/me",
  adminAuth,
  getAdmin
);


// Logout
adminRoute.get(
  "/logout",
  logoutAdmin
);


// Dashboard
adminRoute.get(
  "/dashboard-stats",
  adminAuth,
  getDashboardStats
);


export default adminRoute;