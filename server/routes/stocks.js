const express = require('express');
const router = express.Router();
const {getBySymbol} = require('../service/stocksService')


router.post('/', getBySymbol);

module.exports = router; 