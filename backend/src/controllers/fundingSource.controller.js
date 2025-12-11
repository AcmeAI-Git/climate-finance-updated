const FundingSource = require('../models/FundingSource.model');
const Agency = require("../models/Agency.model");
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const DEBUG_LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');
const logDebug = (data) => {
    try {
        fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify({...data, timestamp: Date.now()}) + '\n');
    } catch (e) {}
};

exports.addFundingSource = async (req, res) => {
    try {
        const result = await FundingSource.addFundingSource(req.body);
        res.status(201).json({ status: true, message: 'Funding source added successfully', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getAllFundingSources = async (req, res) => {
    // #region agent log
    logDebug({location:'fundingSource.controller.js:13',message:'getAllFundingSources entry',data:{method:req.method,path:req.path},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'});
    // #endregion
    try {
        // #region agent log
        logDebug({location:'fundingSource.controller.js:16',message:'Before calling getAllFundingSources model',data:{},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'});
        // #endregion
        const result = await FundingSource.getAllFundingSources();
        // #region agent log
        logDebug({location:'fundingSource.controller.js:19',message:'getAllFundingSources success',data:{resultCount:result?.length||0},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'});
        // #endregion
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        // #region agent log
        logDebug({location:'fundingSource.controller.js:22',message:'getAllFundingSources error',data:{errorMessage:e.message,errorStack:e.stack?.substring(0,500),errorCode:e.code},sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'});
        // #endregion
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

// Diagnostic endpoint to check for views and database objects
exports.diagnoseDevPartner = async (req, res) => {
    const client = await pool.connect();
    try {
        const diagnostics = {};
        
        // Check for views
        const viewsResult = await client.query(`
            SELECT table_schema, table_name, view_definition
            FROM information_schema.views
            WHERE view_definition ILIKE '%dev_partner%'
               OR (view_definition ILIKE '%fundingsource%' AND view_definition ILIKE '%fs.%')
        `);
        diagnostics.views = viewsResult.rows;
        
        // Check for materialized views
        const matViewsResult = await client.query(`
            SELECT schemaname, matviewname, definition
            FROM pg_matviews
            WHERE definition ILIKE '%dev_partner%'
               OR definition ILIKE '%fundingsource%'
        `);
        diagnostics.materializedViews = matViewsResult.rows;
        
        // Check table columns
        const columnsResult = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'fundingsource'
            ORDER BY ordinal_position
        `);
        diagnostics.columns = columnsResult.rows;
        
        // Check if there's a view named FundingSource
        const tableTypesResult = await client.query(`
            SELECT table_schema, table_name, table_type
            FROM information_schema.tables
            WHERE table_name ILIKE 'fundingsource'
            ORDER BY table_type
        `);
        diagnostics.tableTypes = tableTypesResult.rows;
        
        // Test the actual query
        try {
            const testQuery = `
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
                LIMIT 1
            `;
            const testResult = await client.query(testQuery);
            diagnostics.testQuery = { success: true, rowCount: testResult.rows.length };
        } catch (testErr) {
            diagnostics.testQuery = { 
                success: false, 
                error: testErr.message,
                code: testErr.code,
                detail: testErr.detail,
                hint: testErr.hint
            };
        }
        
        res.status(200).json({ status: true, diagnostics });
    } catch (err) {
        res.status(500).json({ status: false, message: `Diagnostic error: ${err.message}` });
    } finally {
        client.release();
    }
};

exports.getFundingSourceCount = async (req, res) => {
    try {
        const result = await FundingSource.getFundingSourceCount();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getFundingSourceOverview = async (req, res) => {
    try {
        const result = await FundingSource.getFundingSourceOverview();
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.updateFundingSource = async (req, res) => {
    try {
        const result = await FundingSource.updateFundingSource(req.params.id, req.body);
        res.status(200).json({ status: true, message: 'FundingSource updated', data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.deleteFundingSource = async (req, res) => {
    try {
        await FundingSource.deleteFundingSource(req.params.id);
        res.status(200).json({ status: true, message: 'FundingSource deleted' });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};

exports.getFundingSourceById = async (req, res) => {
    try {
        const result = await FundingSource.getFundingSourceById(req.params.id);
        if (!result) return res.status(404).json({ status: false, message: 'Funding Source not found' });
        res.status(200).json({ status: true, data: result });
    } catch (e) {
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
};
