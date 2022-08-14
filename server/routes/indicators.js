const express = require('express');
const router = express.Router();
const {formulaCalculator} = require('../service/indicatorService')


router.post('/formula_calculator', formulaCalculator);

module.exports = router; 