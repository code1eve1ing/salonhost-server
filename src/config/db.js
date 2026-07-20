const mongoose = require("mongoose");

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  console.log(`[db] MongoDB connected -> ${mongoose.connection.host}`);
  return cached.conn;
}

module.exports = connectDB;