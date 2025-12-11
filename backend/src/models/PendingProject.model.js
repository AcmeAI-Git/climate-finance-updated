const dbConfig =
    process.env.NODE_ENV === "production"
        ? require("../config/db")
        : require("../config/db-local");
const { v4: uuidv4 } = require("uuid");
const Project = require('./Project.model');

const PendingProject = {};

PendingProject.addPendingProject = async (data) => {
    if (process.env.NODE_ENV === "production") {
        const { pool } = dbConfig;
        const client = await pool.connect();

        // ✅ Helper to safely parse arrays from form-data strings
        const parseArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        };

        try {
            await client.query("BEGIN");

            const {
                title,
                status,
                approval_fy,
                beginning,
                closing,
                total_cost_usd,
                gef_grant,
                cofinancing,
                loan_amount,
                objectives,
                direct_beneficiaries,
                indirect_beneficiaries,
                beneficiary_description,
                gender_inclusion,
                equity_marker,
                equity_marker_description,
                assessment,
                other_alignment,
                geographic_division = [],
                climate_relevance_score,
                climate_relevance_category,
                climate_relevance_justification,
                hotspot_vulnerability_type,
                wash_component_description,
                submitter_email,
                supporting_document,
                agency_ids = [],
                funding_source_ids = [],
                sdg_ids = [],
                districts = [],
                additional_location_info,
                portfolio_type,
                funding_source_name,
                wash_component,
                supporting_link,
                location_segregation,
            } = data;

            // ✅ Parse array-like fields
            const parsedAgencyIds = parseArray(agency_ids);
            const parsedFundingSourceIds = parseArray(funding_source_ids);
            const parsedSdgIds = parseArray(sdg_ids);
            const parsedDistricts = parseArray(districts);
            const parsedGeographicDivision = parseArray(geographic_division);
            
            // Normalize supporting_link to ensure it's always a string
            let normalizedSupportingLink = supporting_link || null;
            if (normalizedSupportingLink) {
                if (typeof normalizedSupportingLink === 'string') {
                    // Try to parse if it looks like JSON
                    if (normalizedSupportingLink.trim().startsWith('[') || normalizedSupportingLink.trim().startsWith('{')) {
                        try {
                            const parsed = JSON.parse(normalizedSupportingLink);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                normalizedSupportingLink = parsed[0]; // Take first URL if array
                            } else if (typeof parsed === 'string') {
                                normalizedSupportingLink = parsed;
                            } else {
                                normalizedSupportingLink = null;
                            }
                        } catch (e) {
                            // Not valid JSON, use as is
                        }
                    }
                } else if (Array.isArray(normalizedSupportingLink) && normalizedSupportingLink.length > 0) {
                    normalizedSupportingLink = normalizedSupportingLink[0];
                } else {
                    normalizedSupportingLink = null;
                }
            } else {
                normalizedSupportingLink = null;
            }

            const insertQuery = `
                INSERT INTO PendingProject (
                    title, status, approval_fy, beginning, closing, total_cost_usd,
                    gef_grant, cofinancing, loan_amount, objectives, direct_beneficiaries,
                    indirect_beneficiaries, beneficiary_description, gender_inclusion,
                    equity_marker, equity_marker_description, assessment, other_alignment,
                    geographic_division, climate_relevance_score,
                    climate_relevance_category, climate_relevance_justification,
                    hotspot_vulnerability_type, wash_component_description,
                    submitter_email, agency_ids, funding_source_ids, sdg_ids, districts,
                    additional_location_info, portfolio_type, funding_source_name,
                    wash_component, supporting_document, supporting_link,
                    location_segregation
                )
                VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
                    $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36
                )
                RETURNING *;
            `;

            const values = [
                title,
                status,
                approval_fy,
                beginning,
                closing,
                total_cost_usd,
                gef_grant,
                cofinancing,
                loan_amount,
                objectives,
                direct_beneficiaries,
                indirect_beneficiaries,
                beneficiary_description,
                gender_inclusion,
                equity_marker,
                equity_marker_description,
                assessment,
                other_alignment || null,
                parsedGeographicDivision,
                climate_relevance_score,
                climate_relevance_category,
                climate_relevance_justification,
                hotspot_vulnerability_type,
                wash_component_description,
                submitter_email,
                parsedAgencyIds,
                parsedFundingSourceIds,
                parsedSdgIds,
                parsedDistricts,
                additional_location_info || null,
                portfolio_type || null,
                funding_source_name || null,
                wash_component ? JSON.stringify(wash_component) : null,
                supporting_document,
                normalizedSupportingLink,
                location_segregation,
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
    return rows.map((row) => ({
        ...row,
        wash_component: row.wash_component
            ? JSON.parse(row.wash_component)
            : null,
    }));
};

PendingProject.getPendingProjectById = async (id) => {
    const { pool } = dbConfig;
    const query = `SELECT * FROM PendingProject WHERE pending_id = $1`;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return null;
    return {
        ...rows[0],
        wash_component: rows[0].wash_component
            ? JSON.parse(rows[0].wash_component)
            : null,
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

        const result = await Project.addProjectWithRelations(pendingProject);

        await client.query("DELETE FROM PendingProject WHERE pending_id = $1", [pendingId]);

        await client.query("COMMIT");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


module.exports = PendingProject;
