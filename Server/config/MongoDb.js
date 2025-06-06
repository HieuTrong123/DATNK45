import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
// const connectDatabase = async () => {
//   // mongodb+srv://admin:admin@foodies.hplmw.mongodb.net/?retryWrites=true&w=majority&appName=foodies
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URL, {});
//     console.log(`MongoDB Connected`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (mongoose.connections[0].readyState) {
    isConnected = true;
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw new Error('MongoDB connection failed');
  }
};

export default connectDatabase;
