const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const { getKPIs } = require("../controllers/KPIs.controller");

router.route("/").get(
    isAuthenticated,
    // checkRole("kbis"),
    getKPIs,
);

module.exports = router;
