// Import library yang diperlukan
import asyncHandler from "express-async-handler";

// Import model
import Models from "../models/index.js";

// @desc    Create new order
// @route   POST /api/v1/orders
// @headers  Content-Type: application/json, Authorization: Bearer <token>
// @body     { productId, quantity }
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { userName, emailUser, whatsapp, userNote, productId } = req.body;

  // Validasi input
  if (!userName || !emailUser || !whatsapp || !productId) {
    res.status(400).json({
      success: false,
      message: "Please provide userName, emailUser, whatsapp, and productId",
    });
  }

  //   Validasi apakah product ada atau tidak
  const product = await Models.Product.findById(productId);
  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
});
