import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
configDotenv();

// import file
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";

const app = express();

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
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

// Routes
app.use("/api/v1", routes);


connectDB();
const HOST_PORT = process.env.HOST_PORT || 3000;
app.listen(HOST_PORT, () => {
  console.log(`Server is running on port localhost:${process.env.HOST_PORT}`);
});
