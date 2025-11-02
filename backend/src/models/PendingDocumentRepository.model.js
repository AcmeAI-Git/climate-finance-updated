const { pool } = require('../config/db');

const PendingDocumentRepository = {};

// Create a new document record
PendingDocumentRepository.create = async (data) => {
    const {
        categories,
        heading,
        sub_heading,
        agency_name,
        submitter_email,
        document_size,
        document_link,
        programme_code,
    } = data;

    const query = `
        INSERT INTO PendingDocumentRepository 
        (categories, heading, sub_heading, agency_name, submitter_email, document_size, document_link, programme_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [categories, heading, sub_heading, agency_name, submitter_email, document_size, document_link, programme_code];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Get all documents
PendingDocumentRepository.getAll = async () => {
    const query = `
        SELECT * FROM PendingDocumentRepository
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Get a single document by ID
PendingDocumentRepository.getById = async (id) => {
    const query = `
        SELECT * FROM PendingDocumentRepository
        WHERE repo_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

// Update a document
PendingDocumentRepository.update = async (repo_id, data) => {
    const {
        categories,
        heading,
        sub_heading,
        agency_name,
        submitter_email,
        document_size,
        document_link,
        programme_code
    } = data;

    const query = `
        UPDATE PendingDocumentRepository
        SET 
            heading = $1,
            sub_heading = $2,
            agency_name = $3,
            submitter_email = $4,
            document_size = $5,
            document_link = $6,
            categories = $7,
            programme_code = $8
            updated_at = CURRENT_TIMESTAMP
        WHERE repo_id = $9
        RETURNING *;
    `;
    const values = [heading, sub_heading, agency_name, submitter_email, document_size, document_link, categories, programme_code, repo_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

// Delete a document
PendingDocumentRepository.delete = async ({repo_id}) => {
    const query = `
        DELETE FROM PendingDocumentRepository
        WHERE repo_id = $1
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [repo_id]);
    return rows[0];
};

module.exports = PendingDocumentRepository;
