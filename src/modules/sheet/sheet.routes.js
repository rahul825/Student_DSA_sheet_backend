const { Router } = require("express");
const controller = require("./sheet.controller");

const router = Router();

router.get("/", controller.getSheet);

module.exports = router;
