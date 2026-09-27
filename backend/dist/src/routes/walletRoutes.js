"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.route('/')
    .get(walletController_1.getWallets)
    .post(walletController_1.createWallet);
router.route('/:id')
    .put(walletController_1.updateWallet)
    .delete(walletController_1.deleteWallet);
exports.default = router;
