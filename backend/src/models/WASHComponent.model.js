const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const WASHComponent = {};

WASHComponent.getByProjectId = async (projectId) => {
    const query = `SELECT * FROM WASHComponent WHERE project_id = $1`;
    const { rows } = await pool.query(query, [projectId]);
    return rows[0];
};

WASHComponent.update = async (projectId, data) => {
    const { presence, wash_percentage, description } = data;
    const query = `
        INSERT INTO WASHComponent (project_id, presence, wash_percentage, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id)
        DO UPDATE SET presence = $2, wash_percentage = $3, description = $4
        RETURNING *
    `;
    const { rows } = await pool.query(query, [projectId, presence, wash_percentage, description]);
    return rows[0];
};

WASHComponent.delete = async (projectId) => {
    await pool.query('DELETE FROM WASHComponent WHERE project_id = $1', [projectId]);
};

module.exports = WASHComponent;
