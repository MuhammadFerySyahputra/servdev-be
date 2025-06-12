import express from "express";
const router = express.Router();

// import file controller
import { registerAdmin, loginAdmin } from "../contollers/adminController.js";

// route untuk admin
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;
