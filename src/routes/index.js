import express from "express";
const router = express.Router();

// import file controller
import { authenticateAdmin } from "../middleware/auth.js";
import { registerAdmin, loginAdmin } from "../contollers/adminController.js";
// import { createProduct } from "../contollers/productController.js";

// route untuk admin
// router.post("/admin/register", registerAdmin);
router.post("/admin/register", authenticateAdmin, registerAdmin);
router.post("/admin/login", loginAdmin);

// route untuk product
// router.post("/product", authMiddleware, createProduct);

export default router;
