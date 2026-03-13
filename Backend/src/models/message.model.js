import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    content: { type: String },
    role: { type: String, enum: ["user", "ai"] },
  },
  { timestamps: true},
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;