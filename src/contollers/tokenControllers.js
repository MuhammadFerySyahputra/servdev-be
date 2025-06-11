import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Models from "../models/index.js";

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // cek refresh token valid di DB
  const admin = await Models.Admin.findOne({ refreshToken });
  if (!admin) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  // buat access token baru
  const accessToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.status(200).json({ accessToken });
});
