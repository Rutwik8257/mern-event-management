import express from "express";
import {
    createEvent,
    createUser,
    deleteEvent,
    deleteUser,
    getAllApprovedParticipants,
    getAllEvents,
    getAllUsers,
    getEventParticipants,
    updateEvent,
    updateParticipantStatus,
    updateUser
} from "../controllers/adminController.js";
import { getNotifications, markAllRead } from "../controllers/notificationController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Users ----------------
router.get("/users", protect, adminOnly, getAllUsers);
router.post("/users", protect, adminOnly, createUser);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// ---------------- Events ----------------
// Events
router.get("/events", protect, adminOnly, getAllEvents);
router.post("/events", protect, adminOnly, createEvent);
router.put("/events/:id", protect, adminOnly, updateEvent);
router.delete("/events/:id", protect, adminOnly, deleteEvent);


// ---------------- Participants ----------------
// Get participants for a specific event
router.get("/events/:eventId/participants", protect, adminOnly, getEventParticipants);
router.get("/participants/approved", protect, adminOnly, getAllApprovedParticipants);

// Update participant status for a specific event
router.put("/events/:eventId/participants", protect, adminOnly, updateParticipantStatus);
router.get("/notifications", protect, adminOnly, getNotifications);
router.patch("/notifications/mark-read", protect, adminOnly, markAllRead);

export default router;
