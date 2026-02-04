import mongoose from 'mongoose';

const uri: string = 'mongodb://localhost:27017/broadwayDB';

mongoose.connect(uri) // no options needed in v8+
    .then(() => console.log('MongoDB connected ✅'))
    .catch((err: unknown) => console.error('MongoDB connection error ❌', err));

export default mongoose;
