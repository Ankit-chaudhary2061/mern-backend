// import mongoose from 'mongoose';

// const uri: string = 'mongodb://localhost:27017/broadwayDB';

// mongoose.connect(uri) // no options needed in v8+
//     .then(() => console.log('MongoDB connected ✅'))
//     .catch((err: unknown) => console.error('MongoDB connection error ❌', err));

// export default mongoose;
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  });
