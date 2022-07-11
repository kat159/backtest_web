const express = require('express');
const router = express.Router();
const { 
    getStrategies, 
    getStrategyById, 
    addStrategy, 
    updateStrategyById, 
    deleteStrategyById,
} = require('../service/strategyService');

/* GET users listing. */
router.get('/', getStrategies);
router.get('/:id', getStrategyById);
router.post('/', addStrategy);
router.put('/:id', updateStrategyById);
router.delete('/:id', deleteStrategyById);

module.exports = router; 
 