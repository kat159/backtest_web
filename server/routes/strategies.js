const express = require('express');
const router = express.Router();
const { 
    getStrategy, 
    getStrategyById, 
    addStrategy, 
    updateStrategyById, 
    deleteStrategyById,
    suggestAllWithNameAndUserId
} = require('../service/strategyService');
const { route } = require('./users');

/* GET users listing. */
router.get('/', getStrategy);
router.get('/:id', getStrategyById);
router.post('/', addStrategy);
router.put('/:id', updateStrategyById);
router.delete('/:id', deleteStrategyById);
router.post('/suggest', suggestAllWithNameAndUserId)

module.exports = router; 
 