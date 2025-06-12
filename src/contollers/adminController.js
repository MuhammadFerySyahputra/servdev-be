// Import library yang diperlukan
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Import model
import Models from "../models/index.js";

// Fungsi untuk generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new admin
// @route   POST /api/admin/register
// @access  Public
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validasi input
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }

  // Cek apakah admin sudah ada
  const adminExists = await Models.Admin.findOne({ email });
  if (adminExists) {
    res.status(409); // 409 Conflict
    throw new Error("Admin already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat admin baru
  const admin = await Models.Admin.create({
    name,
    email,
    password: hashedPassword,
  });

  if (admin) {
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        name: admin.name,
        email: admin.email,
        token: generateToken(admin.adminId),
      },
    });
  } else {
    res.status(500);
    throw new Error("Failed to register admin");
  }
});

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Cari admin berdasarkan email
  const admin = await Models.Admin.findOne({ email });

  // Cek password cocok
  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        name: admin.name,
        email: admin.email,
        token: generateToken(admin.adminId),
      },
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error("Invalid email or password");
  }
});
