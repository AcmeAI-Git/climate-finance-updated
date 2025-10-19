const { pool } = require('../config/db');
const FocalArea = {};

FocalArea.addFocalArea = async ({ name }) => {
    const query = `INSERT INTO FocalArea (name) VALUES ($1) RETURNING *`;
    const { rows } = await pool.query(query, [name]);
    return rows[0];
};

FocalArea.getAllFocalAreas = async () => {
    const { rows } = await pool.query('SELECT * FROM FocalArea');
    return rows;
};

FocalArea.updateFocalArea = async (id, { name }) => {
    const { rows } = await pool.query(
        'UPDATE FocalArea SET name = $1 WHERE focal_area_id = $2 RETURNING *',
        [name, id]
    );
    return rows[0];
};

FocalArea.deleteFocalArea = async (id) => {
    await pool.query('DELETE FROM FocalArea WHERE focal_area_id = $1', [id]);
};

FocalArea.getFocalAreaById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM FocalArea WHERE focal_area_id = $1', [id]);
    return rows[0];
};


module.exports = FocalArea;
