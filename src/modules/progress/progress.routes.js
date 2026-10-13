const { Router } = require("express");
const controller = require("./progress.controller");

const router = Router();

router.get("/summary", controller.summary);
router.put("/:problemId", controller.update);

module.exports = router;
