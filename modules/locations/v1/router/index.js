const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// routes/location.routes.js

router.get("/states", Controller.getStates);
router.get("/cities/:stateId", Controller.getCities);

module.exports = router;
