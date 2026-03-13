import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  await mongoose.connect(mongoUri).then(() => {
    console.log("Database connected successfully");
  });
};

export default connectDB;
