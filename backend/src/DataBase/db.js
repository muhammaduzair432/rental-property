import mongoose from "mongoose";

const DB_NAME = "rental_property";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );

    console.log(`MongoDB connected!! Host: ${connection.connection.host}`);
    console.log("MongoDB name:", connection.connection.name);

  } catch (error) {
    console.log("mongo db connection error", error);
    process.exit(1);
  }
};

export { connectDB };