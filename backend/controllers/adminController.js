import asyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import Notification from "../models/notificationModel.js"; // ✅ import Notification
import User from "../models/User.js";

// ======================= USERS =======================
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: role || "User",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// ======================= EVENTS =======================
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().populate("createdBy", "username email");
  res.json(events);
});

const createEvent = asyncHandler(async (req, res) => {
  const event = new Event({ ...req.body, createdBy: req.user._id });
  const createdEvent = await event.save();

  // ✅ Create notification when event is created
  await Notification.create({
    message: `Event "${createdEvent.title}" created by ${
      req.user?.username || req.user?.email || req.user._id
    }`,
    type: "event_created",
    data: { eventId: createdEvent._id.toString() },
  });

  res.status(201).json(createdEvent);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.location = req.body.location || event.location;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error("Event not found");
  }
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } else {
    res.status(404);
    throw new Error("Event not found");
  }
});

// ======================= PARTICIPANTS =======================
const getEventParticipants = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId).populate(
    "participants.user",
    "username email"
  );

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  res.json(event.participants); // Returns all participants with their status
});

const updateParticipantStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { userId, status } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const participant = event.participants.find(
    (p) => p.user.toString() === userId
  );
  if (!participant) {
    res.status(404);
    throw new Error("Participant not found");
  }

  participant.status = status; // 'Approved' or 'Rejected'
  await event.save();

  // ✅ Notification when participant status updated
  const userObj = await User.findById(userId).select("username email");
  await Notification.create({
    message: `${
      userObj?.username || userObj?.email || userId
    } ${status.toLowerCase()} for event "${event.title}"`,
    type:
      status === "Approved" ? "participant_approved" : "participant_rejected",
    data: { eventId: event._id.toString(), userId },
  });

  res.json(participant);
});

const getAllApprovedParticipants = asyncHandler(async (req, res) => {
  // Find all events with approved participants
  const events = await Event.find({ "participants.status": "Approved" }).populate(
    "participants.user",
    "username email"
  );

  const approvedParticipants = [];

  // Flatten participants into a simple list
  events.forEach((event) => {
    event.participants.forEach((p) => {
      if (p.status === "Approved") {
        approvedParticipants.push({
          username: p.user.username,
          email: p.user.email,
          event: event.title,
        });
      }
    });
  });

  res.json(approvedParticipants);
});

// ======================= EXPORTS =======================
export {
  createEvent, createUser, deleteEvent, deleteUser, getAllApprovedParticipants, getAllEvents, getAllUsers, getEventParticipants, updateEvent, updateParticipantStatus, updateUser
};

