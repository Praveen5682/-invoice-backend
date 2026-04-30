const express = require("express");
const router = express.Router();
const controller = require("../controller/index");
const authCheck = require("../../../../middleware/authCheck");
const upload = require("../../../../middleware/upload");

router.get("/", authCheck, controller.getSettings);
router.put("/update", authCheck, controller.updateSettings);
router.put("/change-password", authCheck, controller.changePassword);
router.post("/upload-logo", authCheck, upload.single("logo"), controller.uploadLogo);

module.exports = router;
