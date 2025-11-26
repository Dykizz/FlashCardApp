import mongoose from "mongoose";

import { UserModel } from "@/models/User";
import { FlashCardModel } from "@/models/FlashCard";
import { QuestionModel } from "@/models/Question";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Declare type cho global mongoose cache
declare global {
  // @ts-ignore
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Sử dụng cached connection
let cached = global.mongooseCache;

if (!cached) {
  global.mongooseCache = { conn: null, promise: null };
  cached = global.mongooseCache;
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      // ⭐ Force register models sau khi connect để đảm bảo collection names đúng
      UserModel;
      FlashCardModel;
      QuestionModel;
      FlashCardProgressModel;
      SourceArticleModel; // Nếu có
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
