// import library yang diperlukan
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// import model
import Models from "../models/index.js";

// @desc    Protect routes - memverifikasi JWT token
// @access  Private
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Cek apakah ada authorization header dengan Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Cari admin berdasarkan ID dari token (tanpa password)
      req.admin = await Models.Admin.findById(decoded.adminId).select(
        "-password"
      );

      if (!req.admin) {
        res.status(401);
        throw new Error("Admin not found");
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  // Jika tidak ada token
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// @desc    Admin only access - memastikan user adalah admin
// @access  Private
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied - Admin only");
  }
});

// @desc    Validate request body
// @access  Public
export const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      res.status(400);
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    next();
  };
};

// @desc    Validate email format
// @access  Public
export const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Invalid email format");
    }
  }

  next();
};

// @desc    Validate password strength
// @access  Public
export const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (password) {
    // Password harus minimal 8 karakter
    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters long");
    }

    // Password harus mengandung huruf dan angka
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      res.status(400);
      throw new Error("Password must contain both letters and numbers");
    }
  }

  next();
};

// @desc    Logging middleware
// @access  Public
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  next();
};

// @desc    Response time middleware
// @access  Public
export const responseTime = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });

  next();
};
