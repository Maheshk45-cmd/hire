import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    ticketPrice: { type: Number, required: true },
    primaryHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    coHostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    splitPercentage: {
      type: Number,
      default: 100, // Default to 100% for primary if no co-host
    },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    eventStatus: {
      type: String,
      enum: ["PENDING_COLLAB", "LIVE", "CANCELLED", "FLAGGED"],
      default: "LIVE",
    },
    paymentStatus: {
      type: String,
      enum: ["HELD_IN_ESCROW", "PAYOUT_RELEASED", "REFUNDED"],
      default: "HELD_IN_ESCROW",
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
