const express = require("express");
const {addProject, getAllProjects, updateProject, deleteProject, getProjectById, getProjectsOverviewStats,
    getProjectByStatus, getProjectBySector, getProjectTrend, getProjectByType, getOverViewStats,
    getRegionalDistribution, getFundingSourceByType, getFundingSourceOverview, getFundingSourceTrend, 
    getFundingSourceSectorAllocation, getFundingSource, getDistrictProjectDistribution, getClimateFinanceTrend,
    getWASHStat, getProjectByHotspot, getProjectByVulnerabilityType, getProjectByPortfolioType,
    getImplementingEntityStats, getExecutingAgencyStats, getDeliveryPartnerStats
} = require("../controllers/project.controller");

const router = express.Router();

router.post("/add-project", addProject);
router.get('/all-project', getAllProjects);
router.put('/update/:id', updateProject);
router.delete('/delete/:id', deleteProject);
router.get('/get/:id', getProjectById);
//projects
router.get('/projectsOverviewStats', getProjectsOverviewStats)
router.get('/get-project-by-status', getProjectByStatus)
router.get('/get-project-by-sector', getProjectBySector)
router.get('/get-project-by-trend', getProjectTrend)
router.get('/get-climate-finance-by-trend', getClimateFinanceTrend)
router.get('/get-project-by-type', getProjectByType)
router.get('/get-wash-stat', getWASHStat)
router.get('/get-project-by-hotspot', getProjectByHotspot)
router.get('/get-project-by-vulnerability-type', getProjectByVulnerabilityType)
router.get('/get-project-by-portfolio-type', getProjectByPortfolioType)
router.get('/get-implementing-entity-stats', getImplementingEntityStats)
router.get('/get-executing-agency-stats', getExecutingAgencyStats)
router.get('/get-delivery-partner-stats', getDeliveryPartnerStats)
//dashboard
router.get('/get-overview-stat', getOverViewStats)
router.get('/get-regional-distribution', getRegionalDistribution)
router.get('/get-district-project-distribution', getDistrictProjectDistribution)

// Funding Source Analytics (keep these in project routes for now)
router.get('/get-funding-source-by-type', getFundingSourceByType);
router.get('/get-funding-source-overview', getFundingSourceOverview);
router.get('/get-funding-source-trend', getFundingSourceTrend);
router.get('/get-funding-source-sector-allocation', getFundingSourceSectorAllocation);
router.get('/get-funding-source', getFundingSource);

module.exports = router;
