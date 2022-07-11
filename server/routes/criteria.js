const express = require('express');
const router = express.Router();
const { 
    getCriterion, 
    getCriterionById, 
    addCriterion, 
    updateCriterionById, 
    deleteCriterionById,
} = require('../service/criterionService');

/* GET users listing. */
router.get('/', getCriterion);
router.get('/:id', getCriterionById);
router.post('/', addCriterion);
router.put('/:id', updateCriterionById);
router.delete('/:id', deleteCriterionById);

module.exports = router; 
 