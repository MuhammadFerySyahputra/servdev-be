import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

import Models from "../models/index.js";

// Generate Access Token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

// Generate Refresh Token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex"); // token random panjang
};

// Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await Models.Admin.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Models.Admin.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    data: {
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    },
  });
});

// Login Admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Models.Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.json({
      success: true,
      message: "Login successful",
      data: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
