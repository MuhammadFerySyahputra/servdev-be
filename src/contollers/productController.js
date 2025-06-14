// controllers/productController.js
import asyncHandler from "express-async-handler";
import Models from "../models/index.js";
import {
  uploadMultipleToR2,
  deleteMultipleFromR2,
} from "../config/r2Storage.js";

// @desc    Create new product
// @route   POST /api/v1/product
// @headers  Content-Type: multipart/form-data, Authorization: Bearer <token>
// @body     { title, price, description, images }
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description } = req.body;

  // Validasi input
  if (!title || !price || !description) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, price, and description",
    });
  }

  // Cek apakah product sudah ada
  const productExists = await Models.Product.findOne({ title });
  if (productExists) {
    return res.status(409).json({
      success: false,
      message: "Product with this title already exists",
    });
  }

  // Validasi file upload
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least 1 image is required",
    });
  }

  if (req.files.length > 10) {
    return res.status(400).json({
      success: false,
      message: "Maximum 10 images allowed",
    });
  }

  try {
    // Upload images ke R2
    const imageUrls = await uploadMultipleToR2(req.files, "products");

    // Buat product baru
    const product = await Models.Product.create({
      title,
      est_price: price,
      description,
      imageUrl: imageUrls,
      is_active: false,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// @desc    Update product
// @route   PUT /api/v1/product/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
  const { title, price, description, is_active } = req.body;
  const { id } = req.params;

  try {
    const product = await Models.Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Jika ada file baru untuk diupload
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum 10 images allowed",
        });
      }

      // Simpan URL gambar lama untuk dihapus nanti
      const oldImageUrls = [...product.imageUrl];

      try {
        // Upload gambar baru ke R2
        const newImageUrls = await uploadMultipleToR2(req.files, "products");

        // Update product dengan gambar baru
        product.imageUrl = newImageUrls;

        // Hapus gambar lama dari R2 setelah upload berhasil
        if (oldImageUrls.length > 0) {
          await deleteMultipleFromR2(oldImageUrls);
        }
      } catch (uploadError) {
        console.error("Error uploading new images:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload new images",
          error: uploadError.message,
        });
      }
    }

    // Update field lainnya
    product.title = title || product.title;
    product.est_price = price || product.est_price;
    product.description = description || product.description;

    // Handle boolean conversion untuk is_active
    if (is_active !== undefined) {
      product.is_active = is_active === "true" || is_active === true;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/v1/product/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Models.Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Hapus gambar dari R2 storage
    if (product.imageUrl && product.imageUrl.length > 0) {
      await deleteMultipleFromR2(product.imageUrl);
    }

    // Hapus product dari database
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// @desc    Mengambil semua product only admin
// @route   GET /api/v1/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Models.Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Get All Products Fetched Successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// @desc    Mengambil product berdasarkan id only admin
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Models.Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get ProductById fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// @desc    Mengambil semua product yang aktif untuk user
// @route   GET /api/v1/product
// @access  Public
export const getActiveProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Models.Product.find({ is_active: true }).sort({
      createdAt: -1,
    });

    const data = products.map((product) => {
      return {
        id: product._id,
        title: product.title,
        price: product.est_price,
        description: product.description,
        imageUrl: product.imageUrl[0], // Ambil gambar pertama
      };
    });

    res.status(200).json({
      success: true,
      message: "Get All Active Products Fetched Successfully",
      count: products.length,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching active products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active products",
      error: error.message,
    });
  }
});
