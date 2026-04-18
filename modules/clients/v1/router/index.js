const express = require("express");
const router = express.Router();
const clientController = require("../controller");

router.post("/", clientController.addClient);
router.get("/", clientController.listClients);
router.get("/:id", clientController.getClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;
