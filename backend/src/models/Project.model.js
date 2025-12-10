const { pool } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const Project = {};

// Helper: parse array fields safely
const parseArrayField = (field, fieldName) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            // If it's a comma-separated string, split it
            if (field.includes(',')) {
                return field.split(',').map(s => s.trim()).filter(Boolean);
            }
            return field ? [field] : [];
        }
    }
    return [];
};

Project.addProjectWithRelations = async (data) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        let {
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
            alignment_nap,
            alignment_cff,
            geographic_division,
            climate_relevance_score,
            climate_relevance_category,
            climate_relevance_justification,
            wash_component_description,
            supporting_document,
            // New fields
            hotspot_types,
            vulnerability_type,
            additional_location_info,
            portfolio_type,
            funding_source_name,
            // New agency arrays (can be IDs or names)
            implementing_entity_ids,
            executing_agency_ids,
            delivery_partner_ids,
            // Existing relationships
            funding_source_ids,
            sdg_ids,
            districts,
            wash_component,
            sector,
            type,
            location_segregation,
            activities,
        } = data;

        // Parse array fields
        const parsedFundingSourceIds = parseArrayField(funding_source_ids, 'funding_source_ids');
        const parsedSdgIds = parseArrayField(sdg_ids, 'sdg_ids');
        const parsedDistricts = parseArrayField(districts, 'districts');
        const parsedGeographicDivision = parseArrayField(geographic_division, 'geographic_division');
        const parsedHotspotTypes = parseArrayField(hotspot_types, 'hotspot_types');
        const parsedImplementingEntityIds = parseArrayField(implementing_entity_ids, 'implementing_entity_ids');
        const parsedExecutingAgencyIds = parseArrayField(executing_agency_ids, 'executing_agency_ids');
        const parsedDeliveryPartnerIds = parseArrayField(delivery_partner_ids, 'delivery_partner_ids');
        const parsedType = parseArrayField(type, 'type');
        const parsedLocationSegregation = parseArrayField(location_segregation, 'location_segregation');
        const parsedActivities = parseArrayField(activities, 'activities');

        if (!title || !status || !approval_fy) {
            throw new Error("Missing required fields: title, status, approval_fy");
        }

        const project_id = uuidv4();

        const insertProjectQuery = `
            INSERT INTO Project (
                project_id, title, status, approval_fy, beginning, closing,
                total_cost_usd, gef_grant, cofinancing, loan_amount, objectives,
                direct_beneficiaries, indirect_beneficiaries, beneficiary_description,
                gender_inclusion, equity_marker, equity_marker_description,
                assessment, alignment_nap, alignment_cff, geographic_division,
                climate_relevance_score, climate_relevance_category,
                climate_relevance_justification, wash_component_description, supporting_document,
                districts, sector, type, location_segregation, activities,
                hotspot_types, vulnerability_type, additional_location_info,
                portfolio_type, funding_source_name
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
                $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
                $31,$32,$33,$34,$35,$36
            ) RETURNING *
        `;

        const values = [
            project_id,
            title,
            status,
            approval_fy,
            beginning || null,
            closing || null,
            parseFloat(total_cost_usd) || 0,
            parseFloat(gef_grant) || 0,
            parseFloat(cofinancing) || 0,
            parseFloat(loan_amount) || 0,
            objectives || null,
            parseInt(direct_beneficiaries) || 0,
            parseInt(indirect_beneficiaries) || 0,
            beneficiary_description || null,
            gender_inclusion || null,
            equity_marker || null,
            equity_marker_description || null,
            assessment || null,
            alignment_nap || null,
            alignment_cff || null,
            parsedGeographicDivision,
            parseFloat(climate_relevance_score) || 0,
            climate_relevance_category || null,
            climate_relevance_justification || null,
            wash_component_description || null,
            supporting_document || null,
            parsedDistricts,
            sector || null,
            parsedType,
            parsedLocationSegregation,
            parsedActivities,
            parsedHotspotTypes,
            vulnerability_type || null,
            additional_location_info || null,
            portfolio_type || null,
            funding_source_name || null,
        ];

        await client.query(insertProjectQuery, values);

        // --- WASH COMPONENT ---
        if (typeof wash_component === 'string') {
            wash_component = JSON.parse(wash_component);
        }

        if (wash_component && wash_component.presence) {
            const { presence, wash_percentage, description } = wash_component;
            await client.query(
                `INSERT INTO WASHComponent (project_id, presence, wash_percentage, description)
                 VALUES ($1, $2, $3, $4)`,
                [project_id, presence, parseFloat(wash_percentage) || 0, description]
            );
        }

        // --- IMPLEMENTING ENTITIES ---
        for (const entity_id of parsedImplementingEntityIds) {
            await client.query(
                "INSERT INTO projectimplementingentity (project_id, entity_id) VALUES ($1, $2)",
                [project_id, entity_id]
            );
        }

        // --- EXECUTING AGENCIES ---
        for (const agency_id of parsedExecutingAgencyIds) {
            await client.query(
                "INSERT INTO projectexecutingagency (project_id, agency_id) VALUES ($1, $2)",
                [project_id, agency_id]
            );
        }

        // --- DELIVERY PARTNERS ---
        for (const partner_id of parsedDeliveryPartnerIds) {
            await client.query(
                "INSERT INTO projectdeliverypartner (project_id, partner_id) VALUES ($1, $2)",
                [project_id, partner_id]
            );
        }

        // --- FUNDING SOURCES ---
        for (const funding_source_id of parsedFundingSourceIds) {
            await client.query(
                "INSERT INTO ProjectFundingSource (project_id, funding_source_id) VALUES ($1, $2)",
                [project_id, funding_source_id]
            );
        }

        // --- SDGs ---
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
};

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

        // Get implementing entities for all projects
        const implementingEntityQuery = `
            SELECT pie.project_id, ie.entity_id, ie.name as entity_name
            FROM projectimplementingentity pie
            INNER JOIN implementingentity ie ON pie.entity_id = ie.entity_id
        `;
        const implementingEntityResult = await client.query(implementingEntityQuery);

        // Get executing agencies for all projects
        const executingAgencyQuery = `
            SELECT pea.project_id, ea.agency_id, ea.name as agency_name
            FROM projectexecutingagency pea
            INNER JOIN executingagency ea ON pea.agency_id = ea.agency_id
        `;
        const executingAgencyResult = await client.query(executingAgencyQuery);

        // Get delivery partners for all projects
        const deliveryPartnerQuery = `
            SELECT pdp.project_id, dp.partner_id, dp.name as partner_name
            FROM projectdeliverypartner pdp
            INNER JOIN deliverypartner dp ON pdp.partner_id = dp.partner_id
        `;
        const deliveryPartnerResult = await client.query(deliveryPartnerQuery);

        // Get funding sources for all projects
        const fundingSourceQuery = `
            SELECT pfs.project_id, pfs.funding_source_id, fs.name as funding_source_name
            FROM ProjectFundingSource pfs
            INNER JOIN FundingSource fs ON pfs.funding_source_id = fs.funding_source_id
        `;
        const fundingSourceResult = await client.query(fundingSourceQuery);

        // Get SDGs for all projects
        const sdgQuery = `
            SELECT ps.project_id, ps.sdg_id, s.sdg_number, s.title
            FROM ProjectSDG ps
            INNER JOIN SDGAlignment s ON ps.sdg_id = s.sdg_id
        `;
        const sdgResult = await client.query(sdgQuery);

        // Build maps for quick lookup
        const implementingEntityMap = {};
        const executingAgencyMap = {};
        const deliveryPartnerMap = {};
        const fundingSourceMap = {};
        const sdgMap = {};

        implementingEntityResult.rows.forEach((row) => {
            if (!implementingEntityMap[row.project_id]) implementingEntityMap[row.project_id] = [];
            implementingEntityMap[row.project_id].push({
                id: row.entity_id,
                name: row.entity_name,
            });
        });

        executingAgencyResult.rows.forEach((row) => {
            if (!executingAgencyMap[row.project_id]) executingAgencyMap[row.project_id] = [];
            executingAgencyMap[row.project_id].push({
                id: row.agency_id,
                name: row.agency_name,
            });
        });

        deliveryPartnerResult.rows.forEach((row) => {
            if (!deliveryPartnerMap[row.project_id]) deliveryPartnerMap[row.project_id] = [];
            deliveryPartnerMap[row.project_id].push({
                id: row.partner_id,
                name: row.partner_name,
            });
        });

        fundingSourceResult.rows.forEach((row) => {
            if (!fundingSourceMap[row.project_id]) fundingSourceMap[row.project_id] = [];
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
                implementing_entities: implementingEntityMap[row.project_id] || [],
                executing_agencies: executingAgencyMap[row.project_id] || [],
                delivery_partners: deliveryPartnerMap[row.project_id] || [],
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

Project.updateProject = async (id, data) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        let {
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
            alignment_nap,
            alignment_cff,
            geographic_division,
            climate_relevance_score,
            climate_relevance_category,
            climate_relevance_justification,
            wash_component_description,
            supporting_document,
            // New fields
            hotspot_types,
            vulnerability_type,
            additional_location_info,
            portfolio_type,
            funding_source_name,
            // New agency arrays
            implementing_entity_ids,
            executing_agency_ids,
            delivery_partner_ids,
            // Existing relationships
            funding_source_ids,
            sdg_ids,
            districts,
            wash_component,
            sector,
            type,
            location_segregation,
            activities,
        } = data;

        // Parse array fields
        const parsedFundingSourceIds = parseArrayField(funding_source_ids, 'funding_source_ids');
        const parsedSdgIds = parseArrayField(sdg_ids, 'sdg_ids');
        const parsedDistricts = parseArrayField(districts, 'districts');
        const parsedGeographicDivision = parseArrayField(geographic_division, 'geographic_division');
        const parsedHotspotTypes = parseArrayField(hotspot_types, 'hotspot_types');
        const parsedImplementingEntityIds = parseArrayField(implementing_entity_ids, 'implementing_entity_ids');
        const parsedExecutingAgencyIds = parseArrayField(executing_agency_ids, 'executing_agency_ids');
        const parsedDeliveryPartnerIds = parseArrayField(delivery_partner_ids, 'delivery_partner_ids');
        const parsedType = parseArrayField(type, 'type');
        const parsedLocationSegregation = parseArrayField(location_segregation, 'location_segregation');
        const parsedActivities = parseArrayField(activities, 'activities');

        const updateProjectQuery = `
            UPDATE Project SET 
                title = $1, status = $2, approval_fy = $3, beginning = $4, closing = $5,
                total_cost_usd = $6, gef_grant = $7, cofinancing = $8, objectives = $9,
                direct_beneficiaries = $10, indirect_beneficiaries = $11,
                beneficiary_description = $12, gender_inclusion = $13, equity_marker = $14,
                equity_marker_description = $15, assessment = $16, alignment_nap = $17,
                alignment_cff = $18, geographic_division = $19, climate_relevance_score = $20,
                climate_relevance_category = $21, climate_relevance_justification = $22,
                wash_component_description = $23, supporting_document = $24,
                districts = $25, loan_amount = $26, sector = $27, type = $28,
                location_segregation = $29, activities = $30,
                hotspot_types = $31, vulnerability_type = $32, additional_location_info = $33,
                portfolio_type = $34, funding_source_name = $35,
                updated_at = CURRENT_TIMESTAMP
            WHERE project_id = $36
            RETURNING *
        `;

        const values = [
            title,
            status,
            approval_fy,
            beginning || null,
            closing || null,
            parseFloat(total_cost_usd) || 0,
            parseFloat(gef_grant) || 0,
            parseFloat(cofinancing) || 0,
            objectives || null,
            parseInt(direct_beneficiaries, 10) || 0,
            parseInt(indirect_beneficiaries, 10) || 0,
            beneficiary_description || null,
            gender_inclusion || null,
            equity_marker || null,
            equity_marker_description || null,
            assessment || null,
            alignment_nap || null,
            alignment_cff || null,
            parsedGeographicDivision,
            parseFloat(climate_relevance_score) || 0,
            climate_relevance_category || null,
            climate_relevance_justification || null,
            wash_component_description || null,
            supporting_document || null,
            parsedDistricts,
            parseFloat(loan_amount) || 0,
            sector || null,
            parsedType,
            parsedLocationSegregation,
            parsedActivities,
            parsedHotspotTypes,
            vulnerability_type || null,
            additional_location_info || null,
            portfolio_type || null,
            funding_source_name || null,
            id,
        ];

        await client.query(updateProjectQuery, values);

        // Update WASH component
        if (wash_component && typeof wash_component === 'string') {
            wash_component = JSON.parse(wash_component);
        }

        if (wash_component && wash_component.presence) {
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
                parseFloat(wash_percentage) || 0,
                description,
            ]);
        }

        // Update relationships - delete old and insert new
        await client.query("DELETE FROM projectimplementingentity WHERE project_id = $1", [id]);
        await client.query("DELETE FROM projectexecutingagency WHERE project_id = $1", [id]);
        await client.query("DELETE FROM projectdeliverypartner WHERE project_id = $1", [id]);
        await client.query("DELETE FROM ProjectFundingSource WHERE project_id = $1", [id]);
        await client.query("DELETE FROM ProjectSDG WHERE project_id = $1", [id]);

        // Insert implementing entities
        for (const entity_id of parsedImplementingEntityIds) {
            await client.query(
                "INSERT INTO projectimplementingentity (project_id, entity_id) VALUES ($1, $2)",
                [id, entity_id]
            );
        }

        // Insert executing agencies
        for (const agency_id of parsedExecutingAgencyIds) {
            await client.query(
                "INSERT INTO projectexecutingagency (project_id, agency_id) VALUES ($1, $2)",
                [id, agency_id]
            );
        }

        // Insert delivery partners
        for (const partner_id of parsedDeliveryPartnerIds) {
            await client.query(
                "INSERT INTO projectdeliverypartner (project_id, partner_id) VALUES ($1, $2)",
                [id, partner_id]
            );
        }

        // Insert funding sources
        for (const funding_source_id of parsedFundingSourceIds) {
            await client.query(
                "INSERT INTO ProjectFundingSource (project_id, funding_source_id) VALUES ($1, $2)",
                [id, funding_source_id]
            );
        }

        // Insert SDGs
        for (const sdg_id of parsedSdgIds) {
            await client.query(
                "INSERT INTO ProjectSDG (project_id, sdg_id) VALUES ($1, $2)",
                [id, sdg_id]
            );
        }

        await client.query("COMMIT");
        return { project_id: id, status: true, message: "Project updated successfully" };

    } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Server Error: ${err.message}`);
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

        // Get implementing entities
        const implementingEntitiesQuery = `
            SELECT ie.entity_id as id, ie.name
            FROM implementingentity ie
            INNER JOIN projectimplementingentity pie ON ie.entity_id = pie.entity_id
            WHERE pie.project_id = $1
        `;
        const implementingEntitiesResult = await client.query(implementingEntitiesQuery, [id]);

        // Get executing agencies
        const executingAgenciesQuery = `
            SELECT ea.agency_id as id, ea.name
            FROM executingagency ea
            INNER JOIN projectexecutingagency pea ON ea.agency_id = pea.agency_id
            WHERE pea.project_id = $1
        `;
        const executingAgenciesResult = await client.query(executingAgenciesQuery, [id]);

        // Get delivery partners
        const deliveryPartnersQuery = `
            SELECT dp.partner_id as id, dp.name
            FROM deliverypartner dp
            INNER JOIN projectdeliverypartner pdp ON dp.partner_id = pdp.partner_id
            WHERE pdp.project_id = $1
        `;
        const deliveryPartnersResult = await client.query(deliveryPartnersQuery, [id]);

        // Get funding sources
        const fundingSourcesQuery = `
            SELECT fs.funding_source_id, fs.name, fs.dev_partner, fs.grant_amount, fs.loan_amount
            FROM FundingSource fs
            INNER JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
            WHERE pfs.project_id = $1
        `;
        const fundingSourcesResult = await client.query(fundingSourcesQuery, [id]);

        // Get SDGs
        const sdgsQuery = `
            SELECT s.sdg_id, s.sdg_number, s.title
            FROM SDGAlignment s
            INNER JOIN ProjectSDG ps ON s.sdg_id = ps.sdg_id
            WHERE ps.project_id = $1
        `;
        const sdgsResult = await client.query(sdgsQuery, [id]);

        const { presence, wash_percentage, description, ...projectData } = project;

        return {
            ...projectData,
            // IDs for form binding
            implementing_entity_ids: implementingEntitiesResult.rows.map((row) => row.id),
            executing_agency_ids: executingAgenciesResult.rows.map((row) => row.id),
            delivery_partner_ids: deliveryPartnersResult.rows.map((row) => row.id),
            funding_sources: fundingSourcesResult.rows.map((row) => row.funding_source_id),
            sdgs: sdgsResult.rows.map((row) => row.sdg_id),
            // Full objects for display
            projectImplementingEntities: implementingEntitiesResult.rows,
            projectExecutingAgencies: executingAgenciesResult.rows,
            projectDeliveryPartners: deliveryPartnersResult.rows,
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

Project.deleteProject = async (id) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("DELETE FROM ProjectSDG WHERE project_id = $1", [id]);
        await client.query("DELETE FROM ProjectFundingSource WHERE project_id = $1", [id]);
        await client.query("DELETE FROM ProjectLocation WHERE project_id = $1", [id]);
        await client.query("DELETE FROM projectimplementingentity WHERE project_id = $1", [id]);
        await client.query("DELETE FROM projectexecutingagency WHERE project_id = $1", [id]);
        await client.query("DELETE FROM projectdeliverypartner WHERE project_id = $1", [id]);
        await client.query("DELETE FROM WASHComponent WHERE project_id = $1", [id]);
        await client.query("DELETE FROM Project WHERE project_id = $1", [id]);
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

// ================== STATISTICS METHODS ==================

Project.getOverviewStats = async () => {
    const query = `
        SELECT
            COUNT(*) AS total_projects,
            SUM(p.total_cost_usd) AS total_climate_finance,
            COUNT(*) FILTER (WHERE p.status = 'Active') AS active_projects,
            COUNT(*) FILTER (WHERE p.status = 'Completed') AS completed_projects,
            AVG(p.climate_relevance_score) AS avg_climate_relevance,
            SUM(p.total_cost_usd * COALESCE(wc.wash_percentage/100, 0)) AS total_wash_finance
        FROM Project p
        LEFT JOIN WASHComponent wc ON p.project_id = wc.project_id
    `;
    const { rows } = await pool.query(query);
    return rows[0];
};

Project.getProjectsOverviewStats = async () => {
    const query = `
        SELECT
            COUNT(*) AS total_projects,
            SUM(p.total_cost_usd) AS total_climate_finance,
            COUNT(*) FILTER (WHERE p.status = 'Active') AS active_projects,
            COUNT(*) FILTER (WHERE p.status = 'Pipeline') AS pipeline_projects,
            COUNT(*) FILTER (WHERE p.status = 'Completed') AS completed_projects,
            SUM(p.gef_grant) AS total_gef_grant,
            SUM(p.cofinancing) AS total_cofinancing,
            SUM(p.loan_amount) AS total_loan
        FROM Project p
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

Project.getProjectBySector = async () => {
    const query = `
        SELECT sector, COUNT(*) AS value
        FROM Project
        WHERE sector IS NOT NULL AND sector <> ''
        GROUP BY sector
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        name: row.sector || 'Unknown',
        value: parseInt(row.value),
    }));
};

Project.getProjectByType = async () => {
    const query = `
        SELECT 
            unnest(type) AS project_type,
            COUNT(*) AS value
        FROM Project
        WHERE type IS NOT NULL AND array_length(type, 1) > 0
        GROUP BY project_type
    `;
    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        name: row.project_type,
        value: parseInt(row.value),
    }));
};

Project.getProjectTrend = async () => {
    const query = `
        SELECT 
            SUBSTRING(beginning, 1, 4) AS year,
            COUNT(*) AS total_projects
        FROM Project
        WHERE beginning IS NOT NULL AND beginning <> ''
        GROUP BY year
        ORDER BY year;
    `;

    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        year: row.year,
        projects: parseInt(row.total_projects),
    }));
};

Project.getClimateFinanceTrend = async () => {
    const query = `
        SELECT 
            SUBSTRING(beginning, 1, 4) AS year,
            SUM(total_cost_usd) AS total_cost_usd
        FROM Project
        WHERE beginning IS NOT NULL AND beginning <> ''
        GROUP BY year
        ORDER BY year;
    `;

    const { rows } = await pool.query(query);
    return rows.map((row) => ({
        year: row.year,
        Total_Finance: parseFloat(row.total_cost_usd),
    }));
};

Project.getWashStat = async () => {
    const query = `
        SELECT
            COUNT(DISTINCT p.project_id) AS total_projects,
            ROUND(SUM(p.total_cost_usd)::numeric, 2) AS total_budget_usd,
            COUNT(DISTINCT CASE WHEN w.presence = TRUE THEN p.project_id END) AS wash_projects,
            ROUND(
                SUM(
                    CASE 
                        WHEN w.presence = TRUE 
                        THEN p.total_cost_usd * (w.wash_percentage / 100.0)
                    END
                )::numeric, 
                2
            ) AS wash_budget_usd
        FROM Project p
        LEFT JOIN WASHComponent w ON p.project_id = w.project_id;
    `;

    const { rows } = await pool.query(query);
    return rows;
};

Project.getRegionalDistribution = async () => {
    const query = `
        SELECT 
            region,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'Active') AS active,
            COUNT(*) FILTER (WHERE status IN ('Implemented', 'Completed')) AS completed
        FROM (
            SELECT 
                unnest(p.geographic_division) AS region,
                p.status
            FROM Project p
        ) AS sub
        GROUP BY region
        ORDER BY region;
    `;

    const { rows } = await pool.query(query);
    return rows.map(row => ({
        region: row.region,
        total: parseInt(row.total) || 0,
        active: parseInt(row.active) || 0,
        completed: parseInt(row.completed) || 0,
    }));
};

Project.getDistrictProjectDistribution = async () => {
    const query = `
        SELECT 
            region,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'Active') AS active,
            COUNT(*) FILTER (WHERE status IN ('Implemented', 'Completed')) AS completed
        FROM (
            SELECT 
                unnest(p.districts) AS region,
                p.status
            FROM Project p
        ) AS sub
        GROUP BY region
        ORDER BY region;
    `;

    const { rows } = await pool.query(query);
    return rows.map(row => ({
        region: row.region,
        total: parseInt(row.total) || 0,
        active: parseInt(row.active) || 0,
        completed: parseInt(row.completed) || 0,
    }));
};

// ================== FUNDING SOURCE STATISTICS ==================

Project.getFundingSourceByType = async () => {
    const query = `
        SELECT 
            fs.name,
            COUNT(DISTINCT pfs.project_id) AS project_count,
            SUM(p.total_cost_usd) AS total_finance
        FROM FundingSource fs
        INNER JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        INNER JOIN Project p ON pfs.project_id = p.project_id
        GROUP BY fs.name
        ORDER BY total_finance DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        name: row.name,
        project_count: parseInt(row.project_count),
        total_finance: parseFloat(row.total_finance) || 0,
    }));
};

Project.getFundingSourceOverviewStats = async () => {
    const query = `
        SELECT 
            COUNT(DISTINCT fs.funding_source_id) AS total_funding_sources,
            COUNT(DISTINCT pfs.project_id) AS projects_with_funding,
            SUM(p.total_cost_usd) AS total_finance
        FROM FundingSource fs
        LEFT JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        LEFT JOIN Project p ON pfs.project_id = p.project_id
    `;
    const { rows } = await pool.query(query);
    return rows[0];
};

Project.getFundingSourceTrend = async () => {
    const query = `
        SELECT 
            SUBSTRING(p.beginning, 1, 4) AS year,
            fs.name AS funding_source,
            SUM(p.total_cost_usd) AS total_finance
        FROM Project p
        INNER JOIN ProjectFundingSource pfs ON p.project_id = pfs.project_id
        INNER JOIN FundingSource fs ON pfs.funding_source_id = fs.funding_source_id
        WHERE p.beginning IS NOT NULL AND p.beginning <> ''
        GROUP BY year, fs.name
        ORDER BY year
    `;
    const { rows } = await pool.query(query);
    return rows;
};

Project.getFundingSourceSectorAllocation = async () => {
    const query = `
        SELECT 
            fs.name AS funding_source,
            p.sector,
            COUNT(DISTINCT p.project_id) AS project_count,
            SUM(p.total_cost_usd) AS total_finance
        FROM FundingSource fs
        INNER JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        INNER JOIN Project p ON pfs.project_id = p.project_id
        WHERE p.sector IS NOT NULL AND p.sector <> ''
        GROUP BY fs.name, p.sector
        ORDER BY fs.name, total_finance DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

Project.getFundingSource = async () => {
    const query = `
        SELECT 
            fs.funding_source_id,
            fs.name,
            fs.dev_partner,
            COUNT(DISTINCT pfs.project_id) AS project_count,
            COALESCE(SUM(p.total_cost_usd), 0) AS total_finance
        FROM FundingSource fs
        LEFT JOIN ProjectFundingSource pfs ON fs.funding_source_id = pfs.funding_source_id
        LEFT JOIN Project p ON pfs.project_id = p.project_id
        GROUP BY fs.funding_source_id, fs.name, fs.dev_partner
        ORDER BY total_finance DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// ================== HOTSPOT STATISTICS ==================

Project.getProjectByHotspot = async () => {
    const query = `
        SELECT 
            hotspot,
            COUNT(*) AS value
        FROM (
            SELECT unnest(hotspot_types) AS hotspot
            FROM Project
            WHERE hotspot_types IS NOT NULL AND array_length(hotspot_types, 1) > 0
        ) AS sub
        GROUP BY hotspot
        ORDER BY value DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        name: row.hotspot,
        value: parseInt(row.value),
    }));
};

Project.getProjectByVulnerabilityType = async () => {
    const query = `
        SELECT 
            vulnerability_type,
            COUNT(*) AS value
        FROM Project
        WHERE vulnerability_type IS NOT NULL AND vulnerability_type <> ''
        GROUP BY vulnerability_type
        ORDER BY value DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        name: row.vulnerability_type,
        value: parseInt(row.value),
    }));
};

Project.getProjectByPortfolioType = async () => {
    const query = `
        SELECT 
            portfolio_type,
            COUNT(*) AS value
        FROM Project
        WHERE portfolio_type IS NOT NULL AND portfolio_type <> ''
        GROUP BY portfolio_type
        ORDER BY value DESC
    `;
    const { rows } = await pool.query(query);
    return rows.map(row => ({
        name: row.portfolio_type,
        value: parseInt(row.value),
    }));
};

// ================== AGENCY STATISTICS ==================

Project.getImplementingEntityStats = async () => {
    const query = `
        SELECT 
            ie.entity_id as id,
            ie.name,
            COUNT(DISTINCT pie.project_id) AS project_count,
            COALESCE(SUM(p.total_cost_usd), 0) AS total_finance
        FROM implementingentity ie
        LEFT JOIN projectimplementingentity pie ON ie.entity_id = pie.entity_id
        LEFT JOIN Project p ON pie.project_id = p.project_id
        GROUP BY ie.entity_id, ie.name
        ORDER BY project_count DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

Project.getExecutingAgencyStats = async () => {
    const query = `
        SELECT 
            ea.agency_id as id,
            ea.name,
            COUNT(DISTINCT pea.project_id) AS project_count,
            COALESCE(SUM(p.total_cost_usd), 0) AS total_finance
        FROM executingagency ea
        LEFT JOIN projectexecutingagency pea ON ea.agency_id = pea.agency_id
        LEFT JOIN Project p ON pea.project_id = p.project_id
        GROUP BY ea.agency_id, ea.name
        ORDER BY project_count DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

Project.getDeliveryPartnerStats = async () => {
    const query = `
        SELECT 
            dp.partner_id as id,
            dp.name,
            COUNT(DISTINCT pdp.project_id) AS project_count,
            COALESCE(SUM(p.total_cost_usd), 0) AS total_finance
        FROM deliverypartner dp
        LEFT JOIN projectdeliverypartner pdp ON dp.partner_id = pdp.partner_id
        LEFT JOIN Project p ON pdp.project_id = p.project_id
        GROUP BY dp.partner_id, dp.name
        ORDER BY project_count DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

module.exports = Project;
