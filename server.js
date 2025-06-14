// import library yang diperlukan
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
dotenv.config();

console.log("Environment loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  R2_CONFIGURED: process.env.R2_ACCOUNT_ID ? "Yes" : "No",
});

// import file
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";

// buat instance express
const app = express();

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // akan reset setiap 15 minutes
    max: 100, // untuk memberikan maximal limit 100 requests per 15 minutes
  })
);

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   res.setHeader("Cross-Origin-Resource-Policy", "*");
//   next();
// });

// all Routes
app.use("/api/v1", routes);
app.use("/uploads", express.static("uploads"));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// connect ke database
connectDB();

// run server
const HOST_PORT = process.env.HOST_PORT || 3000;
app.listen(HOST_PORT, () => {
  console.log(`Server is running on port localhost:${process.env.HOST_PORT}`);
});
