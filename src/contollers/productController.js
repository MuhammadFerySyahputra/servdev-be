// Import library yang diperlukan
import asyncHandler from "express-async-handler";
import fs from "fs";

// Import model
import Models from "../models/index.js";

// @desc    Create new product
// @route   POST /api/v1/product
// @headers  Content-Type: multipart/form-data, Authorization: Bearer <token>
// @body     { title, price, description, images }
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

  if (req.files.length > 10) {
    return res
      .status(400)
      .json({ success: false, message: "Maximum 10 images allowed" });
  }

  // const imageUrl = req.files.map((file) => file.path.replace(/\\/g, "/"));
  const imageUrl = req.files.map(
    (file) =>
      `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
  );

  // Buat product baru
  const product = await Models.Product.create({
    title,
    est_price: price,
    description,
    imageUrl,
    is_active: false,
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
export const updateProduct = asyncHandler(async (req, res) => {
  const { title, price, description, is_active } = req.body;
  const { id } = req.params;

  const product = await Models.Product.findById(id);
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  if (req.files && req.files.length > 0) {
    if (req.files.length > 10) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum 10 images allowed" });
    }

    // Optional: hapus gambar lama dari storage
    product.imageUrl.forEach((url) => {
      const localPath = url.split(`${req.get("host")}/`)[1];
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    });

    product.imageUrl = req.files.map(
      (file) =>
        `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
    );
  }

  product.title = title || product.title;
  product.price = price || product.price;
  product.description = description || product.description;
  product.is_active = is_active || product.is_active;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// // @desc    Delete product
// // @route   DELETE /api/v1/product/:id
// // @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Models.Product.findById(id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Hapus gambar dari penyimpanan lokal
  product.imageUrl.forEach((url) => {
    const localPath = url.split(`${req.get("host")}/`)[1];
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// // @desc    Mengambil semua product only admin
// // @route   GET /api/v1/products
// // @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Models.Product.find().sort({ createdAt: -1 });

  // const data = products.map((product) => {
  //   return {
  //     id: product._id,
  //     title: product.title,
  //     price: product.price,
  //     description: product.description,
  //     imageUrl: product.imageUrl[0],
  //   };
  // });

  res.status(200).json({
    success: true,
    message: "Get All Products Fetched Fuccessfully",
    count: products.length,
    data: products,
  });
});

// @desc    Mengambil product berdasarkan id only admin
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Models.Product.findById(id);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  res.status(200).json({
    success: true,
    message: "Get ProductById fetched successfully",
    data: product,
  });
});

// @desc    Mengambil semua product yang aktif untuk user
// @route   GET /api/v1/product
// @access  Public
export const getActiveProducts = asyncHandler(async (req, res) => {
  const products = await Models.Product.find({ is_active: true }).sort({
    createdAt: -1,
  });

  const data = products.map((product) => {
    return {
      id: product._id,
      title: product.title,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl[0],
    };
  });

  res.status(200).json({
    success: true,
    message: "Get All Products Fetched Fuccessfully",
    count: products.length,
    data: data,
  });
});

// 