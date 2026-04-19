import mongoose from "mongoose";

const adminRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    votes: [
      {
        directorEmail: { type: String, required: true },
        vote: { type: String, enum: ["approve", "reject"], required: true },
      },
    ],
  },
  { timestamps: true }
);

const AdminRequest = mongoose.model("AdminRequest", adminRequestSchema);
export default AdminRequest;
