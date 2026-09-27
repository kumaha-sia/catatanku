"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goalController_1 = require("../controllers/goalController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.route('/')
    .get(goalController_1.getGoals)
    .post(goalController_1.createGoal);
router.route('/:id')
    .put(goalController_1.updateGoal)
    .delete(goalController_1.deleteGoal);
exports.default = router;
