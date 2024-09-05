import mongoose from "mongoose";

// Schema for Token Creation Events
const tokenSchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    initialSupply: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    twitterLink: { type: String },
    telegramLink: { type: String },
    websiteLink: { type: String },
  },
  { timestamps: true }
);

// Schema for Token Buy and Sell Events
const tokenTransactionSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["TokenPurchased", "TokenSold"],
      required: true,
    },
    buyer: { type: String }, // Only required for TokenPurchased events
    seller: { type: String }, // Only required for TokenSold events
    tokenAddress: { type: String, required: true },
    ethSpent: { type: String }, // Only applicable for TokenPurchased events
    ethReceived: { type: String }, // Only applicable for TokenSold events
    tokensBought: { type: String }, // Only applicable for TokenPurchased events
    tokensSold: { type: String }, // Only applicable for TokenSold events
    pricePerToken: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

// Check if the model already exists before creating it
const TokenEvent =
  mongoose.models.TokenEvent || mongoose.model("TokenEvent", tokenSchema);
const TokenTransactionEvent =
  mongoose.models.TokenTransaction ||
  mongoose.model("TokenTransaction", tokenTransactionSchema);

module.exports = {
  TokenEvent,
  TokenTransactionEvent,
};
