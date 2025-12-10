const { pool } = require('../config/db');

const DeliveryPartner = {};

DeliveryPartner.add = async ({ name }) => {
    const query = `INSERT INTO deliverypartner (name) VALUES ($1) RETURNING *`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

DeliveryPartner.getAll = async () => {
    const { rows } = await pool.query('SELECT partner_id as id, name, created_at FROM deliverypartner ORDER BY name');
    return rows;
};

DeliveryPartner.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE deliverypartner SET name = $1 WHERE partner_id = $2 RETURNING partner_id as id, name, created_at',
        [name, id]
    );
    return rows[0];
};

DeliveryPartner.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM projectdeliverypartner WHERE partner_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM deliverypartner WHERE partner_id = $1', [id]);
};

DeliveryPartner.getById = async (id) => {
    const { rows } = await pool.query('SELECT partner_id as id, name, created_at FROM deliverypartner WHERE partner_id = $1', [id]);
    return rows[0];
};

DeliveryPartner.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT partner_id as id, name, created_at FROM deliverypartner WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await DeliveryPartner.add({ name });
};

module.exports = DeliveryPartner;
