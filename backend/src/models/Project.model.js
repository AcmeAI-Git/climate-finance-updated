const { pool } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const Project = {};

Project.addProjectWithRelations = async (data) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Destructure and validate input
        let {
            title,
            status,
            approval_fy,
            beginning,
            closing,
            total_cost_usd,
            gef_grant,
            cofinancing,
            wash_finance,
            wash_finance_percent,
            beneficiaries,
            objectives,
            direct_beneficiaries,
            indirect_beneficiaries,
            beneficiary_description,
            gender_inclusion,
            equity_marker,
            equity_marker_description,
            assessment,
            alignment_nap,
            alignment_cff,
            geographic_division,
            climate_relevance_score,
            climate_relevance_category,
            climate_relevance_justification,
            hotspot_vulnerability_type,
            wash_component_description,
            supporting_document,
            agency_ids = [],
            location_ids = [],
            funding_source_ids = [],
            sdg_ids = [],
            wash_component,
        } = data;

        // Helper function to parse and validate array fields
        const parseArrayField = (field, fieldName) => {
            if (!field) return [];
            if (Array.isArray(field)) {
                // Ensure all elements are valid integers
                const parsed = field.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
                if (parsed.length !== field.length) {
                    throw new Error(`${fieldName} contains invalid integer values`);
                }
                return parsed;
            }
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field).map(id => parseInt(id, 10)).filter(id => !isNaN(id));
                    if (parsed.length === 0 && field !== '[]') {
                        throw new Error(`${fieldName} is an empty or invalid array`);
                    }
                    return parsed;
                } catch (err) {
                    throw new Error(`Invalid JSON format for ${fieldName}: ${err.message}`);
                }
            }
            throw new Error(`${fieldName} must be an array or valid JSON array string`);
        };

        // Parse array fields
        const parsedAgencyIds = parseArrayField(agency_ids, 'agency_ids');
        const parsedLocationIds = parseArrayField(location_ids, 'location_ids');
        const parsedFundingSourceIds = parseArrayField(funding_source_ids, 'funding_source_ids');
        const parsedSdgIds = parseArrayField(sdg_ids, 'sdg_ids');

        // Validate required fields (adjust based on your schema)
        if (!title || !status || !approval_fy) {
            throw new Error('Missing required fields: title, status, or approval_fy');
        }

        const project_id = uuidv4();

        // Insert project
        const insertProjectQuery = `
                INSERT INTO Project (
                    project_id, title, status, approval_fy, beginning, closing,
                    total_cost_usd, gef_grant, cofinancing, wash_finance,
                    wash_finance_percent, beneficiaries, objectives,
                    direct_beneficiaries, indirect_beneficiaries, beneficiary_description,
                    gender_inclusion, equity_marker, equity_marker_description,
                    assessment, alignment_nap, alignment_cff, geographic_division,
                    climate_relevance_score, climate_relevance_category, 
                    climate_relevance_justification, hotspot_vulnerability_type,
                    wash_component_description, supporting_document
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
                RETURNING *
            `;

        const values = [
            project_id,
            title,
            status,
            approval_fy,
            beginning,
            closing,
            parseFloat(total_cost_usd) || 0,
            parseFloat(gef_grant) || 0,
            parseFloat(cofinancing) || 0,
            parseFloat(wash_finance) || 0,
            parseFloat(wash_finance_percent) || 0,
            beneficiaries,
            objectives,
            parseInt(direct_beneficiaries, 10) || 0,
            parseInt(indirect_beneficiaries, 10) || 0,
            beneficiary_description,
            gender_inclusion === 'true' || gender_inclusion === true,
            parseInt(equity_marker, 10) || 0,
            equity_marker_description,
            assessment,
            alignment_nap,
            alignment_cff,
            geographic_division,
            parseFloat(climate_relevance_score) || 0,
            climate_relevance_category,
            climate_relevance_justification,
            hotspot_vulnerability_type,
            wash_component_description,
            supporting_document,
        ];

        await client.query(insertProjectQuery, values);

        // Insert WASH component
        if (wash_component && typeof wash_component === 'string') {
            try {
                wash_component = JSON.parse(wash_component);
            } catch (err) {
                throw new Error(`Invalid JSON format for wash_component: ${err.message}`);
            }
        }

        if (wash_component && wash_component.presence) {
            const { presence, wash_percentage, description } = wash_component;
            const insertWASH = `
                    INSERT INTO WASHComponent (project_id, presence, wash_percentage, description)
                    VALUES ($1, $2, $3, $4)
                `;
            await client.query(insertWASH, [
                project_id,
                presence,
                parseFloat(wash_percentage) || 0,
                description,
            ]);
        }

        // Insert relationships
        for (const agency_id of parsedAgencyIds) {
            await client.query(
                "INSERT INTO ProjectAgency (project_id, agency_id) VALUES ($1, $2)",
                [project_id, agency_id]
            );
        }

        for (const location_id of parsedLocationIds) {
            await client.query(
                "INSERT INTO ProjectLocation (project_id, location_id) VALUES ($1, $2)",
                [project_id, location_id]
            );
        }

        for (const funding_source_id of parsedFundingSourceIds) {
            await client.query(
                "INSERT INTO ProjectFundingSource (project_id, funding_source_id) VALUES ($1, $2)",
                [project_id, funding_source_id]
            );
        }

        for (const sdg_id of parsedSdgIds) {
            await client.query(
                "INSERT INTO ProjectSDG (project_id, sdg_id) VALUES ($1, $2)",
                [project_id, sdg_id]
            );
        }

        await client.query("COMMIT");
        return { project_id, status: true, message: "Project added successfully" };
    } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Server Error: ${err.message}`);
    } finally {
        client.release();
    }
},

Project.getAllProjects = async () => {
    const client = await pool.connect();
    try {
        const projectQuery = `
            SELECT 
                p.*,
                wc.presence as wash_presence,
                wc.wash_percentage,
                wc.description as wash_description
            FROM Project p
            LEFT JOIN WASHComponent wc ON p.project_id = wc.project_id
            ORDER BY p.created_at DESC
        `;
        const projectResult = await client.query(projectQuery);

        const agencyQuery = `
            SELECT pa.project_id, pa.agency_id, a.name as agency_name
            FROM ProjectAgency pa
            INNER JOIN Agency a ON pa.agency_id = a.agency_id
        `;
        const agencyResult = await client.query(agencyQuery);

        const fundingSourceQuery = `
            SELECT pfs.project_id, pfs.funding_source_id, fs.name as funding_source_name
            FROM ProjectFundingSource pfs
            INNER JOIN FundingSource fs ON pfs.funding_source_id = fs.funding_source_id
        `;
        const fundingSourceResult = await client.query(fundingSourceQuery);

        const sdgQuery = `
            SELECT ps.project_id, ps.sdg_id, s.sdg_number, s.title
            FROM ProjectSDG ps
            INNER JOIN SDGAlignment s ON ps.sdg_id = s.sdg_id
        `;
        const sdgResult = await client.query(sdgQuery);

        const agencyMap = {};
        const fundingSourceMap = {};
        const sdgMap = {};

        agencyResult.rows.forEach((row) => {
            if (!agencyMap[row.project_id]) agencyMap[row.project_id] = [];
            agencyMap[row.project_id].push({
                agency_id: row.agency_id,
                name: row.agency_name,
            });
        });

        fundingSourceResult.rows.forEach((row) => {
            if (!fundingSourceMap[row.project_id])
                fundingSourceMap[row.project_id] = [];
            fundingSourceMap[row.project_id].push({
                funding_source_id: row.funding_source_id,
                name: row.funding_source_name,
            });
        });

        sdgResult.rows.forEach((row) => {
            if (!sdgMap[row.project_id]) sdgMap[row.project_id] = [];
            sdgMap[row.project_id].push({
                sdg_id: row.sdg_id,
                sdg_number: row.sdg_number,
                title: row.title,
            });
        });

        return projectResult.rows.map((row) => {
            const {
                wash_presence,
                wash_percentage,
                wash_description,
                ...projectData
            } = row;

            return {
                ...projectData,
                agencies: agencyMap[row.project_id] || [],
                funding_sources: fundingSourceMap[row.project_id] || [],
                sdgs: sdgMap[row.project_id] || [],
                wash_component: {
                    presence: wash_presence || false,
                    wash_percentage: wash_percentage || 0,
                    description: wash_description,
                },
            };
        });
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
};

Project.getProjectById = async (id) => {
    const client = await pool.connect();
    try {
        const projectQuery = `
            SELECT p.*, wc.presence, wc.wash_percentage, wc.description
            FROM Project p
            LEFT JOIN WASHComponent wc ON p.project_id = wc.project_id
            WHERE p.project_id = $1
        `;
        const projectResult = await client.query(projectQuery, [id]);

        if (projectResult.rows.length === 0) return null;

        const project = projectResult.rows[0];

        const agenciesQuery = `
            SELECT a.agency_id, a.name, a.type
            FROM Agency a
            INNER JOIN ProjectAgency pa ON a.agency_id = pa.agency_id
            WHERE pa.project_id = $1
        `;
        const agenciesResult = await client.query(agenciesQuery, [id]);

        const locationsQuery = `
            SELECT l.location_id, l.name, l.region
            FROM Location l
            INNER JOIN ProjectLocation pl ON l.location_id = pl.location_id
            WHERE pl.project_id = $1
        `;
        const locationsResult = await client.query(locationsQuery, [id]);

        const fundingSourcesQuery = `
            SELECT fs.funding_source_id, fs.name, fs.dev_partner, fs.grant_amount, fs.loan_amount
            FROM FundingSource fs
            INNER JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
            WHERE pfs.project_id = $1
        `;
        const fundingSourcesResult = await client.query(fundingSourcesQuery, [
            id,
        ]);

        const sdgsQuery = `
            SELECT s.sdg_id, s.sdg_number, s.title
            FROM SDGAlignment s
            INNER JOIN ProjectSDG ps ON s.sdg_id = ps.sdg_id
            WHERE ps.project_id = $1
        `;
        const sdgsResult = await client.query(sdgsQuery, [id]);

        const { presence, wash_percentage, description, ...projectData } =
            project;

        return {
            ...projectData,
            agencies: agenciesResult.rows.map((row) => row.agency_id),
            locations: locationsResult.rows.map((row) => row.location_id),
            funding_sources: fundingSourcesResult.rows.map(
                (row) => row.funding_source_id
            ),
            sdgs: sdgsResult.rows.map((row) => row.sdg_id),
            projectAgencies: agenciesResult.rows,
            projectLocations: locationsResult.rows,
            projectFundingSources: fundingSourcesResult.rows,
            projectSDGs: sdgsResult.rows,
            wash_component: {
                presence: presence || false,
                wash_percentage: wash_percentage || 0,
                description,
            },
        };
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
};

Project.updateProject = async (id, data) => {
    const client = await pool.connect();
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
            wash_finance,
            wash_finance_percent,
            beneficiaries,
            objectives,
            direct_beneficiaries,
            indirect_beneficiaries,
            beneficiary_description,
            gender_inclusion,
            equity_marker,
            equity_marker_description,
            assessment,
            alignment_nap,
            alignment_cff,
            geographic_division,
            climate_relevance_score,
            climate_relevance_category,
            climate_relevance_justification,
            hotspot_vulnerability_type,
            wash_component_description,
            agency_ids = [],
            location_ids = [],
            funding_source_ids = [],
            sdg_ids = [],
            wash_component,
        } = data;

        const updateProjectQuery = `
            UPDATE Project SET 
                title = $1, status = $2, approval_fy = $3, beginning = $4, closing = $5,
                total_cost_usd = $6, gef_grant = $7, cofinancing = $8, wash_finance = $9,
                wash_finance_percent = $10, beneficiaries = $11, objectives = $12,
                direct_beneficiaries = $13, indirect_beneficiaries = $14,
                beneficiary_description = $15, gender_inclusion = $16, equity_marker = $17,
                equity_marker_description = $18, assessment = $19, alignment_nap = $20,
                alignment_cff = $21, geographic_division = $22, climate_relevance_score = $23,
                climate_relevance_category = $24, climate_relevance_justification = $25,
                hotspot_vulnerability_type = $26, wash_component_description = $27,
                updated_at = CURRENT_TIMESTAMP
            WHERE project_id = $28
            RETURNING *
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
            wash_finance,
            wash_finance_percent,
            beneficiaries,
            objectives,
            direct_beneficiaries,
            indirect_beneficiaries,
            beneficiary_description,
            gender_inclusion,
            equity_marker,
            equity_marker_description,
            assessment,
            alignment_nap,
            alignment_cff,
            geographic_division,
            climate_relevance_score,
            climate_relevance_category,
            climate_relevance_justification,
            hotspot_vulnerability_type,
            wash_component_description,
            id,
        ];

        const result = await client.query(updateProjectQuery, values);

        // Update WASH component
        if (wash_component) {
            const { presence, wash_percentage, description } = wash_component;
            const updateWASH = `
                INSERT INTO WASHComponent (project_id, presence, wash_percentage, description)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (project_id)
                DO UPDATE SET presence = $2, wash_percentage = $3, description = $4
            `;
            await client.query(updateWASH, [
                id,
                presence,
                wash_percentage || 0,
                description,
            ]);
        }

        // Update relationships
        await client.query("DELETE FROM ProjectAgency WHERE project_id = $1", [
            id,
        ]);
        await client.query(
            "DELETE FROM ProjectLocation WHERE project_id = $1",
            [id]
        );
        await client.query(
            "DELETE FROM ProjectFundingSource WHERE project_id = $1",
            [id]
        );
        await client.query("DELETE FROM ProjectSDG WHERE project_id = $1", [
            id,
        ]);

        for (const agency_id of agency_ids) {
            await client.query(
                "INSERT INTO ProjectAgency (project_id, agency_id) VALUES ($1, $2)",
                [id, agency_id]
            );
        }

        for (const location_id of location_ids) {
            await client.query(
                "INSERT INTO ProjectLocation (project_id, location_id) VALUES ($1, $2)",
                [id, location_id]
            );
        }

        for (const funding_source_id of funding_source_ids) {
            await client.query(
                "INSERT INTO ProjectFundingSource (project_id, funding_source_id) VALUES ($1, $2)",
                [id, funding_source_id]
            );
        }

        for (const sdg_id of sdg_ids) {
            await client.query(
                "INSERT INTO ProjectSDG (project_id, sdg_id) VALUES ($1, $2)",
                [id, sdg_id]
            );
        }

        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

Project.deleteProject = async (id) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM ProjectSDG WHERE project_id = $1", [
            id,
        ]);
        await client.query(
            "DELETE FROM ProjectFundingSource WHERE project_id = $1",
            [id]
        );
        await client.query(
            "DELETE FROM ProjectLocation WHERE project_id = $1",
            [id]
        );
        await client.query("DELETE FROM ProjectAgency WHERE project_id = $1", [
            id,
        ]);
        await client.query("DELETE FROM WASHComponent WHERE project_id = $1", [
            id,
        ]);
        await client.query("DELETE FROM Project WHERE project_id = $1", [id]);
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

Project.getOverviewStats = async () => {
    const query = `
        SELECT
            COUNT(*) AS total_projects,
            SUM(total_cost_usd) AS total_climate_finance,
            COUNT(*) FILTER (WHERE status = 'Active') AS active_projects,
            COUNT(*) FILTER (WHERE status = 'Implemented') AS completed_projects,
            AVG(climate_relevance_score) AS avg_climate_relevance
        FROM Project
    `;
    const { rows } = await pool.query(query);
    return rows[0];
};

Project.getProjectByStatus = async () => {
    const query = `
        SELECT status, COUNT(*) AS value
        FROM Project
        GROUP BY status
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        name: row.status,
        value: parseInt(row.value),
    }));
};

Project.getProjectTrend = async () => {
    const query = `
        SELECT approval_fy AS year, COUNT(*) AS total_projects
        FROM Project
        GROUP BY approval_fy
        ORDER BY approval_fy
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        year: row.year.toString(),
        projects: parseInt(row.total_projects),
    }));
};

Project.getRegionalDistribution = async () => {
    const query = `
        SELECT 
            p.geographic_division AS region,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE p.status = 'Active') AS active,
            COUNT(*) FILTER (WHERE p.status = 'Implemented' OR p.status = 'Completed') AS completed
        FROM Project p
        GROUP BY p.geographic_division
        ORDER BY p.geographic_division;
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        region: row.region,
        total: parseInt(row.total) || 0,
        active: parseInt(row.active) || 0,
        completed: parseInt(row.completed) || 0,
    }));
};


module.exports = Project;
