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
  const admin = await Models.Admin.findById(decoded.adminId);

  if (!admin) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Unauthorized",
    });
  }

  req.admin = admin;
  next();
});

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};
