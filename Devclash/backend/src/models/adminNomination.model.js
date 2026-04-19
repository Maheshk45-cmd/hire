import mongoose from "mongoose";

const adminNominationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    nomineeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    nominatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "used", "revoked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const AdminNomination = mongoose.model("AdminNomination", adminNominationSchema);
export default AdminNomination;
