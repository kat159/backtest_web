const express = require('express');
const router = express.Router();
const { 
    getbacktestLog, 
    getbacktestLogById, 
    addbacktestLog, 
    updatebacktestLogById, 
    deletebacktestLogById,
    suggestAllWithNameAndUserId
} = require('../service/backtestLogService');
const { route } = require('./users');

/* GET users listing. */
router.get('/', getbacktestLog);
router.get('/:id', getbacktestLogById);
router.post('/', addbacktestLog);
router.put('/:id', updatebacktestLogById);
router.delete('/:id', deletebacktestLogById);
router.post('/suggest', suggestAllWithNameAndUserId)

module.exports = router; 
 