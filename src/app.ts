// src/app.ts

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./database/connection";

import categoryRoutes from "./routes/category-routes";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-route";
import brandRoutes from "./routes/brand-routes";
import productRoutes from "./routes/product-routes";
import emailRoutes from "./routes/email-routes";
import cartRoutes from "./routes/cart-routes";
import orderRoutes from "./routes/order-routes";
const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api", categoryRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", brandRoutes);
app.use("/api", productRoutes);
app.use("/api", emailRoutes);
app.use("/api", cartRoutes);
app.use("/api/orders", orderRoutes);


export default app;