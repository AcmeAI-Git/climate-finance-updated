const express = require("express");
const {addProject, getAllProjects, updateProject, deleteProject, getProjectById, getProjectsOverviewStats,
    getProjectByStatus, getProjectBySector, getProjectTrend, getProjectByType, getOverViewStats,
    getRegionalDistribution, getFundingSourceByType, getFundingSourceOverview, getFundingSourceTrend, 
    getFundingSourceSectorAllocation, getFundingSource, getDistrictProjectDistribution, getClimateFinanceTrend
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
