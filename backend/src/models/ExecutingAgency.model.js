const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ExecutingAgency = {};

ExecutingAgency.add = async ({ name }) => {
    const id = uuidv4();
    const query = `INSERT INTO executingagency (id, name) VALUES ($1, $2) RETURNING *`;
    const values = [id, name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

ExecutingAgency.getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM executingagency ORDER BY name');
    return rows;
};

ExecutingAgency.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE executingagency SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
    );
    return rows[0];
};

ExecutingAgency.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM project_executing_agency WHERE executing_agency_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM executingagency WHERE id = $1', [id]);
};

ExecutingAgency.getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM executingagency WHERE id = $1', [id]);
    return rows[0];
};

ExecutingAgency.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT * FROM executingagency WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await ExecutingAgency.add({ name });
};

module.exports = ExecutingAgency;
