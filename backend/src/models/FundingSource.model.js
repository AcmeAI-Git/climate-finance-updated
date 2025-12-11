const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const FundingSource = {};
const DEBUG_LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');
const logDebug = (data) => {
    try {
        fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify({...data, timestamp: Date.now()}) + '\n');
    } catch (e) {}
};

FundingSource.addFundingSource = async (data) => {
    const { name } = data;

    const query = `
        INSERT INTO FundingSource (name)
        VALUES ($1)
        RETURNING *
    `;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

FundingSource.getAllFundingSources = async () => {
    // #region agent log
    logDebug({location:'FundingSource.model.js:17',message:'getAllFundingSources model entry',data:{},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'});
    // #endregion
    const query = `
        SELECT
            fs.funding_source_id,
            fs.name,
            COALESCE(SUM(p.gef_grant), 0) as grant_amount,
            COALESCE(SUM(p.loan_amount), 0) as loan_amount,
            COALESCE(SUM(p.cofinancing), 0) as counterpart_funding,
            COUNT(DISTINCT pfs.project_id) as project_count
        FROM FundingSource fs
        LEFT JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        LEFT JOIN Project p ON pfs.project_id = p.project_id
        GROUP BY fs.funding_source_id, fs.name
        ORDER BY fs.name
    `;
    // #region agent log
    logDebug({location:'FundingSource.model.js:32',message:'Before executing query',data:{queryLength:query.length,queryPreview:query.substring(0,150)},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'});
    // #endregion
    try {
        const { rows } = await pool.query(query);
        // #region agent log
        logDebug({location:'FundingSource.model.js:40',message:'Query executed successfully',data:{rowCount:rows.length},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'});
        // #endregion
        return rows;
    } catch (err) {
        // #region agent log
        logDebug({location:'FundingSource.model.js:44',message:'Query execution error',data:{errorMessage:err.message,errorCode:err.code,errorDetail:err.detail,errorHint:err.hint,errorPosition:err.position,fullQuery:query},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'});
        // #endregion
        throw err;
    }
};

FundingSource.getFundingSourceCount = async () => {
    const query = `
        SELECT
            fs.funding_source_id,
            fs.name AS funding_source_name,
            COUNT(DISTINCT pfs.project_id) AS total_projects
        FROM ProjectFundingSource pfs
                 JOIN FundingSource fs ON pfs.funding_source_id = fs.funding_source_id
        GROUP BY fs.funding_source_id, fs.name
        ORDER BY total_projects DESC;

    `;
    const { rows } = await pool.query(query);
    return rows;
};

FundingSource.getFundingSourceOverview = async () => {
    const query = `
        SELECT
            COUNT(DISTINCT fs.funding_source_id) AS total_funding_sources,
            COUNT(DISTINCT pfs.project_id) AS total_projects_supported
        FROM FundingSource fs
                 LEFT JOIN ProjectFundingSource pfs
                           ON fs.funding_source_id = pfs.funding_source_id;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

FundingSource.getById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM FundingSource WHERE funding_source_id = $1', [id]);
    return rows[0];
};

FundingSource.getFundingSourceById = async (id) => {
    const client = await pool.connect();
    try {
        const fundingSourceQuery = `SELECT * FROM FundingSource WHERE funding_source_id = $1`;
        const fundingSourceResult = await client.query(fundingSourceQuery, [id]);

        if (fundingSourceResult.rows.length === 0) return null;

        const fundingSource = fundingSourceResult.rows[0];

        const projectsQuery = `
            SELECT p.project_id, p.title, p.status, p.beginning, p.closing, p.total_cost_usd, p.gef_grant, p.cofinancing, p.loan_amount,
                   p.climate_relevance_category
            FROM Project p
            INNER JOIN ProjectFundingSource pfs ON p.project_id = pfs.project_id
            WHERE pfs.funding_source_id = $1
            ORDER BY p.beginning DESC
        `;
        const projectsResult = await client.query(projectsQuery, [id]);

        return {
            ...fundingSource,
            projects: projectsResult.rows,
            active_projects: projectsResult.rows.filter(p => p.status === 'Active').length,
            total_grant: projectsResult.rows.reduce((sum, p) => sum + (parseFloat(p.gef_grant) || 0), 0),
            total_loan: projectsResult.rows.reduce((sum, p) => sum + (parseFloat(p.loan_amount) || 0), 0),
            total_co_finance: projectsResult.rows.reduce((sum, p) => sum + (parseFloat(p.cofinancing) || 0), 0),
            total_funded: projectsResult.rows.reduce((sum, p) => sum + (parseFloat(p.total_cost_usd) || 0), 0)
        };
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
};

FundingSource.updateFundingSource = async (id, data) => {
    // Only allow updating name
    const allowedFields = ['name'];
    const filteredData = {};
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            filteredData[key] = data[key];
        }
    }
    
    const fields = Object.keys(filteredData);
    if (fields.length === 0) {
        throw new Error('No valid fields to update');
    }
    
    const values = Object.values(filteredData);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `
        UPDATE FundingSource SET ${setClause}
        WHERE funding_source_id = $${fields.length + 1}
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
            COALESCE(SUM(p.gef_grant), 0) AS total_grants,
            COALESCE(SUM(p.loan_amount), 0) AS total_loans,
            COUNT(DISTINCT pfs.project_id) AS funded_projects
        FROM FundingSource fs
        LEFT JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        LEFT JOIN Project p ON pfs.project_id = p.project_id
    `;
    const { rows } = await pool.query(query);
    return rows[0];
};

module.exports = FundingSource;
