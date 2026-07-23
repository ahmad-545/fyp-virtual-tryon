import express from "express";
import { createOrder, listOrders, updateOrderStatus } from "../controllers/oderController.js";

const orderRoutes = express.Router();

// User client side endpoint connection
orderRoutes.post("/create", createOrder);

// Admin layout panels fetch connections
orderRoutes.get("/admin/all", listOrders);

// Admin dashboard select dynamic dropdown action sync handler
orderRoutes.put("/admin/update/:id", updateOrderStatus);

export default orderRoutes;