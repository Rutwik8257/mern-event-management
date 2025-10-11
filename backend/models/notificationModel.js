import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, required: true }, // event_created, participant_approved, etc.
    data: { type: Object },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
