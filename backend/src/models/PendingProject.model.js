const dbConfig = process.env.NODE_ENV === "production"
    ? require("../config/db")
    : require("../config/db-local");
const { v4: uuidv4 } = require("uuid");

const PendingProject = {};

PendingProject.addPendingProject = async (data) => {
    if (process.env.NODE_ENV === "production") {
        const { pool } = dbConfig;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const {
                title, status, approval_fy, beginning, closing, total_cost_usd,
                gef_grant, cofinancing, wash_finance, wash_finance_percent,
                beneficiaries, objectives, direct_beneficiaries, indirect_beneficiaries,
                beneficiary_description, gender_inclusion, equity_marker,
                equity_marker_description, assessment, alignment_nap, alignment_cff,
                geographic_division, climate_relevance_score, climate_relevance_category,
                climate_relevance_justification, hotspot_vulnerability_type,
                wash_component_description, submitter_email,
                agency_ids = [], location_ids = [], funding_source_ids = [],
                sdg_ids = [], wash_component
            } = data;

            const insertQuery = `
                INSERT INTO PendingProject (
                    title, status, approval_fy, beginning, closing, total_cost_usd,
                    gef_grant, cofinancing, wash_finance, wash_finance_percent,
                    beneficiaries, objectives, direct_beneficiaries, indirect_beneficiaries,
                    beneficiary_description, gender_inclusion, equity_marker,
                    equity_marker_description, assessment, alignment_nap, alignment_cff,
                    geographic_division, climate_relevance_score, climate_relevance_category,
                    climate_relevance_justification, hotspot_vulnerability_type,
                    wash_component_description, submitter_email, agency_ids, location_ids,
                    funding_source_ids, sdg_ids, wash_component
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
                         $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
                RETURNING *
            `;

            const values = [
                title, status, approval_fy, beginning, closing, total_cost_usd,
                gef_grant, cofinancing, wash_finance, wash_finance_percent,
                beneficiaries, objectives, direct_beneficiaries, indirect_beneficiaries,
                beneficiary_description, gender_inclusion, equity_marker,
                equity_marker_description, assessment, alignment_nap, alignment_cff,
                geographic_division, climate_relevance_score, climate_relevance_category,
                climate_relevance_justification, hotspot_vulnerability_type,
                wash_component_description, submitter_email, agency_ids, location_ids,
                funding_source_ids, sdg_ids, wash_component ? JSON.stringify(wash_component) : null
            ];

            const result = await client.query(insertQuery, values);
            await client.query("COMMIT");
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
};

PendingProject.getAllPendingProjects = async () => {
    const { pool } = dbConfig;
    const query = `SELECT * FROM PendingProject ORDER BY submitted_at DESC`;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        ...row,
        wash_component: row.wash_component ? JSON.parse(row.wash_component) : null
    }));
};

PendingProject.getPendingProjectById = async (id) => {
    const { pool } = dbConfig;
    const query = `SELECT * FROM PendingProject WHERE pending_id = $1`;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return {
        ...rows[0],
        wash_component: rows[0].wash_component ? JSON.parse(rows[0].wash_component) : null
    };
};

PendingProject.deletePendingProject = async (id) => {
    const { pool } = dbConfig;
    const query = `DELETE FROM PendingProject WHERE pending_id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

PendingProject.approveProject = async (pendingId) => {
    const { pool } = dbConfig;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const pendingProject = await PendingProject.getPendingProjectById(pendingId);
        if (!pendingProject) throw new Error("Pending project not found");

        const project_id = uuidv4();

        const insertProjectQuery = `
            INSERT INTO Project (
                project_id, title, status, approval_fy, beginning, closing, total_cost_usd,
                gef_grant, cofinancing, wash_finance, wash_finance_percent, beneficiaries,
                objectives, direct_beneficiaries, indirect_beneficiaries,
                beneficiary_description, gender_inclusion, equity_marker,
                equity_marker_description, assessment, alignment_nap, alignment_cff,
                geographic_division, climate_relevance_score, climate_relevance_category,
                climate_relevance_justification, hotspot_vulnerability_type,
                wash_component_description
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
                     $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
            RETURNING *
        `;

        const values = [
            project_id, pendingProject.title, pendingProject.status, pendingProject.approval_fy,
            pendingProject.beginning, pendingProject.closing, pendingProject.total_cost_usd,
            pendingProject.gef_grant, pendingProject.cofinancing, pendingProject.wash_finance,
            pendingProject.wash_finance_percent, pendingProject.beneficiaries, pendingProject.objectives,
            pendingProject.direct_beneficiaries, pendingProject.indirect_beneficiaries,
            pendingProject.beneficiary_description, pendingProject.gender_inclusion,
            pendingProject.equity_marker, pendingProject.equity_marker_description,
            pendingProject.assessment, pendingProject.alignment_nap, pendingProject.alignment_cff,
            pendingProject.geographic_division, pendingProject.climate_relevance_score,
            pendingProject.climate_relevance_category, pendingProject.climate_relevance_justification,
            pendingProject.hotspot_vulnerability_type, pendingProject.wash_component_description
        ];

        const projectResult = await client.query(insertProjectQuery, values);

        if (pendingProject.wash_component && pendingProject.wash_component.presence) {
            const { presence, wash_percentage, description } = pendingProject.wash_component;
            const washQuery = `
                INSERT INTO WASHComponent (project_id, presence, wash_percentage, description)
                VALUES ($1, $2, $3, $4)
            `;
            await client.query(washQuery, [project_id, presence, wash_percentage, description]);
        }

        for (const agencyId of (pendingProject.agency_ids || [])) {
            await client.query('INSERT INTO ProjectAgency (project_id, agency_id) VALUES ($1, $2)', [project_id, agencyId]);
        }

        for (const locationId of (pendingProject.location_ids || [])) {
            await client.query('INSERT INTO ProjectLocation (project_id, location_id) VALUES ($1, $2)', [project_id, locationId]);
        }

        for (const fundingSourceId of (pendingProject.funding_source_ids || [])) {
            await client.query('INSERT INTO ProjectFundingSource (project_id, funding_source_id) VALUES ($1, $2)', [project_id, fundingSourceId]);
        }

        for (const sdgId of (pendingProject.sdg_ids || [])) {
            await client.query('INSERT INTO ProjectSDG (project_id, sdg_id) VALUES ($1, $2)', [project_id, sdgId]);
        }

        await client.query('DELETE FROM PendingProject WHERE pending_id = $1', [pendingId]);
        await client.query("COMMIT");
        return projectResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = PendingProject;