import { Request,Response } from "express";
import { KhaltiResponse, OrderData, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse } from "../../types/order-types";
import Payment from "../../database/models/payment-model";
import Order from "../../database/models/order-model";
import OrderDetails from "../../database/models/order-details";
import Product from "../../database/models/product-model";
import Cart from "../../database/models/cart-model";
import axios from "axios";
import crypto from "crypto";


class OrderController{


static async createOrder(req: Request, res: Response) {
  let order: any = null;
  let payment: any = null;
  let orderItems: any = [];

  try {
    const userId = req.user?.id;

    const {
      shippingAddress,
      phoneNumber,
      totalAmount,
      paymentDetails,
      items,
    }: OrderData = req.body;

    // Validation
    if (
      !userId ||
      !shippingAddress ||
      !phoneNumber ||
      !totalAmount ||
      !paymentDetails?.paymentMethod ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Validate environment variables for payment method
    if (paymentDetails.paymentMethod === PaymentMethod.ESEWA) {
      if (!process.env.ESEWA_MERCHANT_ID || !process.env.ESEWA_SECRET_KEY) {
        return res.status(500).json({
          message: "eSewa configuration incomplete",
        });
      }
    }

    if (paymentDetails.paymentMethod === PaymentMethod.KHALTI) {
      if (!process.env.KHALTI_SECRET_KEY) {
        return res.status(500).json({
          message: "Khalti configuration incomplete",
        });
      }
    }

    // Create order
    order = await Order.create({
      user: userId,
      shippingAddress,
      phoneNumber,
      totalAmount,
    });

    // Create order items
    orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return await OrderDetails.create({
          order: order._id,
          product: product._id,
          quantity: item.quantity,
          price: product.price,
        });
      })
    );

    // Create payment record BEFORE initiating payment
    payment = await Payment.create({
      user: userId,
      order: order._id,
      amount: totalAmount,
      paymentMethod: paymentDetails.paymentMethod,
    });

    // Link payment to order
    order.payment = payment._id;
    await order.save();

    // ================= eSewa =================
    if (paymentDetails.paymentMethod === PaymentMethod.ESEWA) {
      const transaction_uuid = order._id.toString();
      const amount = Number(totalAmount);

      const product_code = process.env.ESEWA_MERCHANT_ID!;
      const signatureString = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

      const signature = crypto
        .createHmac("sha256", process.env.ESEWA_SECRET_KEY!)
        .update(signatureString)
        .digest("base64");

      const formData = {
        amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: process.env.ESEWA_SUCCESS_URL,
        failure_url: process.env.ESEWA_FAILURE_URL,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      };

      // Save transaction id
      payment.transactionId = transaction_uuid;
      await payment.save();

      return res.status(200).json({
        message: "eSewa payment initiated",
        payment_url: "https://epay.esewa.com.np/api/epay/main/v2/form",
        data: formData,
      });
    }

    // ================= Khalti =================
    if (paymentDetails.paymentMethod === PaymentMethod.KHALTI) {
      try {
        const khaltiSecretKey = process.env.KHALTI_SECRET_KEY?.trim();
        const successUrl = process.env.KHALTI_SUCCESS_URL || "http://localhost:3000/success";
        const websiteUrl = process.env.KHALTI_WEBSITE_URL || "http://localhost:3000";

        if (!khaltiSecretKey) {
          throw new Error("Khalti secret key not configured");
        }

        const data = {
          return_url: successUrl,
          website_url: websiteUrl,
          amount: Number(totalAmount) * 100,
          purchase_order_id: order._id.toString(),
          purchase_order_name: `order_${order._id}`,
        };

        const response = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/initiate/",
          data,
          {
            timeout: 10000,
            headers: {
              Authorization: `Key ${khaltiSecretKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const khaltiData: KhaltiResponse = response.data;

        if (!khaltiData.pidx) {
          throw new Error("Khalti response missing pidx");
        }

        payment.pidx = khaltiData.pidx;
        await payment.save();

        // Clear cart only after successful payment initiation
        await Cart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } }
        );

        return res.status(200).json({
          message: "Khalti payment initiated",
          pidx: khaltiData.pidx,
          payment_url: khaltiData.payment_url,
        });
      } catch (khaltiError: any) {
        // Rollback on Khalti failure
        await OrderDetails.deleteMany({ order: order._id });
        await payment.deleteOne();
        await order.deleteOne();

        console.error("Khalti payment initiation failed:", khaltiError.message);
        return res.status(500).json({
          success: false,
          message: "Khalti payment initiation failed",
          error: khaltiError.message,
        });
      }
    }

    // ================= COD / Default =================
    // Clear cart for COD payment
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
      order,
      items: orderItems,
    });

  } catch (error: any) {
    // Rollback on any error
    if (order) {
      await OrderDetails.deleteMany({ order: order._id });
      await payment?.deleteOne();
      await order.deleteOne();
    }

    console.error("Order creation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
}
static async verifyEsewaPayment(req: Request, res: Response) {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        message: "Missing payment data",
      });
    }


    const decodedData = JSON.parse(
      Buffer.from(data as string, "base64").toString("utf-8")
    );

    const {
      transaction_uuid,
      total_amount,
      product_code,
      signature,
      status,
    } = decodedData;


    const message = `transaction_uuid=${transaction_uuid},total_amount=${total_amount},product_code=${product_code}`;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.ESEWA_SECRET_KEY as string)
      .update(message)
      .digest("base64");

    if (generatedSignature !== signature) {
      return res.status(400).json({
        message: "Invalid signature",
      });
    }

    if (status !== "COMPLETE") {
      return res.status(400).json({
        message: "Payment not completed",
      });
    }

   
    const payment = await Payment.findOne({
      transactionId: transaction_uuid,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

  
    payment.paymentStatus = "paid";
    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      orderStatus: "processing",
    });

    return res.redirect(
      `http://localhost:3000/success?orderId=${payment.order}`
    );

  } catch (error: any) {
    console.error("eSewa Verify Error:", error);

    return res.status(500).json({
      message: "Verification failed",
    });
  }
}
static async verfiyKhaltiPayment(req:Request, res:Response){
try {
    const {pidx} = req.body;
    const response = await axios.post(  "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      })
      const data :TransactionVerificationResponse = response.data;
        console.log(data, ":ans");
        if (data.status === TransactionStatus.COMPLETED) {
  await Payment.findOneAndUpdate(
    { pidx },
    { paymentStatus: PaymentStatus.PAID },
    { new: true }
  );

} else if (data.status === TransactionStatus.PENDING) {
  await Payment.findOneAndUpdate(
    { pidx },
    { paymentStatus: PaymentStatus.UNPAID },
    { new: true }
  );

} else {
  await Payment.findOneAndUpdate(
    { pidx },
    { paymentStatus: PaymentStatus.UNPAID },
    { new: true }
  );
}

        
} catch (error) {
    console.error("Error verifying Khalti payment:", error);
}
    }

  static async getOrder(req: Request, res: Response) {
  try {
    const orders = await Order.find()
      .populate("payment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error: any) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}
  static async getMyOrder(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const { page = 1, limit = 4 } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const pageLimit = parseInt(limit as string, 10) || 4;

    const skip = (pageNum - 1) * pageLimit;

    // 📊 total count
    const totalCount = await Order.countDocuments({
      user: userId,
    });

    // 📦 orders
    const orders = await Order.find({ user: userId })
      .populate("payment")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error: any) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: error.message,
    });
  }
}
static async fetchOrderDetails(req: Request, res: Response) {
  try {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    const orderDetails = await OrderDetails.find({ order: orderId })
      .populate({
        path: "product",
        select: "name price",
        populate: {
          path: "category",
          select: "categoryName",
        },
      })
      .populate({
        path: "order",
        select: "shippingAddress totalAmount createdAt",
        populate: [
          {
            path: "payment",
            select: "paymentMethod paymentStatus",
          },
          {
            path: "user",
            select: "username email",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!orderDetails.length) {
      return res.status(404).json({
        success: false,
        message: "No order details found",
      });
    }

    return res.status(200).json({
      success: true,
      count: orderDetails.length,
      data: orderDetails,
    });

  } catch (error: any) {
    console.error("Fetch Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
static async updateOrderStatus(req: Request, res: Response) {
  try {
    const orderId = req.params.id;
    const orderStatus: OrderStatus = req.body.orderStatus;


    if (!Object.values(OrderStatus).includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderStatus value",
      });
    }

   
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { orderStatus },  
      { new: true }     
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
}
static async paymentStatus(req: Request, res: Response) {
  try {
    const orderId = req.params.id;
    const paymentStatus: PaymentStatus = req.body.paymentStatus;

    console.log("orderId:", orderId);
    console.log("status:", paymentStatus);

    // Validate payment status
    if (!Object.values(PaymentStatus).includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paymentStatus value",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.payment) {
      return res.status(400).json({
        success: false,
        message: "Order has no payment record",
      });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { _id: order.payment },   // filter
      { paymentStatus },        // update
      { new: true }             // return updated doc
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment,
      paymentStatus,
      orderId
    });

  } catch (error: any) {
    console.error("Update Payment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
}
static async cancelOrder(req: Request, res: Response) {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    if (
      order.orderStatus === OrderStatus.SHIPPED ||
      order.orderStatus === OrderStatus.DELIVERED ||
      order.orderStatus === OrderStatus.CANCELED ||
      order.orderStatus === OrderStatus.PROCESSING
    ) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.orderStatus = OrderStatus.CANCELED;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
}
static async deleteOrder(req: Request, res: Response) {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      order.orderStatus === OrderStatus.SHIPPED ||
      order.orderStatus === OrderStatus.DELIVERED
    ) {
      return res.status(400).json({
        message: "Cannot delete this order",
      });
    }

    await OrderDetails.deleteMany({ order: orderId });

    if (order.payment) {
      await Payment.findByIdAndDelete(order.payment);
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
}
}

export default OrderController;