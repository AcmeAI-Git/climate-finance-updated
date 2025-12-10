const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const DeliveryPartner = {};

DeliveryPartner.add = async ({ name }) => {
    const id = uuidv4();
    const query = `INSERT INTO deliverypartner (id, name) VALUES ($1, $2) RETURNING *`;
    const values = [id, name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

DeliveryPartner.getAll = async () => {
    const { rows } = await pool.query('SELECT * FROM deliverypartner ORDER BY name');
    return rows;
};

DeliveryPartner.update = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE deliverypartner SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
    );
    return rows[0];
};

DeliveryPartner.delete = async (id) => {
    // First delete from junction table
    await pool.query('DELETE FROM project_delivery_partner WHERE delivery_partner_id = $1', [id]);
    // Then delete the entity
    await pool.query('DELETE FROM deliverypartner WHERE id = $1', [id]);
};

DeliveryPartner.getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM deliverypartner WHERE id = $1', [id]);
    return rows[0];
};

DeliveryPartner.findOrCreate = async (name) => {
    // First try to find existing
    const { rows: existing } = await pool.query(
        'SELECT * FROM deliverypartner WHERE LOWER(name) = LOWER($1)',
        [name]
    );
    if (existing.length > 0) {
        return existing[0];
    }
    // Create new
    return await DeliveryPartner.add({ name });
};

module.exports = DeliveryPartner;
