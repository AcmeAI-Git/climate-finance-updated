const express = require("express");
const router = express.Router();
const pendingProjectController = require("../controllers/pendingProject.controller");

// Public route - anyone can submit a project
router.post("/submit", pendingProjectController.addPendingProject);

// Admin routes - require authentication
router.get("/all", pendingProjectController.getAllPendingProjects);
router.get("/:id", pendingProjectController.getPendingProjectById);
router.put("/approve/:id", pendingProjectController.approveProject);
router.delete("/reject/:id", pendingProjectController.rejectProject);

module.exports = router;
