import mongoose from "mongoose";
const connectDatabase = async () => {

  try {
    const conn = await mongoose.connect('mongodb+srv://admin:admin@foodies.hplmw.mongodb.net/?retryWrites=true&w=majority&appName=foodies', {});
    // const conn = await mongoose.connect('mongodb://localhost:27017')
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
