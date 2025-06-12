// import library yang diperlukan
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// membuat schema
const adminSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      maxlength: 255,
    },
  },
  {
    // Agar mongoose automatis menambahkan createdAt dan updatedAt
    timestamps: true,
  }
);

// export model
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
