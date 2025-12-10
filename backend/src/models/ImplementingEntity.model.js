const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ImplementingEntity = {};

ImplementingEntity.add = async ({ name }) => {
    const id = uuidv4();
    const query = `INSERT INTO implementingentity (id, name) VALUES ($1, $2) RETURNING *`;
    const values = [id, name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

ImplementingEntity.getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM implementingentity ORDER BY name');
    return rows;
};

ImplementingEntity.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE implementingentity SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
    );
    return rows[0];
};

ImplementingEntity.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM project_implementing_entity WHERE implementing_entity_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM implementingentity WHERE id = $1', [id]);
};

ImplementingEntity.getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM implementingentity WHERE id = $1', [id]);
    return rows[0];
};

ImplementingEntity.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT * FROM implementingentity WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await ImplementingEntity.add({ name });
};

module.exports = ImplementingEntity;
