import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
