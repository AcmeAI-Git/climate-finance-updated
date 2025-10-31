const { pool } = require('../config/db');

const documentRepository = {};

// ✅ Create a new document record
documentRepository.create = async (data) => {
    const {
        categories,
        heading,
        sub_heading,
        agency_name,
        document_size,
        document_link,
    } = data;

    const query = `
        INSERT INTO DocumentRepository 
        (categories, heading, sub_heading, agency_name, document_size, document_link)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [categories, heading, sub_heading, agency_name, document_size, document_link];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// ✅ Get all documents
documentRepository.getAll = async () => {
    const query = `
        SELECT * FROM DocumentRepository
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// ✅ Get a single document by ID
documentRepository.getById = async (repo_id) => {
    const query = `
        SELECT * FROM DocumentRepository
        WHERE repo_id = $1;
    `;
    const { rows } = await pool.query(query, [repo_id]);
    return rows[0];
};

// ✅ Update a document
documentRepository.update = async (repo_id, data) => {
    const {
        categories,
        heading,
        sub_heading,
        agency_name,
        document_size,
        document_link,
    } = data;

    const query = `
        UPDATE DocumentRepository
        SET 
            heading = $1,
            sub_heading = $2,
            agency_name = $3,
            document_size = $4,
            document_link = $5,
            categories = $6
            updated_at = CURRENT_TIMESTAMP
        WHERE repo_id = $7
        RETURNING *;
    `;
    const values = [heading, sub_heading, agency_name, document_size, document_link, categories, repo_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// ✅ Delete a document
documentRepository.delete = async (repo_id) => {
    const query = `
        DELETE FROM DocumentRepository
        WHERE repo_id = $1
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [repo_id]);
    return rows[0];
};

module.exports = documentRepository;
