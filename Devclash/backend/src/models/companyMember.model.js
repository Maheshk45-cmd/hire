import mongoose from "mongoose";

const companyMemberSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ["owner", "admin", "employee"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "rejected"],
      default: "pending",
    },
    is_verified_owner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CompanyMember = mongoose.model("CompanyMember", companyMemberSchema);
export default CompanyMember;
