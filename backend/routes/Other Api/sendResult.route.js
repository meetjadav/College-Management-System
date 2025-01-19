const express = require("express");
const router = express.Router();
const { sendResultEmail } = require("../../controllers/Other/sendResult.controller");

router.post("/", sendResultEmail);

module.exports = router;
