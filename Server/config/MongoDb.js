import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
const connectDatabase = async () => {
  // mongodb+srv://admin:admin@foodies.hplmw.mongodb.net/?retryWrites=true&w=majority&appName=foodies
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {});
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
