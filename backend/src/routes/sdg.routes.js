const express = require("express");
const router = express.Router();
const controller = require("../controllers/sdg.controller");

router.post("/add", controller.addSDG);
router.get("/all", controller.getAllSDGs);
router.put("/update/:id", controller.updateSDG);
router.delete("/delete/:id", controller.deleteSDG);
router.get("/get/:id", controller.getSDGById);

module.exports = router;
