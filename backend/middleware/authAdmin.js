import jwt from "jsonwebtoken";

// ============================================
// ADMIN AUTH MIDDLEWARE
// ============================================

const adminAuth = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    // Token check
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }


    // Bearer Token Handle
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }


    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // Admin Role Check
    if (!decoded || decoded.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token.",
      });
    }


    // Save Admin Data
    req.admin = decoded;


    next();


  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      error: error.message,
    });

  }
};


export default adminAuth;