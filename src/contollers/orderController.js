// Import library yang diperlukan
import asyncHandler from "express-async-handler";

// Import model
import Models from "../models/index.js";

// @desc    Create new order
// @route   POST /api/v1/orders
// @headers  Content-Type: application/json, Authorization: Bearer <token>
// @body     { userName, emailUser, whatsapp, userNote, productId }
// @access  Public
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

  // Buat order baru
  const order = await Models.Order.create({
    userName,
    emailUser,
    whatsapp,
    userNote,
    productId,
  });

  const data = {
    _id: order._id,
    userName: order.userName,
    emailUser: order.emailUser,
    whatsapp: order.whatsapp,
    userNote: order.userNote,
    status: order.status,
    product: {
      _id: product._id,
      title: product.title,
      est_price: product.est_price,
      description: product.description,
    },
  };

  res.status(201).json({
    success: true,
    message: "Create Order Successfully",
    data,
  });
});

// @desc Update Status Order
// @route PUT /api/v1/orders/:id
// @headers  Content-Type: application/json, Authorization: Bearer <token>
// @body     { productId, quantity }
// @access  Private
export const updateStatusOrder = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const orderId = req.params.id;

  // Validasi input
  if (!status) {
    res.status(400).json({
      success: false,
      message: "Please provide status",
    });
  }

  // Cek apakah order ada
  const order = await Models.Order.findById(orderId);
  if (!order) {
    res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Update status dan catatan admin
  order.status = status;
  order.adminNote = adminNote || "";

  await order.save();

  const updatedOrder = {
    _id: order._id,
    userName: order.userName,
    emailUser: order.emailUser,
    whatsapp: order.whatsapp,
    userNote: order.userNote,
    status: order.status,
    adminNote: order.adminNote,
    productId: order.productId,
  };

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: updatedOrder,
  });
});

// @desc DELETE Orders
// @route DELETE /api/v1/orders/:id
// @headers  Content-Type: application/json, Authorization: Bearer <token>
// @access  Private
export const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  // Cek apakah order ada
  const order = await Models.Order.findById(orderId);
  if (!order) {
    res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Hapus order
  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

// @desc Get all orders
// @route GET /api/v1/orders
// @headers  Content-Type: application/json,
// @access  Public
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Models.Order.find().sort({ createdAt: -1 });

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No orders found",
    });
  }

  res.status(200).json({
    success: true,
    data: orders,
  });
});

// @desc Get order by ID
// @route GET /api/v1/orders/:id
// @headers  Content-Type: application/json,
// @access  Public
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  // Cek apakah order ada
  const order = await Models.Order.findById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Ambil detail produk terkait
  const product = await Models.Product.findById(order.productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found for this order",
    });
  }

  const orderDetails = {
    _id: order._id,
    userName: order.userName,
    emailUser: order.emailUser,
    whatsapp: order.whatsapp,
    userNote: order.userNote || "",
    status: order.status,
    adminNote: order.adminNote || "",
    product: {
      _id: product._id,
      title: product.title,
      est_price: product.est_price,
      description: product.description,
      imageUrl: product.imageUrl[0],
    },
  };

  res.status(200).json({
    success: true,
    message: "Order details fetched successfully",
    data: orderDetails,
  });
});

// @desc Get orders by user email
// @route GET /api/v1/orders/user/:email
// @headers  Content-Type: application/json,
// @access  Public
// export const getOrdersByUserEmail = asyncHandler(async (req, res) => {
//   const userEmail = req.params.email;

//   // Cek apakah ada order untuk email tersebut
//   const orders = await Models.Order.find({ emailUser: userEmail }).sort({
//     createdAt: -1,
//   });

//   if (!orders || orders.length === 0) {
//     return res.status(404).json({
//       success: false,
//       message: "No orders found for this user",
//     });
//   }

//   // Ambil detail produk terkait untuk setiap order
//   const productIds = orders.map((order) => order.productId);
//   const products = await Models.Product.find({
//     _id: { $in: productIds },
//   });

//   // Buat map untuk akses cepat produk berdasarkan ID
//   const productMap = {};
//   products.forEach((product) => {
//     productMap[product._id] = product;
//   });

//   // Gabungkan data order dengan detail produk
//   const ordersWithProducts = orders.map((order) => ({
//     ...order.toObject(),
//     productDetails: productMap[order.productId] || null,
//   }));

//   res.status(200).json({
//     success: true,
//     message: "Orders for user fetched successfully",
//     count: ordersWithProducts.length,
//     data: ordersWithProducts,
//   });
// });

export const getOrdersByUserEmail = asyncHandler(async (req, res) => {
  const userEmail = req.params.email;

  // Cek apakah ada order untuk email tersebut
  const orders = await Models.Order.find({ emailUser: userEmail }).sort({
    createdAt: -1,
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No orders found for this user",
    });
  }

  // Ambil detail produk terkait untuk setiap order
  const productIds = orders.map((order) => order.productId);
  const products = await Models.Product.find({
    _id: { $in: productIds },
  });

  // Buat map untuk akses cepat produk berdasarkan ID
  const productMap = {};
  products.forEach((product) => {
    productMap[product._id] = product;
  });

  // Gabungkan data order dengan detail produk
  const ordersWithProducts = orders.map((order) => ({
    ...order.toObject(),
    productDetails: productMap[order.productId] || null,
  }));

  res.status(200).json({
    success: true,
    message: "Orders for user fetched successfully",
    count: ordersWithProducts.length,
    data: ordersWithProducts,
  });
});
