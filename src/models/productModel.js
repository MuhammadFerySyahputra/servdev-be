// import library yang diperlukan
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

// membuat schema
const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    est_price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: [String],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
