import asyncHandler from 'express-async-handler';
import Event from '../models/eventModel.js';


const getDashboard = asyncHandler(async (req, res) => {
  const participatingEvents = await Event.find({
    'participants.user': req.user._id,
  })
    .populate('participants.user', 'username email')
    .lean();

  res.json({
    message: `Welcome to your dashboard, ${req.user.username}`,
    user: req.user,
    participatingEvents,
  });
});

export { getDashboard };
