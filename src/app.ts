// src/app.ts
import express from 'express';
import './database/connection';
import categoryRoutes from './routes/category-routes';
import authRoutes from './routes/auth-routes';

const app = express();

app.use(express.json());
app.use('/api', categoryRoutes);
app.use('/api', authRoutes);


export default app;
