const { pool } = require('../config/db');

const Agency = {};

Agency.add = async ({ name }) => {
    const query = `INSERT INTO agency (name) VALUES ($1) RETURNING *`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

Agency.getAll = async () => {
    const { rows } = await pool.query('SELECT agency_id as id, name, created_at FROM agency ORDER BY name');
    return rows;
};

Agency.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE agency SET name = $1 WHERE agency_id = $2 RETURNING agency_id as id, name, created_at',
        [name, id]
    );
    return rows[0];
};

Agency.delete = async (id) => {
    // First delete from junction tables
    await pool.query('DELETE FROM projectimplementingagency WHERE agency_id = $1', [id]);
    await pool.query('DELETE FROM projectexecutingagency WHERE agency_id = $1', [id]);
    // Then delete the agency
    await pool.query('DELETE FROM agency WHERE agency_id = $1', [id]);
};

Agency.getById = async (id) => {
    const { rows } = await pool.query('SELECT agency_id as id, name, created_at FROM agency WHERE agency_id = $1', [id]);
    return rows[0];
};

Agency.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT agency_id as id, name, created_at FROM agency WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await Agency.add({ name });
};

module.exports = Agency;
