import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Models from "../models/index.js";

// Middleware untuk autentikasi admin
export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  // 1. Ambil token dari header
  const authHeader = req.header("Authorization");

  // 2. Validasi format header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid format",
    });
  }

  // 3. Ekstrak token
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Cek admin di database
    const admin = await Models.Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    // 6. Attach admin ke request object
    req.admin = admin;
    next();
  } catch (error) {
    // 7. Handle berbagai jenis error JWT
    let message = "Invalid token";

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
    }

    return res.status(401).json({
      success: false,
      message: `Authentication failed: ${message}`,
    });
  }
});
