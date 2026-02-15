// src/app.ts
import express from 'express';
import './database/connection';
import categoryRoutes from './routes/category-routes';
import authRoutes from './routes/auth-routes';
import userRoutes from './routes/user-route';
import brandRoutes from './routes/brand-routes';




const app = express();

app.use(express.json());
app.use('/api', categoryRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', brandRoutes);




export default app;
