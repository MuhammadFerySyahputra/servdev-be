// Import library yang diperlukan
import asyncHandler from "express-async-handler";

// Import model
import Models from "../models/index.js";

// @desc    Create new product
// @route   POST /api/v1/product
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description } = req.body;

  // Validasi input
  if (!title || !price || !description) {
    res.status(400).json({
      success: false,
      message: "Please provide title, price, and description",
    });
  }

  // Cek apakah product sudah ada
  const productExists = await Models.Product.findOne({ title });
  if (productExists) {
    res.status(409).json({
      success: false,
      message: "Product with this title already exists",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least 1 image is required" });
  }

  const imageUrl = req.files.map((file) => file.path.replace(/\\/g, "/"));

  // Buat product baru
  const product = await Models.Product.create({
    title,
    price,
    description,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// desc    Update product
// @route   PUT /api/v1/product/:id
// @access  Private
// export const updateProduct = asyncHandler(async (req, res) => {});

// // @desc    Delete product
// // @route   DELETE /api/v1/product/:id
// // @access  Private
// export const deleteProduct = asyncHandler(async (req, res) => {});

// // @desc    Mengambil semua product
// // @route   GET /api/v1/product
// // @access  Public
// export const getAllProducts = asyncHandler(async (req, res) => {});

// // @desc    Mengambil product berdasarkan id
// // @route   GET /api/v1/product/:id
// // @access  Public
// export const getProductById = asyncHandler(async (req, res) => {});
