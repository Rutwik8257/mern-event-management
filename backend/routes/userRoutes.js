import express from "express";
import { getDashboard } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user dashboard data (requires login)
router.get("/dashboard", protect, getDashboard);

export default router;
