import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: String,          // 'user' or 'bot'
  text: String,
  timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model("Message", messageSchema);
