import express from "express";
import {
  approveParticipant,
  createEvent,
  deleteEvent,
  getAllApprovedParticipants,
  getApprovedParticipants,
  getEventParticipants,
  getEvents,
  participateInEvent,
  rejectParticipant,
  updateEvent
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all events
router.get("/", protect, getEvents);

// Create new event (Admin only)
router.post("/", protect, createEvent);

// Update event (Admin only)
router.put("/:id", protect, updateEvent);

// Delete event (Admin only)
router.delete("/:id", protect, deleteEvent);

// Register for an event (User)
router.post("/:eventId/register", protect, participateInEvent);


// Get participants for an event (Admin only)
router.get("/:id/participants", protect, getEventParticipants);
// Approve participant (Admin)
router.put("/:id/participants/:participantId/approve", protect, approveParticipant);
router.get('/participants/approved', protect, getAllApprovedParticipants);
// Reject/Delete participant (Admin)
router.delete("/:id/participants/:participantId/reject", protect, rejectParticipant);
// Get approved participants for an event (Admin only)
router.get("/:id/participants/approved", protect, getApprovedParticipants);




export default router;
