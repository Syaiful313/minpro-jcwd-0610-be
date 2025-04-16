"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sample_controller_1 = require("../controllers/sample.controller");
const router = (0, express_1.Router)();
router.get("/", sample_controller_1.getSamplesController);
exports.default = router;
