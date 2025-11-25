// models/feedbacks.model.js
const { pool } = require('../config/db');

const Feedback = {};

/**
 * Add a new feedback
 * @param {Object} feedbackData
 * @returns {Object} The created feedback row
 */
Feedback.addFeedback = async ({
                                  issue_type,
                                  priority = 'Medium',
                                  issue_title,
                                  description,
                                  user_name,
                                  email
                              }) => {
    const query = `
        INSERT INTO feedbacks (
            issue_type, priority, issue_title, description, 
            user_name, email
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [
        issue_type,
        priority,
        issue_title,
        description,
        user_name || null,
        email || null
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

/**
 * Get all feedbacks (optionally ordered by created_at descending)
 * @returns {Array} List of feedback rows
 */
Feedback.getAllFeedbacks = async () => {
    const query = `
        SELECT * FROM feedbacks 
        ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

/**
 * Get a single feedback by ID
 * @param {number} id
 * @returns {Object|null} Feedback row or undefined
 */
Feedback.getFeedbackById = async (id) => {
    const query = `SELECT * FROM feedbacks WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

/**
 * Update a feedback
 * @param {number} id
 * @param {Object} updates
 * @returns {Object|null} Updated feedback row
 */
Feedback.updateFeedback = async (id, {
    issue_type,
    priority,
    issue_title,
    description,
    user_name,
    email
}) => {
    const query = `
        UPDATE feedbacks
        SET 
            issue_type = COALESCE($1, issue_type),
            priority = COALESCE($2, priority),
            issue_title = COALESCE($3, issue_title),
            description = COALESCE($4, description),
            user_name = COALESCE($5, user_name),
            email = COALESCE($6, email),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
    `;
    const values = [
        issue_type || null,
        priority || null,
        issue_title || null,
        description || null,
        user_name || null,
        email || null,
        id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
};

/**
 * Delete a feedback by ID
 * @param {number} id
 * @returns {Promise<void>}
 */
Feedback.deleteFeedback = async (id) => {
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [id]);
};

module.exports = Feedback;