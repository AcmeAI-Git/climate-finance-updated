const Activity = require("../models/Activity.model");

/**
 * Get recent activities for admin dashboard
 */
exports.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = await Activity.getRecentActivities(limit);
        
        res.status(200).json({
            status: true,
            data: activities,
        });
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json({
            status: false,
            message: `Error: ${error.message}`,
        });
    }
};
