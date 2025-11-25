const express = require("express");
const authRoutes = require("./auth.routes");
const testRoutes = require("./test.routes");
const projectRoutes = require("./project.routes");
const agencyRoutes = require("./agency.routes");
const locationRoutes = require("./location.routes");
const fundingSource = require("./fundingSource.routes");
const focalArea = require("./focalArea.routes");
const pendingProjectRoutes = require("./pendingProject.routes");
const sdgRoutes = require("./sdg.routes");
const documentRepositoryRoutes = require("./documentRepository.routes");
const pendingDocumentRepositoryRoutes = require("./pendingDocumentRepository.routes");
const feedbackRoutes = require("./feedback.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/test", testRoutes);
router.use("/project", projectRoutes);
router.use("/agency", agencyRoutes);
router.use("/location", locationRoutes);
router.use("/funding-source", fundingSource);
router.use("/focal-area", focalArea);
router.use("/pending-project", pendingProjectRoutes);
router.use("/sdg", sdgRoutes);
router.use("/document-repository", documentRepositoryRoutes);
router.use("/pending-document-repository", pendingDocumentRepositoryRoutes);
router.use("/feedback", feedbackRoutes);

module.exports = router;
