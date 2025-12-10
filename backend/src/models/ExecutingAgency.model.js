const { pool } = require('../config/db');

const ExecutingAgency = {};

ExecutingAgency.add = async ({ name }) => {
    const query = `INSERT INTO executingagency (name) VALUES ($1) RETURNING *`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

ExecutingAgency.getAll = async () => {
    const { rows } = await pool.query('SELECT agency_id as id, name, created_at FROM executingagency ORDER BY name');
    return rows;
};

ExecutingAgency.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE executingagency SET name = $1 WHERE agency_id = $2 RETURNING agency_id as id, name, created_at',
        [name, id]
    );
    return rows[0];
};

ExecutingAgency.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM projectexecutingagency WHERE agency_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM executingagency WHERE agency_id = $1', [id]);
};

ExecutingAgency.getById = async (id) => {
    const { rows } = await pool.query('SELECT agency_id as id, name, created_at FROM executingagency WHERE agency_id = $1', [id]);
    return rows[0];
};

ExecutingAgency.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT agency_id as id, name, created_at FROM executingagency WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await ExecutingAgency.add({ name });
};

module.exports = ExecutingAgency;
