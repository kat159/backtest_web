const express = require('express');
const router = express.Router();
const { 
    getCriterion, 
    getCriterionById, 
    addCriterion, 
    updateCriterionById, 
    deleteCriterionById,
    suggestAllWithNameAndUserId
} = require('../service/criterionService');
const { route } = require('./users');

/* GET users listing. */
router.get('/', getCriterion);
router.get('/:id', getCriterionById);
router.post('/', addCriterion);
router.put('/:id', updateCriterionById);
router.delete('/:id', deleteCriterionById);
router.post('/suggest', suggestAllWithNameAndUserId)

module.exports = router; 
 