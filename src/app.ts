// src/app.ts
import express from 'express';
import './database/connection';
import categoryRoutes from './routes/category-routes';

const app = express();

app.use(express.json());
app.use('/api', categoryRoutes);

export default app;
