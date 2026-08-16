import mongoose from "mongoose";

const DB_NAME = "rental_property";

// Cache the mongoose connection across invocations in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(`${process.env.MONGO_DB_URI}${DB_NAME}`, opts).then((mongoose) => {
      console.log(`MongoDB connected!! Host: ${mongoose.connection.host}`);
      console.log("MongoDB name:", mongoose.connection.name);
      return mongoose;
    }).catch(error => {
      console.log("mongo db connection error", error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

export { connectDB };