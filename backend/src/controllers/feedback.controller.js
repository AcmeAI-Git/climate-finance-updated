const Feedback = require('../models/feedback.model');

const createFeedback = async (req, res) => {
    try {
        const {
            issue_type,
            priority,
            issue_title,
            description,
            user_name,
            email
        } = req.body;

        // Basic required field validation
        if (!issue_type || !issue_title || !description) {
            return res.status(400).json({
                success: false,
                message: 'issue_type, issue_title, and description are required'
            });
        }

        const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: `priority must be one of: ${validPriorities.join(', ')}`
            });
        }

        const newFeedback = await Feedback.addFeedback({
            issue_type,
            priority,
            issue_title,
            description,
            user_name: user_name?.trim() || null,
            email: email?.trim() || null
        });

        return res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: newFeedback
        });

    } catch (error) {
        console.error('Error creating feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.getAllFeedbacks();

        return res.status(200).json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });

    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve feedbacks'
        });
    }
};

const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.getFeedbackById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate priority if being updated
        if (updates.priority) {
            const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
            if (!validPriorities.includes(updates.priority)) {
                return res.status(400).json({
                    success: false,
                    message: `priority must be one of: ${validPriorities.join(', ')}`
                });
            }
        }

        const updatedFeedback = await Feedback.updateFeedback(id, updates);

        if (!updatedFeedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Feedback updated successfully',
            data: updatedFeedback
        });

    } catch (error) {
        console.error('Error updating feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update feedback'
        });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.getFeedbackById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        await Feedback.deleteFeedback(id);

        return res.status(200).json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting feedback:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete feedback'
        });
    }
};

module.exports = {
    createFeedback,
    getAllFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
};