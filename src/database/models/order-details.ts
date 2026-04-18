import mongoose from "mongoose";

const orderDetailsSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);


orderDetailsSchema.index({ order: 1 });

const OrderDetails = mongoose.model("OrderDetails", orderDetailsSchema);
export default OrderDetails;