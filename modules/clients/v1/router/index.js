const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");

// Protected Client Routes
router.get("/get-all-clients", authCheck, Controller.getAllClients);
router.get("/:id", authCheck, Controller.getClientById);
router.post("/create-client", authCheck, Controller.createClient);
router.put("/:clientId", authCheck, Controller.updateClient);
router.delete("/:clientId", authCheck, Controller.deleteClient);

module.exports = router;
