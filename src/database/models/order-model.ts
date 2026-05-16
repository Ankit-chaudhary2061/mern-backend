import mongoose from "mongoose";
import { OrderStatus } from "../../types/order-types";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus).filter(status => status !== OrderStatus.ALL),
      default: OrderStatus.PENDING,
    },

 
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;