import asyncHandler from 'express-async-handler';
import Event from '../models/eventModel.js';


const getDashboard = asyncHandler(async (req, res) => {
  const events = await Event.find({
    'participants.user': req.user._id,
  })
    .populate('participants.user', 'username email')
    .lean();

  const participatingEvents = events.map((event) => {
    const participant = event.participants.find(
      (p) => p.user._id.toString() === req.user._id.toString()
    );
    return {
      ...event,
      participantStatus: participant?.status || 'Pending', 
    };
  });

  res.json({
    message: `Welcome to your dashboard, ${req.user.username}`,
    user: req.user,
    participatingEvents,
  });
});


export { getDashboard };
