import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import Models from "../models/index.js";

// Middleware untuk autentikasi admin
export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No Token provided.",
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Models.Admin.findById(decoded.id);

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Unauthorized",
    });
  }

  req.admin = admin;
  next();
});
