// import library yang diperlukan
import express from "express";
const router = express.Router();

// import middleware
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";

// import file controller
import { registerAdmin, loginAdmin } from "../contollers/adminController.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getActiveProducts,
} from "../contollers/productController.js";

// route untuk admin
router.post("/admin/register", authenticateAdmin, registerAdmin);
router.post("/admin/login", loginAdmin);

// route untuk product (only admin can access)
router.post("/product", authenticateAdmin, uploadProductImages, createProduct);
router.put(
  "/product/:id",
  authenticateAdmin,
  uploadProductImages,
  updateProduct
);
router.delete("/product/:id", authenticateAdmin, deleteProduct);
router.get("/products", authenticateAdmin, getAllProducts);

// route untuk product (public)
router.get("/product", getActiveProducts);
router.get("/product/:id", getProductById);

export default router;
