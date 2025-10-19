const { pool } = require('../config/db');
const FundingSource = {};

FundingSource.addFundingSource = async (data) => {
    const {
        name, dev_partner, grant_amount, type, loan_amount,
        counterpart_funding, disbursement, non_grant_instrument
    } = data;

    const query = `
        INSERT INTO FundingSource (
            name, dev_partner, type, grant_amount, loan_amount,
            counterpart_funding, disbursement, non_grant_instrument
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        name, dev_partner, type, grant_amount, loan_amount,
        counterpart_funding, disbursement || 0, non_grant_instrument
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

FundingSource.getAllFundingSources = async () => {
    const { rows } = await pool.query('SELECT * FROM FundingSource ORDER BY name');
    return rows;
};

FundingSource.getFundingSourceById = async (id) => {
    const client = await pool.connect();
    try {
        const fundingSourceQuery = `SELECT * FROM FundingSource WHERE funding_source_id = $1`;
        const fundingSourceResult = await client.query(fundingSourceQuery, [id]);

        if (fundingSourceResult.rows.length === 0) return null;

        const fundingSource = fundingSourceResult.rows[0];

        const projectsQuery = `
            SELECT p.project_id, p.title, p.status, p.approval_fy, p.total_cost_usd,
                   p.climate_relevance_category
            FROM Project p
            INNER JOIN ProjectFundingSource pfs ON p.project_id = pfs.project_id
            WHERE pfs.funding_source_id = $1
            ORDER BY p.approval_fy DESC
        `;
        const projectsResult = await client.query(projectsQuery, [id]);

        return {
            ...fundingSource,
            projects: projectsResult.rows,
            active_projects: projectsResult.rows.filter(p => p.status === 'Active').length,
            total_funded: projectsResult.rows.reduce((sum, p) => sum + (p.total_cost_usd || 0), 0)
        };
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
};

FundingSource.updateFundingSource = async (id, data) => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((f, i) => `${f} = ${i + 1}`).join(', ');
    const query = `
        UPDATE FundingSource SET ${setClause}
        WHERE funding_source_id = ${fields.length + 1}
        RETURNING *
    `;
    const { rows } = await pool.query(query, [...values, id]);
    return rows[0];
};

FundingSource.deleteFundingSource = async (id) => {
    await pool.query('DELETE FROM FundingSource WHERE funding_source_id = $1', [id]);
};

FundingSource.getFundingSourceStats = async () => {
    const query = `
        SELECT
            COUNT(DISTINCT fs.funding_source_id) AS total_funding_sources,
            SUM(fs.grant_amount) AS total_grants,
            SUM(fs.loan_amount) AS total_loans,
            SUM(fs.disbursement) AS total_disbursed,
            COUNT(DISTINCT pfs.project_id) AS funded_projects
        FROM FundingSource fs
        LEFT JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
    `;
    const { rows } = await pool.query(query);
    return rows[0];
};

module.exports = FundingSource;
