const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { createProject, getUserProjects, toggleProjectVisibility } = require("../controllers/projectController");

const router = express.Router();

router.post("/", protect, authorize("Admin"), createProject);
router.patch("/:id/visibility", protect, authorize("Admin"), toggleProjectVisibility);
router.get("/", protect, getUserProjects);

module.exports = router;
