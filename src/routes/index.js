// import library yang diperlukan
import express from "express";
const router = express.Router();

// import middleware
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";

// import file controller
import { registerAdmin, loginAdmin } from "../contollers/adminController.js";
import { createProduct } from "../contollers/productController.js";

// route untuk admin
// router.post("/admin/register", registerAdmin);
router.post("/admin/register", authenticateAdmin, registerAdmin);
router.post("/admin/login", loginAdmin);

// route untuk product
router.post("/product", authenticateAdmin, uploadProductImages, createProduct);

export default router;
