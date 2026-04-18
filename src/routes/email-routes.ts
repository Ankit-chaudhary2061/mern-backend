import express from "express";
import sendMessage from "../controller/message-controller.ts/email-message-controller";


const router = express.Router();

router.post("/contact", sendMessage);

export default router;