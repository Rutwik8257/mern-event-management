// routes/analytics.js
import express from "express";
import Event from "../models/eventModel.js";
import User from "../models/User.js";

const router = express.Router();

// ---------------- KPI Metrics ----------------
router.get("/kpis", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();

    // Count approved participants for KPIs
    const participationCounts = await Event.aggregate([
      { $unwind: "$participants" },
      { $group: { _id: "$participants.status", count: { $sum: 1 } } },
    ]);

    res.json({ totalUsers, totalEvents, participationCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- Event Popularity (Pie Chart) ----------------
router.get("/event-popularity", async (req, res) => {
  try {
    const data = await Event.aggregate([
      { $unwind: "$participants" }, // flatten participants array
      { $match: { "participants.status": "Approved" } }, // only approved participants
      { $group: { _id: "$_id", count: { $sum: 1 } } }, // count per eventId
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      { $project: { _id: "$event.title", count: 1 } }, // replace _id with title
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- User Growth (Line Chart) ----------------
router.get("/user-growth", async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
