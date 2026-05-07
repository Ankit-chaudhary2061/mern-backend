// server.ts
import adminSeeder from './src/admin-seeder';
import dotenv from 'dotenv';
dotenv.config();


import app from './src/app';

const startServer = async () => {
  const port = process.env.PORT || 8000;
  // Seed admin credentials

  await adminSeeder();
    console.log("Admin seeder finished ✔");

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();
