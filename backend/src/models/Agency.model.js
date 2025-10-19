const { pool } = require('../config/db');
const Agency = {};

Agency.addAgency = async ({ name, type }) => {
    const query = `INSERT INTO Agency (name, type) VALUES ($1, $2) RETURNING *`;
    const values = [name, type];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

Agency.getAllAgencies = async () => {
    const { rows } = await pool.query('SELECT * FROM Agency');
    return rows;
};

Agency.updateAgency = async (id, { name, type }) => {
    const { rows } = await pool.query(
        'UPDATE Agency SET name = $1, type = $2 WHERE agency_id = $3 RETURNING *',
        [name, type, id]
    );
    return rows[0];
};

Agency.deleteAgency = async (id) => {
    await pool.query('DELETE FROM Agency WHERE agency_id = $1', [id]);
};

Agency.getAgencyById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM Agency WHERE agency_id = $1', [id]);
    return rows[0];
};

module.exports = Agency;
