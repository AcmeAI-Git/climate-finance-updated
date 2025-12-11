const express = require("express");
const { getRecentActivities } = require("../controllers/activity.controller");

const router = express.Router();

router.get("/recent", getRecentActivities);

module.exports = router;

