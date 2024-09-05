import mongoose from "mongoose";
import { TokenEvent, TokenTransactionEvent } from "./models";

// Fallback for CommonJS
const MongooseModule = mongoose.default || mongoose;

export async function initMongoose() {
  if (MongooseModule.connection.readyState === 1) {
    console.log("Already connected to MongoDB");
    return MongooseModule.connection;
  }

  if (!process.env.NEXT_PUBLIC_MONGODB) {
    throw new Error("NEXT_PUBLIC_MONGODB environment variable is not set");
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    const conn = await MongooseModule.connect(process.env.NEXT_PUBLIC_MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    return conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export function getModelByName(modelName) {
  switch (modelName) {
    case "TokenEvent":
      return TokenEvent;
    case "TokenTransactionEvent":
      return TokenTransactionEvent;
    default:
      throw new Error(`Unknown model name: ${modelName}`);
  }
}

// Generic function to perform CRUD operations on any Mongoose model
export async function performDatabaseOperation(
  modelName,
  operation,
  criteria,
  data = {}
) {
  const model = getModelByName(modelName);

  switch (operation) {
    case "create":
      return await model.create(data);
    case "find":
      return await model.find(criteria);
    case "findOne":
      return await model.findOne(criteria);
    case "findOneAndUpdate":
      return await model.findOneAndUpdate(criteria, data, {
        upsert: true,
        new: true,
      });
    case "findOneAndDelete":
      return await model.findOneAndDelete(criteria);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}
