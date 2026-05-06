const express = require("express");
const { protect } = require("../middleware/auth");
const { createTask, getTasks, updateTaskStatus, getDashboardSummary } = require("../controllers/taskController");

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.patch("/:id/status", protect, updateTaskStatus);

module.exports = router;
