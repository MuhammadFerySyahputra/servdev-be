import express from "express";
const router = express.Router();

import { registerAdmin } from "../contollers/adminController.js";
import token from "../contollers/tokenControllers.js";

router.post("/token", token);

// route untuk admin
router.post("/register", registerAdmin);
// router.post("/login", login);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);
// router.post("/token", token);

export default router;
