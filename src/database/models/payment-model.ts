import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, 
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

   paymentMethod: {
  type: String,
 enum: ["cod", "esewa", "khalti"],
  required: true,
},

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },

    pidx: {
      type: String,
    },

    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;