const { pool } = require('../config/db');

const ImplementingEntity = {};

ImplementingEntity.add = async ({ name }) => {
    const query = `INSERT INTO implementingentity (name) VALUES ($1) RETURNING *`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

ImplementingEntity.getAll = async () => {
    const { rows } = await pool.query('SELECT entity_id as id, name, created_at FROM implementingentity ORDER BY name');
    return rows;
};

ImplementingEntity.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE implementingentity SET name = $1 WHERE entity_id = $2 RETURNING entity_id as id, name, created_at',
        [name, id]
    );
    return rows[0];
};

ImplementingEntity.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM projectimplementingentity WHERE entity_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM implementingentity WHERE entity_id = $1', [id]);
};

ImplementingEntity.getById = async (id) => {
    const { rows } = await pool.query('SELECT entity_id as id, name, created_at FROM implementingentity WHERE entity_id = $1', [id]);
    return rows[0];
};

ImplementingEntity.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT entity_id as id, name, created_at FROM implementingentity WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await ImplementingEntity.add({ name });
};

module.exports = ImplementingEntity;
