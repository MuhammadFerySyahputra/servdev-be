import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userName: {
      type: String,
      required: true,
    },
    emailUser: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done", "rejected"],
      default: "pending",
    },
    userNote: {
      type: String,
      default: "",
    },
    adminNote: {
      type: String,
    },
    productId: {
      type: String,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
