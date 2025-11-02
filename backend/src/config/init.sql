-- Table: User
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Viewer', 'Super Admin', 'Project Manager', 'Finance Admin', 'Data Manager')),
    department VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL,
    last_login TIMESTAMP DEFAULT NULL
    );

-- Table: Project
CREATE TABLE IF NOT EXISTS Project (
    project_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    approval_fy INTEGER,
    beginning VARCHAR(50),
    closing VARCHAR(50),
    total_cost_usd DECIMAL(15,2),
    gef_grant DECIMAL(15,2),
    cofinancing DECIMAL(15,2),
    loan_amount Decimal(15,3),
    objectives TEXT,
    direct_beneficiaries INTEGER,
    indirect_beneficiaries INTEGER,
    beneficiary_description TEXT,
    gender_inclusion TEXT,
    equity_marker VARCHAR(50),
    equity_marker_description TEXT,
    assessment TEXT,
    alignment_nap TEXT,
    alignment_cff TEXT,
    geographic_division TEXT[],
    climate_relevance_score DECIMAL(5,2),
    climate_relevance_category VARCHAR(50),
    climate_relevance_justification TEXT,
    hotspot_vulnerability_type VARCHAR(255),
    wash_component_description TEXT,
    supporting_document VARCHAR(255),
    districts TEXT[],
    wash_component JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Table: PendingProject (for projects awaiting approval)
CREATE TABLE IF NOT EXISTS PendingProject (
                                              pending_id SERIAL PRIMARY KEY,
                                              title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    approval_fy INTEGER,
    beginning VARCHAR(50),
    closing VARCHAR(50),
    total_cost_usd DECIMAL(15,2),
    gef_grant DECIMAL(15,2),
    cofinancing DECIMAL(15,2),
    loan_amount Decimal(15,3),
    objectives TEXT,
    direct_beneficiaries INTEGER,
    indirect_beneficiaries INTEGER,
    beneficiary_description TEXT,
    gender_inclusion TEXT,
    equity_marker VARCHAR(50),
    equity_marker_description TEXT,
    assessment TEXT,
    alignment_nap TEXT,
    alignment_cff TEXT,
    geographic_division TEXT[],
    climate_relevance_score DECIMAL(5,2),
    climate_relevance_category VARCHAR(50),
    climate_relevance_justification TEXT,
    hotspot_vulnerability_type VARCHAR(255),
    wash_component_description TEXT,
    submitter_email VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agency_ids INTEGER[],
    funding_source_ids INTEGER[],
    sdg_ids INTEGER[],
    districts TEXT[],
    wash_component JSONB,
    supporting_document VARCHAR(255)
    );

-- Table: Agency
CREATE TABLE IF NOT EXISTS Agency (
      agency_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL
    );

-- Table: FundingSource
CREATE TABLE IF NOT EXISTS FundingSource (
     funding_source_id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
    dev_partner VARCHAR(255),
    type VARCHAR(100),
    grant_amount DECIMAL(15,2),
    loan_amount DECIMAL(15,2),
    counterpart_funding DECIMAL(15,2),
    disbursement DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    non_grant_instrument VARCHAR(50)
    );

-- Table: Location (District/Division)
CREATE TABLE IF NOT EXISTS Location (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100)
    );

-- Table: WASHComponent
CREATE TABLE IF NOT EXISTS WASHComponent (
     wash_id SERIAL PRIMARY KEY,
     project_id VARCHAR(50) NOT NULL UNIQUE,
    presence BOOLEAN NOT NULL,
    wash_percentage DECIMAL(5,2),
    description TEXT,
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE
    );

-- Table: SDGAlignment
CREATE TABLE IF NOT EXISTS SDGAlignment (
    sdg_id SERIAL PRIMARY KEY,
    sdg_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL
    );

-- Junction Table: ProjectAgency
CREATE TABLE IF NOT EXISTS ProjectAgency (
     project_id VARCHAR(50),
    agency_id INTEGER,
    PRIMARY KEY (project_id, agency_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (agency_id) REFERENCES Agency(agency_id) ON DELETE CASCADE
    );

-- Junction Table: ProjectFundingSource
CREATE TABLE IF NOT EXISTS ProjectFundingSource (
    project_id VARCHAR(50),
    funding_source_id INTEGER,
    PRIMARY KEY (project_id, funding_source_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (funding_source_id) REFERENCES FundingSource(funding_source_id) ON DELETE CASCADE
    );

-- Junction Table: ProjectLocation
CREATE TABLE IF NOT EXISTS ProjectLocation (
   project_id VARCHAR(50),
    location_id INTEGER,
    PRIMARY KEY (project_id, location_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES Location(location_id) ON DELETE CASCADE
    );

-- Junction Table: ProjectSDG
CREATE TABLE IF NOT EXISTS ProjectSDG (
  project_id VARCHAR(50),
    sdg_id INTEGER,
    PRIMARY KEY (project_id, sdg_id),
    FOREIGN KEY (project_id) REFERENCES Project(project_id) ON DELETE CASCADE,
    FOREIGN KEY (sdg_id) REFERENCES SDGAlignment(sdg_id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS DocumentRepository (
    repo_id SERIAL PRIMARY KEY,
    categories VARCHAR(255),
    Heading TEXT,
    sub_heading TEXT,
    Agency_name TEXT,
    document_size DECIMAL(5,2),
    document_link TEXT,
    programme_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PendingDocumentRepository (
      repo_id SERIAL PRIMARY KEY,
      categories VARCHAR(255),
      Heading TEXT,
      sub_heading TEXT,
      Agency_name TEXT,
      programme_code TEXT,
      document_size DECIMAL(5,2),
    document_link TEXT,
    submitter_email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_title ON Project(title);
CREATE INDEX IF NOT EXISTS idx_project_status ON Project(status);
CREATE INDEX IF NOT EXISTS idx_project_geographic_division ON Project(geographic_division);
CREATE INDEX IF NOT EXISTS idx_agency_name ON Agency(name);
CREATE INDEX IF NOT EXISTS idx_funding_source_name ON FundingSource(name);
CREATE INDEX IF NOT EXISTS idx_location_name ON Location(name);

-- Comments for documentation
COMMENT ON TABLE Project IS 'Stores information about environmental and climate projects in Bangladesh';
COMMENT ON TABLE Agency IS 'Stores information about implementing, executing, or accredited agencies';
COMMENT ON TABLE FundingSource IS 'Stores information about funding sources for projects';
COMMENT ON TABLE Location IS 'Stores project implementation locations (districts/divisions)';
COMMENT ON TABLE WASHComponent IS 'Stores WASH (Water, Sanitation, Hygiene) component details for projects';
COMMENT ON TABLE SDGAlignment IS 'Stores Sustainable Development Goals reference data';
COMMENT ON TABLE ProjectAgency IS 'Junction table for Project-Agency many-to-many relationship';
COMMENT ON TABLE ProjectFundingSource IS 'Junction table for Project-FundingSource many-to-many relationship';
COMMENT ON TABLE ProjectLocation IS 'Junction table for Project-Location many-to-many relationship';
COMMENT ON TABLE ProjectSDG IS 'Junction table for Project-SDG many-to-many relationship';
