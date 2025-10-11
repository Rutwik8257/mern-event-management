import asyncHandler from 'express-async-handler';
import Event from '../models/eventModel.js';

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location } = req.body;

  const event = new Event({
    title,
    description,
    date,
    location,
    createdBy: req.user._id,
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Get all events
// @route   GET /api/events   (Admin sees all)
// @route   GET /api/events/public (Users see public/approved events)
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  let events;

  if (req.user && req.user.role === 'Admin') {
    // Admin: get everything
    events = await Event.find({}).populate('createdBy', 'username email');
  } else {
    // User: only show approved/upcoming events
    events = await Event.find({ date: { $gte: new Date() } })
      .populate('participants.user', 'username email') // include participants
      .select('title description date location participants'); // select participants
  }

  res.json(events);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.location = location || event.location;

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  await event.deleteOne();
  res.json({ message: 'Event removed' });
});

// @desc    Participate in an event
// @route   POST /api/events/:id/participate
// @access  Private/User
const participateInEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId); // use eventId here
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const alreadyParticipating = event.participants.find(
    (p) => p.user.toString() === req.user._id.toString()
  );

  if (alreadyParticipating) {
    res.status(400);
    throw new Error('Already participating in this event');
  }

  event.participants.push({ user: req.user._id });
  await event.save();

  res.status(200).json({ message: 'Participation request sent' });
});

// @desc    Approve/Reject participants
// @route   PUT /api/events/:id/participants
// @access  Private/Admin
const updateParticipantStatus = asyncHandler(async (req, res) => {
  const { userId, status } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const participant = event.participants.find(
    (p) => p.user.toString() === userId
  );

  if (!participant) {
    res.status(404);
    throw new Error('Participant not found');
  }

  participant.status = status;
  await event.save();

  res.json({ message: 'Participant status updated' });
});

// @desc    Get event participants
// @route   GET /api/events/:id/participants
// @access  Private/Admin
const getEventParticipants = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "participants.user",
    "username email"
  );

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Filter only Pending participants
  const pendingParticipants = event.participants.filter(
    (p) => p.status === "Pending"
  );

  res.json(pendingParticipants);
});

// @desc    Get approved participants
// @route   GET /api/events/:id/participants/approved
// @access  Private/Admin
const getApprovedParticipants = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "participants.user",
    "username email"
  );

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const approvedParticipants = event.participants.filter(
    (p) => p.status === "Approved"
  );

  res.json(approvedParticipants);
});

// Approve participant
const approveParticipant = asyncHandler(async (req, res) => {
  const { id: eventId, participantId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const participant = event.participants.id(participantId); // <-- use .id() for subdocument

  if (!participant) {
    res.status(404);
    throw new Error("Participant not found");
  }

  participant.status = "Approved";
  await event.save();

  res.json({ message: "Participant approved", participant });
});
// GET /api/participants/approved
// GET /api/participants/approved
const getAllApprovedParticipants = asyncHandler(async (req, res) => {
  const events = await Event.find({}).populate('participants.user', 'username email title');

  let allApproved = [];
  events.forEach((event) => {
    const approved = event.participants
      .filter((p) => p.status === 'Approved')
      .map((p) => ({
        ...p.toObject(),
        eventId: { _id: event._id, title: event.title },
      }));
    allApproved.push(...approved);
  });

  res.json(allApproved);
});



// Reject participant
const rejectParticipant = asyncHandler(async (req, res) => {
  const { id: eventId, participantId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const participant = event.participants.id(participantId);

  if (!participant) {
    res.status(404);
    throw new Error("Participant not found");
  }

  participant.remove(); // delete subdocument
  await event.save();

  res.json({ message: "Participant rejected" });
});

export {
  approveParticipant,
  createEvent,
  deleteEvent, getAllApprovedParticipants, getApprovedParticipants, getEventParticipants, // ✅ newly added
  getEvents,
  participateInEvent,
  rejectParticipant,
  updateEvent, updateParticipantStatus
};

