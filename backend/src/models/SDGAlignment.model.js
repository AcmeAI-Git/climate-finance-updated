const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const SDGAlignment = {};

SDGAlignment.addSDG = async ({ sdg_number, title }) => {
    const query = `INSERT INTO SDGAlignment (sdg_number, title) VALUES ($1, $2) RETURNING *`;
    const { rows } = await pool.query(query, [sdg_number, title]);
    return rows[0];
};

SDGAlignment.getAllSDGs = async () => {
    const { rows } = await pool.query('SELECT * FROM SDGAlignment ORDER BY sdg_number');
    return rows;
};

SDGAlignment.getSDGById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM SDGAlignment WHERE sdg_id = $1', [id]);
    return rows[0];
};

SDGAlignment.updateSDG = async (id, { sdg_number, title }) => {
    const query = `UPDATE SDGAlignment SET sdg_number = $1, title = $2 WHERE sdg_id = $3 RETURNING *`;
    const { rows } = await pool.query(query, [sdg_number, title, id]);
    return rows[0];
};

SDGAlignment.deleteSDG = async (id) => {
    await pool.query('DELETE FROM SDGAlignment WHERE sdg_id = $1', [id]);
};

module.exports = SDGAlignment;
