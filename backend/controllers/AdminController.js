import jwt from "jsonwebtoken";
import Order from "../models/oderModel.js";

// ============================================
// ADMIN LOGIN
// ============================================

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.admin_email ||
      password !== process.env.admin_password
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email,
        role: "admin",
      },
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// VERIFY ADMIN
// ============================================

export const getAdmin = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin verified successfully.",
      admin: req.admin,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// ADMIN LOGOUT
// ============================================

export const logoutAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// DASHBOARD STATISTICS
// ============================================

export const getDashboardStats = async (req, res) => {
  try {

    // Weekly Sales
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: 7,
      },
    ]);

    // Order Status
    const statusData = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Revenue
    const revenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenue.length > 0 ? revenue[0].totalRevenue : 0;

    return res.status(200).json({
      success: true,

      dashboard: {
        totalOrders,
        totalRevenue,
      },

      salesData,
      statusData,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics.",
      error: error.message,
    });
  }
};