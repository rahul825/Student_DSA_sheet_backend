const { Router } = require("express");
const controller = require("./plans.controller");

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.post("/auto", controller.autoPlan);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
