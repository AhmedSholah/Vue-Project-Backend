const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const { getKPIs } = require("../controllers/KPIs.controller");
const checkPermission = require("../middlewares/checkPermission");

router.route("/").get(isAuthenticated, checkPermission("kpis"), getKPIs);

module.exports = router;
