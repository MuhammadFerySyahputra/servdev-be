// Import library yang diperlukan
import asyncHandler from "express-async-handler";

// Import model
import Models from "../models/index.js";

// @desc    Create new product
// @route   POST /api/v1/product
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, imageUrl } = req.body;

  // Validasi input
  if (!title || !price || !description || !imageUrl) {
    res.status(400);
    throw new Error("Please provide title, price, description, and imageUrl");
  }

  // Validasi imageUrl
  if (!Array.isArray(imageUrl)) {
    res.status(400);
    throw new Error("imageUrl must be an array");
  }

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
