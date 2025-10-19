const { pool } = require('../config/db');
const Location = {};

Location.addLocation = async ({ name, region }) => {
    const query = `INSERT INTO Location (name, region) VALUES ($1, $2) RETURNING *`;
    const values = [name, region];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

Location.getAllLocations = async () => {
    const { rows } = await pool.query('SELECT * FROM Location');
    return rows;
};

Location.updateLocation = async (id, { name, region }) => {
    const { rows } = await pool.query(
        'UPDATE Location SET name = $1, region = $2 WHERE location_id = $3 RETURNING *',
        [name, region, id]
    );
    return rows[0];
};

Location.deleteLocation = async (id) => {
    await pool.query('DELETE FROM Location WHERE location_id = $1', [id]);
};

Location.getLocationById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM Location WHERE location_id = $1', [id]);
    return rows[0];
};


module.exports = Location;
