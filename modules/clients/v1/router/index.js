const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Client Routes
router.get("/", authCheck, Controller.getAllClients);
router.get("/:id", authCheck, Controller.getClientById);
router.post("/", authCheck, Controller.createClient);
router.put("/:id", authCheck, Controller.updateClient);
router.delete("/:id", authCheck, Controller.deleteClient);

module.exports = router;
