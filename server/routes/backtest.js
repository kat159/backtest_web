const express = require('express');
const router = express.Router();
const { backtest } = require('../service/backtestService');


router.post('/', backtest);

module.exports = router; 