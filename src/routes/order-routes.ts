import { Router } from "express";

import OrderController from "../controller/order/order-controler";
import { OnlyAdmin,  OnlyUser } from "../types/global-types";
import { authenticate } from "../middleware/auth-middleware";


const router = Router();

// ================= CREATE ORDER =================
router.post("/create", authenticate(...OnlyUser), OrderController.createOrder);

// ================= PAYMENT VERIFICATION =================
router.get("/verify-esewa",authenticate(...OnlyUser), OrderController.verifyEsewaPayment);
router.post("/verify-khalti", authenticate(...OnlyUser),OrderController.verfiyKhaltiPayment);

// ================= ORDER FETCH =================
router.get("/", authenticate(...OnlyAdmin), OrderController.getOrder); // admin / all orders
router.get("/my", authenticate(...OnlyUser), OrderController.getMyOrder);

// ================= ORDER DETAILS =================
router.get("/details/:id",authenticate(...OnlyUser), OrderController.fetchOrderDetails);

// ================= UPDATE =================
router.patch("/status/:id",authenticate(...OnlyUser), OrderController.updateOrderStatus);
router.patch("/payment-status/:id", authenticate(...OnlyUser), OrderController.paymentStatus);

// ================= CANCEL =================
router.patch("/cancel/:id", authenticate(...OnlyAdmin), OrderController.cancelOrder);
router.delete("/delete/:id", authenticate(...OnlyAdmin), OrderController.deleteOrder);


export default router;