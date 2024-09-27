import mongoose from "mongoose";
import { Token, TokenTransaction } from "./models";

// Fallback for CommonJS
const MongooseModule = mongoose.default || mongoose;
mongoose.set("debug", true);

export async function initMongoose() {
  if (MongooseModule.connection.readyState === 1) {
    // console.log("Already connected to MongoDB");
    return MongooseModule.connection;
  }

  if (!process.env.NEXT_PUBLIC_MONGODB) {
    throw new Error("NEXT_PUBLIC_MONGODB environment variable is not set");
  }

  try {
    // console.log("Attempting to connect to MongoDB...");
    const conn = await MongooseModule.connect(
      process.env.NEXT_PUBLIC_MONGODB,
      {}
    );
    // console.log("Connected to MongoDB");
    return conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export function getModelByName(modelName) {
  // console.log(`Retrieving model by name: ${modelName}`);
  switch (modelName) {
    case "Token":
      return Token;
    case "TokenTransaction":
      return TokenTransaction;
    default:
      throw new Error(`Unknown model name: ${modelName}`);
  }
}
export async function performDatabaseOperation(
  modelName,
  operation,
  criteria = {},
  options = {}
) {
  /* console.log(
    `Performing database operation: ${operation} on model: ${modelName}`
  ); */
  // console.log(`Criteria: ${JSON.stringify(criteria)}`);
  // console.log(`Options: ${JSON.stringify(options)}`); // Changed 'Data' to 'Options'

  const model = getModelByName(modelName);

  try {
    let result;
    switch (operation) {
      case "create":
        result = await model.create(options);
        // console.log(`Created document: ${JSON.stringify(result)}`);
        break;
      case "find":
        // Apply sort options if provided
        result = await model.find(criteria).sort(options.sort || {});
        // console.log(`Found documents: ${JSON.stringify(result)}`);
        break;
      case "findAll":
        result = await model.find().sort(options.sort || {}); // Find all documents without criteria
        // console.log(`Found all documents: ${JSON.stringify(result)}`);
        break;
      case "findOne":
        result = await model.findOne(criteria);
        // console.log(`Found document: ${JSON.stringify(result)}`);
        break;
      case "findOneAndUpdate":
        result = await model.findOneAndUpdate(criteria, options, {
          upsert: true,
          new: true,
        });
        // console.log(`Updated document: ${JSON.stringify(result)}`);
        break;
      case "findOneAndDelete":
        result = await model.findOneAndDelete(criteria);
        // console.log(`Deleted document: ${JSON.stringify(result)}`);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    return result;
  } catch (error) {
    console.error(
      `Error performing ${operation} on model ${modelName}:`,
      error
    );
    throw error;
  }
}
