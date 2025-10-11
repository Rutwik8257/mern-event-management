import asyncHandler from 'express-async-handler';

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  res.json({
    message: `Welcome to your dashboard, ${req.user.username}`,
    user: req.user,
  });
});

export { getDashboard };

